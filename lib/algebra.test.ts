import { describe, expect, it } from "vitest";
import { analyzeAlgebra, formatAlgebraReport } from "@/lib/algebra";

function solved(input: string) {
  const evaluation = analyzeAlgebra(input, "solve");
  expect(evaluation, evaluation.status === "invalid" ? evaluation.message : evaluation.status).toMatchObject({
    status: "ok",
  });
  if (evaluation.status !== "ok") {
    throw new Error(evaluation.status);
  }
  return evaluation;
}

describe("equation solver", () => {
  it("solves linear equations", () => {
    expect(solved("2x + 3 = 11").summary).toBe("x = 4");
    expect(solved("2(x + 3) = 10").summary).toBe("x = 2");
  });

  it("solves quadratics, including a repeated root", () => {
    const quadratic = analyzeAlgebra("x^2 - 5x + 6 = 0", "solve");
    expect(quadratic).toMatchObject({ status: "ok" });
    expect(solved("x^2 - 5x + 6 = 0").summary).toBe("x = 2 or x = 3");
    expect(solved("x^2 = 4").summary).toBe("x = -2 or x = 2");
    const repeated = solved("(x - 2)^2 = 0");
    expect(repeated.summary).toBe("x = 2");
    expect(repeated.steps.map((step) => step.body).join(" ")).toContain("x^2 - 4x + 4");
    expect(solved("2(x + 1)^2 = 8").summary).toBe("x = -3 or x = 1");
    expect(solved("x^2 - 2x + 1 = 0").summary).toBe("x = 1");
  });

  it("reports a negative discriminant and handles a zero leading coefficient", () => {
    expect(solved("x^2 + 1 = 0").summary).toBe("No real solutions");
    expect(solved("0x^2 + 2x - 4 = 0").summary).toBe("x = 2");
    expect(solved("5 = 5").summary).toBe("True for every x");
    expect(solved("5 = 3").summary).toBe("No solution");
  });

  it("rejects unsupported expressions and keeps steps aligned with the summary", () => {
    expect(analyzeAlgebra("2x + 3", "solve").status).toBe("incomplete");
    expect(analyzeAlgebra("y + 1 = 2", "solve").status).toBe("invalid");
    expect(analyzeAlgebra("x/2 = 1", "solve").status).toBe("invalid");
    const evaluation = solved("2x + 3 = 11");
    expect(evaluation.summary).toBe("x = 4");
    expect(evaluation.steps.at(-1)?.body).toContain("= 4");
    const simplified = analyzeAlgebra("2x + 3x - x", "simplify");
    expect(simplified).toMatchObject({
      status: "ok",
      summary: "4x",
    });
    const solveReport = formatAlgebraReport("2x + 3 = 11", "solve", evaluation);
    expect(solveReport).toContain("Equation Solver Result");
    expect(solveReport).toContain("Mode: Solve\nEquation: 2x + 3 = 11\nResult: x = 4");
    expect(solveReport).toContain("Step-by-step:");
    expect(solveReport).not.toContain("Angle mode");
    expect(solveReport).not.toContain("Scientific notation");
    if (simplified.status === "ok") {
      const simplifyReport = formatAlgebraReport("2x + 3x - x", "simplify", simplified);
      expect(simplifyReport).toContain("Mode: Simplify\nExpression: 2x + 3x - x\nResult: 4x");
      expect(simplifyReport).not.toContain("Equation: 2x + 3 = 11");
      expect(simplifyReport).not.toContain("Result: x = 4");
    }
  });
});
