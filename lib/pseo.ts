import { evaluateFraction, type FractionResult } from "@/lib/math";

export type ConversionKind = "percent" | "decimal" | "fraction";

export type ParsedConversion = {
  slug: string;
  numerator: number;
  denominator: number;
  kind: ConversionKind;
  fraction: string;
  label: string;
  result: FractionResult;
};

export type ConversionFaq = {
  question: string;
  answer: string;
};

const SLUG_PATTERN = /^(\d+)-(\d+)(?:-as-a-(percent|decimal))?$/;

export function generateConversionSlug(
  numerator: number,
  denominator: number,
  kind: ConversionKind,
) {
  const base = `${numerator}-${denominator}`;

  if (kind === "percent") {
    return `${base}-as-a-percent`;
  }

  if (kind === "decimal") {
    return `${base}-as-a-decimal`;
  }

  return base;
}

export function parseConversionSlug(slug: string): ParsedConversion | null {
  const match = SLUG_PATTERN.exec(slug);

  if (!match) {
    return null;
  }

  const numerator = Number(match[1]);
  const denominator = Number(match[2]);
  const kind = (match[3] as ConversionKind | undefined) ?? "fraction";
  const evaluation = evaluateFraction(`${numerator}/${denominator}`);

  if (evaluation.status !== "ok") {
    return null;
  }

  const fraction = evaluation.result.fraction;

  return {
    slug: generateConversionSlug(
      evaluation.result.numerator,
      evaluation.result.denominator,
      kind,
    ),
    numerator: evaluation.result.numerator,
    denominator: evaluation.result.denominator,
    kind,
    fraction,
    label: conversionLabel(fraction, kind),
    result: evaluation.result,
  };
}

export function generateConversionMetadata(conversion: ParsedConversion) {
  const { fraction, kind } = conversion;

  if (kind === "percent") {
    return {
      title: `What is ${fraction} as a Percent? (Answer & Step-by-Step Solution)`,
      description: `Convert ${fraction} to a percentage instantly. View step-by-step math calculations, decimal equivalents, and worked examples on MathVibe.`,
      canonical: `/convert/${conversion.slug}`,
    };
  }

  if (kind === "decimal") {
    return {
      title: `What is ${fraction} as a Decimal? (Answer & Step-by-Step Solution)`,
      description: `Convert ${fraction} to a decimal instantly. View step-by-step math calculations, percent equivalents, and worked examples on MathVibe.`,
      canonical: `/convert/${conversion.slug}`,
    };
  }

  return {
    title: `What is ${fraction}? (Answer & Step-by-Step Solution)`,
    description: `Convert ${fraction} to a decimal and a percentage instantly. View step-by-step math calculations, equivalent fractions, and worked examples on MathVibe.`,
    canonical: `/convert/${conversion.slug}`,
  };
}

export function conversionHeadline(conversion: ParsedConversion) {
  if (conversion.kind === "percent") {
    return `What is ${conversion.fraction} as a Percent?`;
  }

  if (conversion.kind === "decimal") {
    return `What is ${conversion.fraction} as a Decimal?`;
  }

  return `What is ${conversion.fraction}?`;
}

export function conversionFaqs(conversion: ParsedConversion): ConversionFaq[] {
  const { fraction, result } = conversion;
  const simplest =
    result.simplified === result.fraction
      ? `${fraction} is already in simplest form.`
      : `${fraction} simplifies to ${result.simplified}.`;

  return [
    {
      question: `What is ${fraction} as a percent?`,
      answer: `${fraction} as a percent is ${result.percent}. Multiply ${result.numerator} by 100, then divide by ${result.denominator}.`,
    },
    {
      question: `What is ${fraction} as a decimal?`,
      answer: `${fraction} as a decimal is ${result.decimal}. Divide ${result.numerator} by ${result.denominator}.`,
    },
    {
      question: `What is ${fraction} in simplest form?`,
      answer: simplest,
    },
    {
      question: `What fractions are equivalent to ${fraction}?`,
      answer: `${result.simplified} has the same value as ${result.equivalents.join(", ")}.`,
    },
  ];
}

export function workedExampleResults(conversion: ParsedConversion) {
  const examples = [conversion.result];
  const seen = new Set([conversion.result.fraction]);

  for (const candidate of ["1/2", "3/4", "5/6", "7/8", "2/5", "1/4"]) {
    if (examples.length === 3) {
      break;
    }

    if (seen.has(candidate)) {
      continue;
    }

    const evaluation = evaluateFraction(candidate);

    if (evaluation.status !== "ok") {
      continue;
    }

    examples.push(evaluation.result);
    seen.add(candidate);
  }

  return examples;
}

export function relatedConversionLinks(conversion: ParsedConversion) {
  const kinds: ConversionKind[] = ["percent", "decimal", "fraction"];
  const sameFraction = kinds
    .filter((kind) => kind !== conversion.kind)
    .map((kind) => ({
      href: `/convert/${generateConversionSlug(conversion.numerator, conversion.denominator, kind)}`,
      label: conversionLabel(conversion.fraction, kind),
    }));
  const equivalents = conversion.result.equivalents.map((fraction) => {
    const [numerator, denominator] = fraction.split("/").map(Number);

    return {
      href: `/convert/${generateConversionSlug(numerator, denominator, conversion.kind)}`,
      label: conversionLabel(fraction, conversion.kind),
    };
  });

  return [...sameFraction, ...equivalents];
}

export function staticConversionParams() {
  const params: { slug: string }[] = [];

  for (let denominator = 2; denominator <= 12; denominator += 1) {
    for (let numerator = 1; numerator <= denominator; numerator += 1) {
      params.push({
        slug: generateConversionSlug(numerator, denominator, "percent"),
      });
      params.push({
        slug: generateConversionSlug(numerator, denominator, "decimal"),
      });
      params.push({
        slug: generateConversionSlug(numerator, denominator, "fraction"),
      });
    }
  }

  return params;
}

function conversionLabel(fraction: string, kind: ConversionKind) {
  if (kind === "percent") {
    return `${fraction} as a Percent`;
  }

  if (kind === "decimal") {
    return `${fraction} as a Decimal`;
  }

  return fraction;
}
