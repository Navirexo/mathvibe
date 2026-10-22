import { describe, expect, it } from "vitest";
import { evaluateExpression } from "@/lib/scientific";

function value(input: string, mode: "deg" | "rad" = "deg") {
  const evaluation = evaluateExpression(input, mode);
  expect(evaluation.status).toBe("ok");
  if (evaluation.status !== "ok") {
    throw new Error(evaluation.status);
  }
  return evaluation;
}

describe("scientific calculator", () => {
  it("follows operator precedence and parentheses", () => {
    expect(value("2+3*4").result).toBe("14");
    expect(value("(2+3)*4").result).toBe("20");
    expect(value("8/2/2").result).toBe("2");
  });

  it("evaluates powers from the right and supports roots", () => {
    expect(value("2^3^2").result).toBe("512");
    expect(value("2^(3^2)").result).toBe("512");
    expect(value("(2^3)^2").result).toBe("64");
    expect(value("sqrt(9)").result).toBe("3");
    expect(value("cbrt(-8)").result).toBe("-2");
  });

  it("reads scientific notation without using eval", () => {
    expect(value("6.02e23").result).toContain("6.02");
    expect(value("6.02e23").scientific).toContain("10^23");
    expect(value("1.5e-3").result).toBe("0.0015");
  });

  it("switches trigonometric results between degrees and radians", () => {
    expect(value("sin(30)", "deg").result).toBe("0.5");
    expect(value("cos(60)", "deg").result).toBe("0.5");
    expect(value("sin(pi/6)", "rad").result).toBe("0.5");
    expect(Number(value("sin(30)", "rad").result)).toBeCloseTo(Math.sin(30), 8);
    expect(value("asin(0.5)", "deg").result).toBe("30");
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
  });

  it("keeps each step equal to the calculated result", () => {
    const evaluation = value("2+3*4");
    expect(evaluation.steps.map((step) => step.body).join(" ")).toContain("14");
    expect(evaluation.steps.map((step) => step.body).join(" ")).toContain(evaluation.result);
  });
});
