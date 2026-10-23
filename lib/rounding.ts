import { type FractionResult } from "@/lib/math";
import { formatDetailedReport } from "@/lib/report";

export const DISPLAY_DECIMAL_PLACES = 6;
export const DISPLAY_PERCENT_PLACES = 2;

export function decimalApproximation(result: FractionResult) {
  const rounded = formatRoundedQuotient(
    result.numerator,
    result.denominator,
    DISPLAY_DECIMAL_PLACES,
  );

  return rounded === result.decimal ? null : rounded;
}

export function percentApproximation(result: FractionResult) {
  const rounded = `${formatRoundedQuotient(
    result.numerator * 100,
    result.denominator,
    DISPLAY_PERCENT_PLACES,
  )}%`;

  return rounded === result.percent ? null : rounded;
}

export function decimalApproximationNote(result: FractionResult) {
  const rounded = decimalApproximation(result);

  return rounded
    ? `Rounded to ${DISPLAY_DECIMAL_PLACES} decimal places: ${rounded}.`
    : null;
}

export function percentApproximationNote(result: FractionResult) {
  const rounded = percentApproximation(result);

  return rounded
    ? `Rounded to ${DISPLAY_PERCENT_PLACES} percent places: ${rounded}.`
    : null;
}

export function formatFractionCopy(result: FractionResult) {
  return formatFractionReport(result, "Fraction-to-Percent Converter Result");
}

export function formatFractionGuideReport(result: FractionResult) {
  return formatFractionReport(result, "Educational Guide Result", "Fraction to percent");
}

function formatFractionReport(result: FractionResult, title: string, topic?: string) {
  return formatDetailedReport({
    title,
    fields: [
      ...(topic ? [{ label: "Topic", value: topic }] : []),
      { label: "Fraction", value: result.fraction },
      { label: "Decimal", value: result.decimal },
      { label: "Percent", value: result.percent },
      { label: "Simplest form", value: result.simplified },
      { label: "Equivalent fractions", value: result.equivalents.join(", ") },
    ],
    notes: [decimalApproximationNote(result), percentApproximationNote(result)],
    steps: result.steps,
  });
}

export function roundDisplayedFraction(
  result: FractionResult,
  decimalPlaces: number,
  percentPlaces: number,
): FractionResult {
  const decimal = formatRoundedQuotient(result.numerator, result.denominator, decimalPlaces);
  const percent = `${formatRoundedQuotient(result.numerator * 100, result.denominator, percentPlaces)}%`;

  return {
    ...result,
    decimal,
    percent,
    steps: result.steps.map((step) => ({
      ...step,
      body: step.body.split(result.percent).join(percent).split(result.decimal).join(decimal),
    })),
  };
}

export function formatRoundedQuotient(numerator: number, denominator: number, places: number) {
  const negative = numerator < 0 !== denominator < 0;
  const dividend = Math.abs(numerator);
  const divisor = Math.abs(denominator);
  let whole = Math.floor(dividend / divisor);
  let remainder = dividend % divisor;
  const digits: number[] = [];

  for (let index = 0; remainder !== 0 && index <= places; index += 1) {
    remainder *= 10;
    digits.push(Math.floor(remainder / divisor));
    remainder %= divisor;
  }

  if (digits.length > places) {
    const roundUp = (digits.pop() ?? 0) >= 5;

    if (roundUp) {
      let index = digits.length - 1;

      while (index >= 0 && digits[index] === 9) {
        digits[index] = 0;
        index -= 1;
      }

      if (index >= 0) {
        digits[index] += 1;
      } else {
        whole += 1;
        digits.length = 0;
      }
    }
  }

  while (digits.at(-1) === 0) {
    digits.pop();
  }

  const text = digits.length === 0 ? String(whole) : `${whole}.${digits.join("")}`;
  return negative && text !== "0" ? `-${text}` : text;
}
