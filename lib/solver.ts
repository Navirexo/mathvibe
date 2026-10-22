export type SolverStep = {
  title: string;
  body: string;
};

export type EquationSolution = {
  summary: string;
  steps: SolverStep[];
};

export function solveLinear(a: number, b: number, c: number): EquationSolution | null {
  if (![a, b, c].every(Number.isFinite)) {
    return null;
  }

  if (a === 0) {
    if (b === c) {
      return {
        summary: "Every number is a solution",
        steps: [
          {
            title: "Look at the coefficient of x",
            body: "a is 0, so the equation is b = c.",
          },
          {
            title: "Compare the constants",
            body: `${formatNumber(b)} equals ${formatNumber(c)}, so every value of x works.`,
          },
        ],
      };
    }

    return {
      summary: "No solution",
      steps: [
        {
          title: "Look at the coefficient of x",
          body: "a is 0, so the equation is b = c.",
        },
        {
          title: "Compare the constants",
          body: `${formatNumber(b)} does not equal ${formatNumber(c)}, so no value of x works.`,
        },
      ],
    };
  }

  const x = (c - b) / a;

  return {
    summary: `x = ${formatNumber(x)}`,
    steps: [
      {
        title: "Write the equation",
        body: `${formatSum([
          { coefficient: a, variable: "x" },
          { coefficient: b, variable: "" },
        ])} = ${formatNumber(c)}.`,
      },
      {
        title: "Subtract the constant",
        body:
          b < 0
            ? `${formatSum([{ coefficient: a, variable: "x" }])} = ${formatNumber(c)} + ${formatNumber(-b)} = ${formatNumber(c - b)}.`
            : `${formatSum([{ coefficient: a, variable: "x" }])} = ${formatNumber(c)} − ${formatNumber(b)} = ${formatNumber(c - b)}.`,
      },
      {
        title: "Divide by the coefficient",
        body: `x = ${formatNumber(c - b)} ÷ ${formatNumber(a)} = ${formatNumber(x)}.`,
      },
    ],
  };
}

export function solveQuadratic(a: number, b: number, c: number): EquationSolution | null {
  if (![a, b, c].every(Number.isFinite)) {
    return null;
  }

  if (a === 0) {
    const linear = solveLinear(b, c, 0);
    return linear
      ? {
          summary: linear.summary,
          steps: [
            {
              title: "Notice the square term is missing",
              body: "a is 0, so ax² + bx + c = 0 becomes a linear equation.",
            },
            ...linear.steps,
          ],
        }
      : null;
  }

  const discriminant = b * b - 4 * a * c;

  if (discriminant < 0) {
    return {
      summary: "No real solutions",
      steps: [
        {
          title: "Write the quadratic formula",
          body: "x = (−b ± √(b² − 4ac)) ÷ 2a.",
        },
        {
          title: "Compute the discriminant",
          body: `b² − 4ac = ${paren(b)}² − 4(${paren(a)})(${paren(c)}) = ${formatNumber(discriminant)}.`,
        },
        {
          title: "Interpret the sign",
          body: "A negative discriminant means the parabola does not cross the x-axis, so there are no real solutions.",
        },
      ],
    };
  }

  const root = Math.sqrt(discriminant);
  const left = (-b - root) / (2 * a);
  const right = (-b + root) / (2 * a);

  if (discriminant === 0) {
    return {
      summary: `x = ${formatNumber(left)}`,
      steps: [
        {
          title: "Compute the discriminant",
          body: `b² − 4ac = ${formatNumber(discriminant)}. The equation has one real solution.`,
        },
        {
          title: "Apply the quadratic formula",
          body: `x = −(${formatNumber(b)}) ÷ (2 × ${formatNumber(a)}) = ${formatNumber(left)}.`,
        },
      ],
    };
  }

  return {
    summary: `x = ${formatNumber(left)} or x = ${formatNumber(right)}`,
    steps: [
      {
        title: "Write the quadratic formula",
        body: "x = (−b ± √(b² − 4ac)) ÷ 2a.",
      },
      {
        title: "Compute the discriminant",
        body: `b² − 4ac = ${paren(b)}² − ${paren(4 * a * c)} = ${formatNumber(discriminant)}.`,
      },
      {
        title: "Take the square root",
        body: `√${formatNumber(discriminant)} = ${formatNumber(root)}.`,
      },
      {
        title: "Find both solutions",
        body: `x = (${formatNumber(-b)} − ${formatNumber(root)}) ÷ ${formatNumber(2 * a)} = ${formatNumber(left)}, and x = (${formatNumber(-b)} + ${formatNumber(root)}) ÷ ${formatNumber(2 * a)} = ${formatNumber(right)}.`,
      },
    ],
  };
}

function formatSum(terms: Array<{ coefficient: number; variable: string }>) {
  const visible = terms.filter((term) => term.coefficient !== 0);

  if (visible.length === 0) {
    return "0";
  }

  return visible
    .map((term, index) => {
      const magnitude = formatNumber(Math.abs(term.coefficient));
      const number =
        term.variable && Math.abs(Math.abs(term.coefficient) - 1) < 1e-9 ? "" : magnitude;
      const piece = `${number}${term.variable}`;

      if (index === 0) {
        return term.coefficient < 0 ? `-${piece}` : piece;
      }

      return `${term.coefficient < 0 ? " - " : " + "}${piece}`;
    })
    .join("");
}

function paren(value: number) {
  const text = formatNumber(value);
  return text.startsWith("-") ? `(${text})` : text;
}

export function formatNumber(value: number) {
  if (value === 0) {
    return "0";
  }

  const absolute = Math.abs(value);
  const text =
    absolute >= 100000 || absolute < 0.0001
      ? value.toExponential(6)
      : value.toPrecision(10);

  if (!text.includes(".")) {
    return text;
  }

  return text.replace(/(\.\d*?)0+(e|$)/, "$1$2").replace(/\.e/, "e").replace(/\.$/, "");
}
