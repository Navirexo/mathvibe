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

function trim(value: string) {
  if (!value.includes(".")) {
    return value;
  }

  return value.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
}
