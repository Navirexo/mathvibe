import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { explainPowerOfTen, formatNotationReport, toScientificNotation } from "@/lib/notation";
import { copyDetailedResultLabel, formatDetailedReport, isCurrentCopyPayload } from "@/lib/report";

describe("detailed copy reports", () => {
  it("uses one visible copy label for every tool", () => {
    expect(copyDetailedResultLabel).toBe("Copy Detailed Result");

    const toolFiles = [
      "components/ui/CopyResultButton.tsx",
      "components/calculators/ScientificCalculator.tsx",
      "components/calculators/FractionConverter.tsx",
      "components/calculators/UnitConverterTool.tsx",
      "components/calculators/EquationSolver.tsx",
      "components/calculators/GuideExplorer.tsx",
      "app/convert/[slug]/page.tsx",
    ];

    for (const file of toolFiles) {
      const source = readFileSync(path.resolve(file), "utf8");
      expect(source, file).toMatch(/CopyResult(Button|Block)/);
      expect(source, file).not.toMatch(/Copy result/);
      expect(source, file).not.toMatch(/Copy Result(?!s)/);
    }
  });

  it("rejects a copy confirmation after the calculation changes", () => {
    expect(isCurrentCopyPayload("Result: 5", "2+3", "Result: 5", "2+3")).toBe(true);
    expect(isCurrentCopyPayload("Result: 5", "2+3", "Result: 8", "2^3")).toBe(false);
    expect(isCurrentCopyPayload("Result: 5", "deg:2+3", "Result: 5", "rad:acos(0.5)")).toBe(false);
    expect(isCurrentCopyPayload("Result: 5", "2+3", null, "2+3")).toBe(false);
  });

  it("keeps fields, notes, and steps on separate lines", () => {
    const report = formatDetailedReport({
      title: "Sample Result",
      fields: [
        { label: "Result", value: "5" },
        { label: "Scientific notation", value: "5 × 10⁰" },
      ],
      notes: [null, "Rounded example."],
      steps: [{ title: "Evaluate", body: "2+3 = 5." }],
    });

    expect(report).toBe(
      [
        "Sample Result",
        "",
        "Result: 5",
        "Scientific notation: 5 × 10⁰",
        "",
        "Rounded example.",
        "",
        "Step-by-step:",
        "",
        "Evaluate. 2+3 = 5.",
      ].join("\n"),
    );
    expect(report).not.toContain("55");
    expect(report).not.toContain("Angle mode");
  });

  it("omits an empty step section", () => {
    expect(formatDetailedReport({ title: "Sample Result", fields: [{ label: "Result", value: "1" }] })).toBe(
      "Sample Result\n\nResult: 1",
    );
  });

  it("writes the current scientific-notation guide without gluing the number to the notation", () => {
    const notation = toScientificNotation(100);
    const report = formatNotationReport("100", notation!);
    expect(report).toContain("Topic: Scientific notation");
    expect(report).toContain("Number: 100\nScientific notation: 1 × 10^2");
    expect(report).not.toContain("1001 ×");
    const next = formatNotationReport("2500", toScientificNotation(2500)!);
    expect(next).toContain("Number: 2500");
    expect(next).not.toContain("Number: 100");
  });

  it("explains the current power of ten", () => {
    const small = explainPowerOfTen("2");
    expect(small?.result).toBe("10^2 = 100");
    expect(small?.report).toContain("Topic: Powers of ten\nExponent: 2\nResult: 10^2 = 100");
    expect(small?.report).toContain("Expand the power. 10^2 = 100.");
    expect(explainPowerOfTen("-3")?.result).toBe("10^-3 = 0.001");
    expect(explainPowerOfTen("13")?.result).toBe("10^13 = 1e13");
    expect(explainPowerOfTen("-7")?.result).toBe("10^-7 = 1e-7");
    expect(explainPowerOfTen("abc")).toBeNull();
    const next = explainPowerOfTen("3");
    expect(next?.report).toContain("Result: 10^3 = 1000");
    expect(next?.report).not.toContain("10^2 = 100");
  });
});
