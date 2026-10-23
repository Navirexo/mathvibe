import { describe, expect, it } from "vitest";
import {
  appendHistory,
  evaluateExpression,
  formatHistoryEntry,
  formatScientificReport,
  clearEntry,
  insertReciprocal,
  insertSquare,
  toggleSign,
} from "@/lib/scientific";

function value(input: string, mode: "deg" | "rad" = "deg", ans: number | null = null) {
  const evaluation = evaluateExpression(input, mode, ans);
  expect(evaluation.status).toBe("ok");
  if (evaluation.status !== "ok") {
    throw new Error(evaluation.status);
  }
  return evaluation;
}

describe("scientific calculator", () => {
  it("follows operator precedence and parentheses", () => {
    expect(value("2+3*4").result).toBe("14");
    expect(value("2+3×4").result).toBe("14");
    expect(value("(2+3)*4").result).toBe("20");
    expect(value("10/4").result).toBe("2.5");
    expect(value("10÷4").result).toBe("2.5");
    expect(value("2^3").result).toBe("8");
    expect(value("5-8").result).toBe("-3");
    expect(value("5−8").result).toBe("-3");
    expect(value("8/2/2").result).toBe("2");
  });

  it("evaluates powers from the right and supports roots", () => {
    expect(value("2^3^2").result).toBe("512");
    expect(value("2^(3^2)").result).toBe("512");
    expect(value("(2^3)^2").result).toBe("64");
    expect(value("sqrt(81)").result).toBe("9");
    expect(value("sqrt(9)").result).toBe("3");
    expect(value("cbrt(27)").result).toBe("3");
    expect(value("cbrt(-8)").result).toBe("-2");
  });

  it("reads scientific notation without using eval", () => {
    expect(value("6.02e23").result).toContain("6.02");
    expect(value("6.02e23").scientific).toContain("10²³");
    expect(value("1.5e-3").result).toBe("0.0015");
  });

  it("switches trigonometric results between degrees and radians", () => {
    expect(value("sin(30)", "deg").result).toBe("0.5");
    expect(value("cos(60)", "deg").result).toBe("0.5");
    expect(value("tan(45)", "deg").result).toBe("1");
    expect(value("asin(0.5)", "deg").result).toBe("30°");
    expect(value("acos(0.5)", "deg").result).toBe("60°");
    expect(value("atan(1)", "deg").result).toBe("45°");
    expect(value("sin(pi/6)", "rad").result).toBe("0.5");
    expect(Number(value("sin(30)", "rad").result)).toBeCloseTo(Math.sin(30), 8);
    expect(value("acos(0.5)", "rad").result).toMatch(/rad$/);
    expect(value("sin(pi/6)", "deg").result).not.toBe("0.5");
  });

  it("evaluates logarithms, powers of e and ten, reciprocal, square, percent, and factorial", () => {
    expect(value("ln(1)").result).toBe("0");
    expect(value("log(100)").result).toBe("2");
    expect(value("exp(1)").result.startsWith("2.718281828")).toBe(true);
    expect(value("10^2").result).toBe("100");
    expect(value("5^2").result).toBe("25");
    expect(value("1/(5)").result).toBe("0.2");
    expect(value("50%").result).toBe("0.5");
    expect(value("200+10%").result).toBe("200.1");
    expect(value("200*10%").result).toBe("20");
    expect(value("5!").result).toBe("120");
    expect(value("0!").result).toBe("1");
    expect(value("abs(-4)").result).toBe("4");
    expect(value("Ans+1", "deg", 5).result).toBe("6");
  });

  it("rejects invalid input and division by zero", () => {
    expect(evaluateExpression("", "deg").status).toBe("empty");
    expect(evaluateExpression("2+", "deg").status).toBe("incomplete");
    expect(evaluateExpression("1/0", "deg")).toMatchObject({
      status: "invalid",
      message: "Division by zero is undefined.",
    });
    expect(evaluateExpression("tan(90)", "deg").status).toBe("invalid");
    expect(evaluateExpression("sqrt(-1)", "deg").status).toBe("invalid");
    expect(evaluateExpression("log(0)", "deg").status).toBe("invalid");
    expect(evaluateExpression("asin(2)", "deg").status).toBe("invalid");
    expect(evaluateExpression("(-2)!", "deg").status).toBe("invalid");
    expect(evaluateExpression("1.5!", "deg").status).toBe("invalid");
    expect(evaluateExpression("Ans", "deg", null).status).toBe("invalid");
  });

  it("keeps each step equal to the calculated result", () => {
    const evaluation = value("2+3*4");
    expect(evaluation.steps.map((step) => step.body).join(" ")).toContain("14");
    expect(evaluation.steps.map((step) => step.body).join(" ")).toContain(evaluation.result);
    expect(evaluation.steps.map((step) => step.title).join(" ")).not.toContain("angle");
  });

  it("writes a detailed copy report without an angle section for arithmetic", () => {
    const evaluation = value("2+3");
    const report = formatScientificReport("2+3", "deg", evaluation, 9);
    expect(report).toContain("Scientific Calculator Result");
    expect(report).toContain("Expression: 2+3");
    expect(report).toContain("Result: 5");
    expect(report).toContain("Scientific notation: 5 × 10⁰");
    expect(report).not.toContain("Angle mode");
    expect(report).not.toContain("Previous answer");
    expect(report).toContain("2+3 = 5.");
    expect(report).not.toContain("55");

    const product = formatScientificReport("2+3*4", "deg", value("2+3*4"));
    expect(product).toContain("Expression: 2+3×4");
    expect(product).toContain("Result: 14");
    expect(product).toContain("Scientific notation: 1.4 × 10¹");
    expect(product).toContain("2+3×4 = 14.");
    expect(product).toContain("Multiplication and division happen before addition and subtraction.");
    expect(product).not.toContain("Angle mode");
    expect(product).not.toContain("141");
    expect(product).not.toContain("Result: 5");

    const power = formatScientificReport("2^3", "deg", value("2^3"));
    expect(power).toContain("Expression: 2^3");
    expect(power).toContain("Result: 8");
    expect(power).toContain("2^3 = 8.");
    expect(power).toContain("Scientific notation: 8 × 10⁰");
    expect(power).not.toContain("Angle mode");
    expect(power).not.toContain("88");
    expect(power).not.toContain("Result: 14");
  });

  it("writes the inverse cosine report in degrees", () => {
    const evaluation = value("acos(0.5)");
    const report = formatScientificReport("acos(0.5)", "deg", evaluation);
    expect(report).toContain("Expression: cos⁻¹(0.5)");
    expect(report).toContain("Result: 60°");
    expect(report).toContain("Scientific notation: 6 × 10¹");
    expect(report).toContain("Angle mode: Degrees");
    expect(report).toContain("Find the angle whose cosine is 0.5.");
    expect(report).toContain("The inverse trigonometric result is expressed in degrees.");
    expect(report).toContain("cos⁻¹(0.5) = 60°.");
    expect(report).toContain("60 = 6 × 10¹.");
    expect(report).not.toContain("60° =");

    const radians = formatScientificReport("acos(0.5)", "rad", value("acos(0.5)", "rad"));
    expect(radians).toContain("Expression: cos⁻¹(0.5)");
    expect(radians).toMatch(/Result: .+ rad/);
    expect(radians).toContain("Angle mode: Radians");
    expect(radians).toContain("The inverse trigonometric result is expressed in radians.");
    expect(radians).not.toContain("Degrees");
    expect(radians).not.toContain("60°");
    expect(radians).not.toContain(report);

    const degrees = formatScientificReport("sin(30)", "deg", value("sin(30)", "deg"));
    const radianSine = formatScientificReport("sin(30)", "rad", value("sin(30)", "rad"));
    expect(degrees).toContain("Result: 0.5");
    expect(degrees).toContain("Angle mode: Degrees");
    expect(radianSine).toContain("Angle mode: Radians");
    expect(radianSine).not.toContain("Result: 0.5");
    expect(radianSine).not.toContain("Angle mode: Degrees");
  });

  it("includes the stored answer only when the expression uses Ans", () => {
    const report = formatScientificReport("Ans+1", "deg", value("Ans+1", "deg", 5), 5);
    expect(report).toContain("Expression: Ans+1\nPrevious answer: 5\nResult: 6");
    expect(report).not.toContain("Angle mode");
    const next = formatScientificReport("2^3", "deg", value("2^3"), 5);
    expect(next).not.toContain("Previous answer");
    expect(next).not.toContain("Result: 6");
  });

  it("does not concatenate a result with its scientific notation", () => {
    const sum = value("2+3");
    const sumLine = formatHistoryEntry("2+3", sum.result, sum.scientific, null);
    expect(sumLine.primary).toBe("2+3 = 5");
    expect(sumLine.detail).toBe("Scientific notation: 5 × 10⁰");
    expect(`${sumLine.primary} ${sumLine.detail}`).not.toContain("55");

    const power = value("2^3");
    const powerLine = formatHistoryEntry("2^3", power.result, power.scientific, null);
    expect(powerLine.primary).toBe("2^3 = 8");
    expect(`${powerLine.primary} ${powerLine.detail}`).not.toContain("88");

    const angle = value("acos(0.5)");
    expect(formatHistoryEntry("acos(0.5)", angle.result, angle.scientific, "deg").primary).toBe(
      "acos(0.5) = 60°",
    );
  });

  it("keeps one history entry when equals is repeated", () => {
    const entry = { expression: "2+3", result: "5", mode: "deg" as const };
    const once = appendHistory([], entry);
    const twice = appendHistory(once, { ...entry });
    expect(twice).toHaveLength(1);
    expect(appendHistory(twice, { expression: "2^3", result: "8", mode: "deg" })).toHaveLength(2);
  });

  it("toggles a sign and inserts square and reciprocal around the current value", () => {
    expect(toggleSign("5", 1)).toEqual({ expression: "-5", cursor: 2 });
    expect(toggleSign("-5", 2)).toEqual({ expression: "5", cursor: 1 });
    expect(toggleSign("2+3", 3)).toEqual({ expression: "2-3", cursor: 3 });
    expect(insertSquare("5", 1)).toEqual({ expression: "5^2", cursor: 3 });
    expect(insertSquare("2+3", 3)).toEqual({ expression: "(2+3)^2", cursor: 7 });
    expect(insertReciprocal("5", 1)).toEqual({ expression: "1/(5)", cursor: 5 });
    expect(insertReciprocal("2+3", 3)).toEqual({ expression: "1/(2+3)", cursor: 7 });
  });

  it("clears the current entry and leaves the rest of the expression", () => {
    expect(clearEntry("200+10", 6)).toEqual({ expression: "200+", cursor: 4 });
    expect(clearEntry("sin(30)", 7)).toEqual({ expression: "sin()", cursor: 4 });
    expect(clearEntry("6.02e23", 7)).toEqual({ expression: "", cursor: 0 });
    expect(clearEntry("50%", 3)).toEqual({ expression: "", cursor: 0 });
    expect(clearEntry("2+3", 1, 2)).toEqual({ expression: "23", cursor: 1 });
  });
});
