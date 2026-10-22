import type { FractionResult } from "@/lib/math";

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
