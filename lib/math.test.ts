import { describe, expect, it } from "vitest";
import { evaluateFraction, formatFractionResult } from "@/lib/math";
import { conversionFaqs, formatConversionReport, parseConversionSlug } from "@/lib/pseo";
import {
  decimalApproximationNote,
  formatFractionCopy,
  formatFractionGuideReport,
  percentApproximationNote,
  roundDisplayedFraction,
} from "@/lib/rounding";

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
  });

  it("shows the same exact fraction on conversion pages and labels one rounding", () => {
    const exact = fraction("5/6");
    expect(exact.decimal).toBe("0.8(3)");
    expect(exact.percent).toBe("83.(3)%");
    expect(decimalApproximationNote(exact)).toBe("Rounded to 6 decimal places: 0.833333.");
    expect(percentApproximationNote(exact)).toBe("Rounded to 2 percent places: 83.33%.");
    const exactSteps = exact.steps.map((step) => step.body).join(" ");
    expect(exactSteps).toContain("5 ÷ 6 = 0.8(3)");
    expect(exactSteps).toContain("83.(3)%");
    expect(exactSteps).not.toContain("0.8333");

    const page = parseConversionSlug("5-6-as-a-decimal");
    expect(page?.result.decimal).toBe(exact.decimal);
    expect(page?.result.percent).toBe(exact.percent);
    const faqs = page ? conversionFaqs(page) : [];
    expect(faqs[0]?.answer).toContain("83.(3)%");
    expect(faqs[0]?.answer).toContain("Rounded to 2 percent places: 83.33%.");
    expect(faqs[1]?.answer).toContain("0.8(3)");
    expect(faqs[1]?.answer).toContain("Rounded to 6 decimal places: 0.833333.");

    const terminating = parseConversionSlug("3-4-as-a-decimal");
    expect(terminating?.result).toMatchObject({ decimal: "0.75", percent: "75%" });
    expect(decimalApproximationNote(fraction("3/4"))).toBeNull();
    expect(percentApproximationNote(fraction("3/4"))).toBeNull();
    expect(conversionFaqs(terminating!).map((faq) => faq.answer).join(" ")).not.toContain("Rounded to");

    const negative = fraction("-5/6");
    expect(negative.decimal).toBe("-0.8(3)");
    expect(decimalApproximationNote(negative)).toBe("Rounded to 6 decimal places: -0.833333.");
    expect(percentApproximationNote(negative)).toBe("Rounded to 2 percent places: -83.33%.");

    const twoThirds = fraction("2/3");
    expect(twoThirds.decimal).toBe("0.(6)");
    expect(decimalApproximationNote(twoThirds)).toBe("Rounded to 6 decimal places: 0.666667.");

    const sixth = fraction("1/6");
    expect(sixth.decimal).toBe("0.1(6)");
    expect(sixth.percent).toBe("16.(6)%");
    expect(decimalApproximationNote(sixth)).toBe("Rounded to 6 decimal places: 0.166667.");
    expect(percentApproximationNote(sixth)).toBe("Rounded to 2 percent places: 16.67%.");

    expect(decimalApproximationNote(fraction("0/5"))).toBeNull();
    const repeatingCopy = formatFractionCopy(exact);
    expect(repeatingCopy).toContain("Fraction-to-Percent Converter Result");
    expect(repeatingCopy).toContain("Fraction: 5/6\nDecimal: 0.8(3)\nPercent: 83.(3)%");
    expect(repeatingCopy).toContain("Rounded to 6 decimal places: 0.833333.");
    expect(repeatingCopy).toContain("Read the fraction. 5/6 means 5 divided by 6.");
    expect(repeatingCopy).not.toContain("0.8(3)83");
    expect(repeatingCopy).not.toContain("Angle mode");
    const exactCopy = formatFractionCopy(fraction("3/4"));
    expect(exactCopy).toContain("Decimal: 0.75\nPercent: 75%");
    expect(exactCopy).not.toContain("Rounded to");
    expect(formatFractionResult(fraction("3/4"))).toContain("Fraction: 3/4");
    const guideCopy = formatFractionGuideReport(exact);
    expect(guideCopy).toContain("Educational Guide Result");
    expect(guideCopy).toContain("Topic: Fraction to percent");
    expect(guideCopy).not.toContain("x = 4");

    const percentPage = parseConversionSlug("5-6-as-a-percent");
    const percentReport = formatConversionReport(percentPage!);
    expect(percentReport.startsWith("Fraction-to-Percent Conversion Result")).toBe(true);
    expect(percentReport).toContain("Percent: 83.(3)%\nSimplest form: 5/6");
    expect(percentReport).toContain("Rounded to 2 percent places: 83.33%.");
    expect(percentReport).not.toContain("Angle mode");
    const decimalPage = parseConversionSlug("3-4-as-a-decimal");
    const decimalReport = formatConversionReport(decimalPage!);
    expect(decimalReport.startsWith("Fraction-to-Decimal Conversion Result")).toBe(true);
    expect(decimalReport).toContain("Decimal: 0.75\nPercent: 75%");
    expect(decimalReport).not.toContain("Rounded to");
    expect(decimalReport).not.toContain("83.(3)%");
  });
});
