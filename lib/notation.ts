import { formatDetailedReport } from "@/lib/report";

export type NotationResult = {
  coefficient: string;
  exponent: number;
  notation: string;
  steps: { title: string; body: string }[];
};

export function toScientificNotation(value: number): NotationResult | null {
  if (!Number.isFinite(value)) {
    return null;
  }

  if (value === 0) {
    return {
      coefficient: "0",
      exponent: 0,
      notation: "0 × 10^0",
      steps: [
        {
          title: "Check for zero",
          body: "Zero is written as 0 × 10^0.",
        },
      ],
    };
  }

  const sign = value < 0 ? "-" : "";
  const absolute = Math.abs(value);
  const exponent = Math.floor(Math.log10(absolute));
  const coefficient = absolute / 10 ** exponent;
  const coefficientText = `${sign}${trim(coefficient.toPrecision(8))}`;
  const notation = `${coefficientText} × 10^${exponent}`;

  return {
    coefficient: coefficientText,
    exponent,
    notation,
    steps: [
      {
        title: "Find the exponent",
        body: `Move the decimal point until one non-zero digit remains on the left. That takes ${exponent} ${Math.abs(exponent) === 1 ? "place" : "places"} ${exponent >= 0 ? "to the left" : "to the right"}.`,
      },
      {
        title: "Read the coefficient",
        body: `The coefficient is ${coefficientText}. It is at least 1 and less than 10.`,
      },
      {
        title: "Write the notation",
        body: `${trim(value.toPrecision(8))} = ${notation}.`,
      },
    ],
  };
}

export function formatNotationReport(input: string, result: NotationResult) {
  return formatDetailedReport({
    title: "Educational Guide Result",
    fields: [
      { label: "Topic", value: "Scientific notation" },
      { label: "Number", value: input.trim() },
      { label: "Scientific notation", value: result.notation },
    ],
    steps: result.steps,
  });
}

export function explainPowerOfTen(input: string) {
  const trimmed = input.trim();
  const exponent = trimmed === "" ? null : Number(trimmed);

  if (exponent === null || !Number.isFinite(exponent)) {
    return null;
  }

  const shown = trimExponent(exponent);
  const expanded = formatPower(exponent);
  const result = `10^${shown} = ${expanded}`;
  const steps = [
    {
      title: "Read the exponent",
      body: `The exponent is ${shown}.`,
    },
    {
      title: "Expand the power",
      body: `10^${shown} = ${expanded}.`,
    },
  ];

  return {
    result,
    steps,
    report: formatDetailedReport({
      title: "Educational Guide Result",
      fields: [
        { label: "Topic", value: "Powers of ten" },
        { label: "Exponent", value: shown },
        { label: "Result", value: result },
      ],
      steps,
    }),
  };
}

function trimExponent(exponent: number) {
  return String(exponent).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
}

function formatPower(exponent: number) {
  if (exponent >= 0 && exponent <= 12) {
    return String(10 ** exponent);
  }

  if (exponent < 0 && exponent >= -6) {
    return String(10 ** exponent);
  }

  return `1e${exponent}`;
}

function trim(value: string) {
  if (!value.includes(".")) {
    return value;
  }

  return value.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
}
