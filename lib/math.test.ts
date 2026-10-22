import { describe, expect, it } from "vitest";
import { evaluateFraction } from "@/lib/math";
import { parseConversionSlug } from "@/lib/pseo";
import { roundDisplayedFraction } from "@/lib/rounding";

function fraction(input: string) {
  const evaluation = evaluateFraction(input);
  expect(evaluation.status).toBe("ok");
  if (evaluation.status !== "ok") {
    throw new Error(evaluation.status);
  }
  return evaluation.result;
}

describe("fraction converter", () => {
  it("keeps exact repeating notation in the shared calculation", () => {
    expect(fraction("5/6").decimal).toBe("0.8(3)");
    expect(fraction("5/6").percent).toBe("83.(3)%");
    expect(fraction("1/6").decimal).toBe("0.1(6)");
  });

  it("handles signs, reducible fractions, and a zero numerator", () => {
    expect(fraction("-5/6").decimal).toBe("-0.8(3)");
    expect(fraction("5/-6").fraction).toBe("-5/6");
    expect(fraction("4/8").simplified).toBe("1/2");
    expect(fraction("4/6").simplified).toBe("2/3");
    expect(fraction("0/5")).toMatchObject({ decimal: "0", percent: "0%" });
    expect(fraction("3/4")).toMatchObject({ decimal: "0.75", percent: "75%" });
  });

  it("rejects a zero denominator and other invalid fractions", () => {
    expect(evaluateFraction("5/0")).toMatchObject({
      status: "invalid",
      message: "The denominator cannot be zero.",
    });
    expect(evaluateFraction("5/").status).toBe("incomplete");
    expect(evaluateFraction("abc").status).toBe("invalid");
  });

  it("makes rounded steps match the displayed decimal and percent", () => {
    const tool = roundDisplayedFraction(fraction("5/7"), 6, 2);
    expect(tool.decimal).toBe("0.714286");
    expect(tool.percent).toBe("71.43%");
    const steps = tool.steps.map((step) => step.body).join(" ");
    expect(steps).toContain("0.714286");
    expect(steps).toContain("71.43%");
    expect(steps).not.toMatch(/\d\.\d*\(/);

    const page = parseConversionSlug("3-4-as-a-decimal");
    expect(page?.kind).toBe("decimal");
    expect(page?.result.decimal).toBe("0.75");
    expect(page?.result.percent).toBe("75%");
    expect(page?.slug).toBe("3-4-as-a-decimal");

    const repeating = parseConversionSlug("5-6-as-a-percent");
    expect(repeating?.result.decimal).toBe("0.8333");
    expect(repeating?.result.percent).toBe("83.33%");
    expect(repeating?.result.steps.map((step) => step.body).join(" ")).not.toMatch(/\d\.\d*\(/);
  });
});
