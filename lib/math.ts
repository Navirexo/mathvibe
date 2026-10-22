export type FractionStep = {
  title: string;
  body: string;
};

export type FractionResult = {
  fraction: string;
  numerator: number;
  denominator: number;
  simplified: string;
  decimal: string;
  percent: string;
  equivalents: string[];
  steps: FractionStep[];
};

export type FractionEvaluation =
  | { status: "empty" }
  | { status: "incomplete" }
  | { status: "invalid"; message: string }
  | { status: "ok"; result: FractionResult };

const COMPLETE_FRACTION = /^[+-]?\d+\/[+-]?\d+$/;
const PARTIAL_FRACTION = /^[+-]?\d*\/?[+-]?\d*$/;
const MAX_DIGITS = 16;

export function evaluateFraction(input: string): FractionEvaluation {
  const compact = input.trim().replace(/\s+/g, "");

  if (!compact) {
    return { status: "empty" };
  }

  if (!COMPLETE_FRACTION.test(compact)) {
    if (PARTIAL_FRACTION.test(compact)) {
      return { status: "incomplete" };
    }

    return {
      status: "invalid",
      message: "Enter a fraction such as 5/6, 3/4, or 7/8.",
    };
  }

  const [numeratorText, denominatorText] = compact.split("/");
  const rawNumerator = Number(numeratorText);
  const rawDenominator = Number(denominatorText);

  if (
    !Number.isSafeInteger(rawNumerator) ||
    !Number.isSafeInteger(rawDenominator)
  ) {
    return {
      status: "invalid",
      message: "Use smaller whole numbers in the fraction.",
    };
  }

  if (rawDenominator === 0) {
    return {
      status: "invalid",
      message: "The denominator cannot be zero.",
    };
  }

  if (
    Math.abs(rawNumerator) > Number.MAX_SAFE_INTEGER / 100 ||
    Math.abs(rawDenominator) > Number.MAX_SAFE_INTEGER / 10
  ) {
    return {
      status: "invalid",
      message: "Use smaller whole numbers in the fraction.",
    };
  }

  const { numerator, denominator } = normalize(rawNumerator, rawDenominator);

  return {
    status: "ok",
    result: buildResult(numerator, denominator),
  };
}

export function formatFractionResult(result: FractionResult) {
  const steps = result.steps
    .map((step, index) => `${index + 1}. ${step.title}. ${step.body}`)
    .join("\n");

  return [
    `Fraction: ${result.fraction}`,
    `Decimal: ${result.decimal}`,
    `Percent: ${result.percent}`,
    `Simplest form: ${result.simplified}`,
    `Equivalent fractions: ${result.equivalents.join(", ")}`,
    "",
    steps,
  ].join("\n");
}

function buildResult(numerator: number, denominator: number): FractionResult {
  const fraction = formatFraction(numerator, denominator);
  const divisor = gcd(numerator, denominator);
  const simplifiedNumerator = numerator / divisor;
  const simplifiedDenominator = denominator / divisor;
  const simplified = formatFraction(simplifiedNumerator, simplifiedDenominator);
  const decimal = formatQuotient(numerator, denominator);
  const percent = `${formatQuotient(numerator * 100, denominator)}%`;
  const equivalents = [2, 3, 4, 5].map((factor) =>
    formatFraction(
      simplifiedNumerator * factor,
      simplifiedDenominator * factor,
    ),
  );

  const steps: FractionStep[] = [
    {
      title: "Read the fraction",
      body: `${fraction} means ${numerator} divided by ${denominator}. The numerator is ${numerator} and the denominator is ${denominator}.`,
    },
    {
      title: "Divide to find the decimal",
      body: `Decimal = numerator ÷ denominator = ${numerator} ÷ ${denominator} = ${decimal}.`,
    },
    {
      title: "Multiply by 100 to find the percent",
      body: `Percent = (${numerator} × 100) ÷ ${denominator} = ${numerator * 100} ÷ ${denominator} = ${percent}.`,
    },
    {
      title: "Simplify the fraction",
      body:
        divisor === 1
          ? `The greatest common divisor of ${Math.abs(numerator)} and ${denominator} is 1, so ${fraction} is already in simplest form.`
          : `The greatest common divisor of ${Math.abs(numerator)} and ${denominator} is ${divisor}. Divide both parts by ${divisor}: ${formatFraction(numerator, denominator)} = ${simplified}.`,
    },
    {
      title: "Build equivalent fractions",
      body: `Multiply the simplest form by 2, 3, 4, and 5. ${simplified} = ${equivalents.join(" = ")}.`,
    },
  ];

  return {
    fraction,
    numerator,
    denominator,
    simplified,
    decimal,
    percent,
    equivalents,
    steps,
  };
}

function normalize(numerator: number, denominator: number) {
  if (denominator < 0) {
    return { numerator: -numerator, denominator: -denominator };
  }

  return { numerator, denominator };
}

function gcd(a: number, b: number) {
  let x = Math.abs(a);
  let y = Math.abs(b);

  while (y !== 0) {
    const next = x % y;
    x = y;
    y = next;
  }

  return x;
}

function formatFraction(numerator: number, denominator: number) {
  return `${numerator}/${denominator}`;
}

function formatQuotient(numerator: number, denominator: number) {
  const negative = numerator < 0 !== denominator < 0;
  const dividend = Math.abs(numerator);
  const divisor = Math.abs(denominator);
  const whole = Math.floor(dividend / divisor);
  let remainder = dividend % divisor;

  if (remainder === 0) {
    return `${negative ? "-" : ""}${whole}`;
  }

  const digits: string[] = [];
  const seen = new Map<number, number>();
  let repeatAt = -1;

  while (remainder !== 0 && digits.length < MAX_DIGITS) {
    const seenAt = seen.get(remainder);

    if (seenAt !== undefined) {
      repeatAt = seenAt;
      break;
    }

    seen.set(remainder, digits.length);
    remainder *= 10;
    digits.push(String(Math.floor(remainder / divisor)));
    remainder %= divisor;
  }

  const sign = negative ? "-" : "";

  if (repeatAt >= 0) {
    const nonRepeating = digits.slice(0, repeatAt).join("");
    const repeating = digits.slice(repeatAt).join("");
    return `${sign}${whole}.${nonRepeating}(${repeating})`;
  }

  if (remainder !== 0) {
    return `${sign}${whole}.${digits.join("")}…`;
  }

  return `${sign}${whole}.${digits.join("")}`;
}
