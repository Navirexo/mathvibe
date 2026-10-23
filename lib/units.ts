import { formatDetailedReport } from "@/lib/report";

export type UnitDimension = "length" | "mass" | "volume";

export type UnitDefinition = {
  id: string;
  label: string;
  factor: number;
};

export const unitGroups: Record<
  UnitDimension,
  { label: string; base: string; units: UnitDefinition[] }
> = {
  length: {
    label: "Length",
    base: "meters",
    units: [
      { id: "mm", label: "Millimeters", factor: 0.001 },
      { id: "cm", label: "Centimeters", factor: 0.01 },
      { id: "m", label: "Meters", factor: 1 },
      { id: "km", label: "Kilometers", factor: 1000 },
      { id: "in", label: "Inches", factor: 0.0254 },
      { id: "ft", label: "Feet", factor: 0.3048 },
      { id: "yd", label: "Yards", factor: 0.9144 },
      { id: "mi", label: "Miles", factor: 1609.344 },
    ],
  },
  mass: {
    label: "Mass",
    base: "grams",
    units: [
      { id: "mg", label: "Milligrams", factor: 0.001 },
      { id: "g", label: "Grams", factor: 1 },
      { id: "kg", label: "Kilograms", factor: 1000 },
      { id: "oz", label: "Ounces", factor: 28.349523125 },
      { id: "lb", label: "Pounds", factor: 453.59237 },
    ],
  },
  volume: {
    label: "Volume",
    base: "liters",
    units: [
      { id: "ml", label: "Milliliters", factor: 0.001 },
      { id: "l", label: "Liters", factor: 1 },
      { id: "m3", label: "Cubic meters", factor: 1000 },
      { id: "floz", label: "Fluid ounces", factor: 0.0295735295625 },
      { id: "cup", label: "Cups", factor: 0.2365882365 },
      { id: "gal", label: "Gallons", factor: 3.785411784 },
    ],
  },
};

export type UnitConversion = {
  result: string;
  factor: string;
  steps: { title: string; body: string }[];
};

export function convertUnits(
  value: number,
  dimension: UnitDimension,
  fromId: string,
  toId: string,
): UnitConversion | null {
  if (!Number.isFinite(value)) {
    return null;
  }

  const group = unitGroups[dimension];
  const from = group.units.find((unit) => unit.id === fromId);
  const to = group.units.find((unit) => unit.id === toId);

  if (!from || !to) {
    return null;
  }

  const converted = (value * from.factor) / to.factor;
  const factor = from.factor / to.factor;
  const result = formatUnitValue(converted);
  const factorText = formatUnitValue(factor);

  return {
    result,
    factor: factorText,
    steps: [
      {
        title: "Read the measurement",
        body: `${formatUnitValue(value)} ${unitName(from.label, value)} is the starting value.`,
      },
      {
        title: "Convert to the base unit",
        body: `1 ${unitName(from.label, 1)} = ${formatUnitValue(from.factor)} ${group.base}. ${formatUnitValue(value)} × ${formatUnitValue(from.factor)} = ${formatUnitValue(value * from.factor)} ${group.base}.`,
      },
      {
        title: "Convert to the target unit",
        body: `${formatUnitValue(value * from.factor)} ${group.base} ÷ ${formatUnitValue(to.factor)} = ${result} ${unitName(to.label, converted)}.`,
      },
      {
        title: "Use the direct factor",
        body: `1 ${from.id} = ${factorText} ${to.id}, so ${formatUnitValue(value)} × ${factorText} = ${result}.`,
      },
    ],
  };
}

export function formatUnitReport(
  value: number,
  dimension: UnitDimension,
  fromId: string,
  toId: string,
  conversion: UnitConversion,
) {
  const group = unitGroups[dimension];
  const from = group.units.find((unit) => unit.id === fromId);
  const to = group.units.find((unit) => unit.id === toId);

  if (!from || !to) {
    return null;
  }

  return formatDetailedReport({
    title: "Unit Converter Result",
    fields: [
      { label: "Measurement", value: group.label },
      { label: "Input", value: `${formatUnitValue(value)} ${from.label}` },
      { label: "Result", value: `${conversion.result} ${to.label}` },
      { label: "Factor", value: `1 ${from.id} = ${conversion.factor} ${to.id}` },
    ],
    steps: conversion.steps,
  });
}

function unitName(label: string, amount: number) {
  const lower = label.toLowerCase();
  const irregular: Record<string, string> = {
    inches: "inch",
    feet: "foot",
  };

  if (Math.abs(amount) === 1) {
    return irregular[lower] ?? (lower.endsWith("s") ? lower.slice(0, -1) : lower);
  }

  return lower;
}

const localeLimit = 100_000_000;
const scientificFloor = 0.000001;

export function formatUnitValue(value: number) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  if (value === 0) {
    return "0";
  }

  const absolute = Math.abs(value);

  if (absolute >= localeLimit || absolute < scientificFloor) {
    return trim(value.toExponential(6));
  }

  const precise = Number(value.toPrecision(8));
  return precise.toLocaleString("en-US", {
    maximumFractionDigits: 8,
    useGrouping: true,
  });
}

function trim(value: string) {
  if (!value.includes("e") && value.includes(".")) {
    return value.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
  }

  return value.replace(/(\.\d*?)0+e/, "$1e").replace(/\.e/, "e");
}
