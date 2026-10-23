import { describe, expect, it } from "vitest";
import { convertUnits, formatUnitReport } from "@/lib/units";

function converted(
  value: number,
  dimension: "length" | "mass" | "volume",
  from: string,
  to: string,
) {
  const result = convertUnits(value, dimension, from, to);
  expect(result).not.toBeNull();
  if (!result) {
    throw new Error("missing conversion");
  }
  return result;
}

describe("unit converter", () => {
  it("uses exact length, mass, and volume factors", () => {
    expect(converted(1, "length", "km", "m").result).toBe("1,000");
    expect(converted(1, "length", "in", "cm").result).toBe("2.54");
    expect(converted(1, "length", "mi", "km").result).toBe("1.609344");
    expect(converted(1, "mass", "lb", "kg").result).toBe("0.45359237");
    expect(converted(1, "volume", "gal", "l").result).toBe("3.7854118");
  });

  it("reverses a conversion and accepts zero and negative values", () => {
    expect(converted(1000, "length", "m", "km").result).toBe("1");
    expect(converted(0, "mass", "kg", "g").result).toBe("0");
    expect(converted(-2, "length", "km", "m").result).toBe("-2,000");
    expect(converted(1, "length", "m", "m").result).toBe("1");
  });

  it("keeps the step text equal to the formatted result", () => {
    const result = converted(1, "length", "km", "m");
    expect(result.steps.map((step) => step.body).join(" ")).toContain(result.result);
    expect(convertUnits(1, "length", "km", "missing")).toBeNull();
    const report = formatUnitReport(1, "length", "km", "m", result);
    expect(report).toContain("Unit Converter Result");
    expect(report).toContain("Measurement: Length");
    expect(report).toContain("Input: 1 Kilometers");
    expect(report).toContain("Result: 1,000 Meters");
    expect(report).toContain("Factor: 1 km = 1,000 m");
    expect(report).toContain("Use the direct factor. 1 km = 1,000 m, so 1 × 1,000 = 1,000.");
    expect(report).not.toContain("1,000Meters");
    expect(report).not.toContain("Angle mode");
    const grams = convertUnits(2, "mass", "kg", "g");
    const nextReport = formatUnitReport(2, "mass", "kg", "g", grams!);
    expect(nextReport).toContain("Result: 2,000 Grams");
    expect(nextReport).not.toContain("1,000 Meters");
  });
});