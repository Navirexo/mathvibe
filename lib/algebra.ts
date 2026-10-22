import { formatNumber, solveLinear, solveQuadratic, type SolverStep } from "@/lib/solver";

export type AlgebraMode = "solve" | "simplify";

export type AlgebraEvaluation =
  | { status: "empty" }
  | { status: "incomplete" }
  | { status: "invalid"; message: string }
  | { status: "ok"; summary: string; steps: SolverStep[] };

type Term = {
  coefficient: number;
  power: number;
};

class AlgebraError extends Error {
  constructor(
    message: string,
    readonly incomplete = false,
  ) {
    super(message);
  }
}

export function analyzeAlgebra(input: string, mode: AlgebraMode): AlgebraEvaluation {
  const trimmed = input.trim();

  if (!trimmed) {
    return { status: "empty" };
  }

  const compact = preprocess(trimmed);

  if (!compact) {
    return { status: "empty" };
  }

  const equalsCount = compact.split("=").length - 1;

  if (mode === "simplify" && equalsCount > 0) {
    return {
      status: "invalid",
      message: "Remove the equals sign to simplify, or switch to Solve.",
    };
  }

  if (mode === "solve" && equalsCount === 0) {
    return { status: "incomplete" };
  }

  if (mode === "solve" && equalsCount !== 1) {
    return { status: "invalid", message: "Use one equals sign." };
  }

  try {
    if (mode === "simplify") {
      return simplify(trimmed, compact);
    }

    const [left, right] = compact.split("=");

    if (!left || !right) {
      return { status: "incomplete" };
    }

    return solveEquation(trimmed, left, right);
  } catch (error) {
    if (error instanceof AlgebraError && error.incomplete) {
      return { status: "incomplete" };
    }

    return {
      status: "invalid",
      message: error instanceof Error ? error.message : "Enter a valid expression.",
    };
  }
}

function simplify(original: string, compact: string): AlgebraEvaluation {
  const parsed = parseDetailed(compact);
  const combined = combine(parsed.terms);

  return {
    status: "ok",
    summary: formatPolynomial(combined),
    steps: [
      { title: "Read the expression", body: original },
      ...parsed.expansions.map((body) => ({ title: "Distribute", body })),
      ...combineSteps(parsed.terms),
      {
        title: "Write the simplified expression",
        body: formatPolynomial(combined),
      },
    ],
  };
}

function solveEquation(original: string, left: string, right: string): AlgebraEvaluation {
  const leftParsed = parseDetailed(left);
  const rightParsed = parseDetailed(right);
  const moved = rightParsed.terms.map((term) => ({
    coefficient: -term.coefficient,
    power: term.power,
  }));
  const combined = combine([...leftParsed.terms, ...moved]);
  const maxPower = Math.max(0, ...combined.keys());

  if (maxPower > 2) {
    throw new AlgebraError(
      `This page solves powers up to x^2. This equation includes x^${maxPower}.`,
    );
  }

  const steps: SolverStep[] = [
    { title: "Write the equation", body: original },
    ...[...leftParsed.expansions, ...rightParsed.expansions].map((body) => ({
      title: "Distribute",
      body,
    })),
    {
      title: "Move every term to one side",
      body: `${formatPolynomial(combined)} = 0.`,
    },
  ];

  const quadratic = combined.get(2) ?? 0;
  const linear = combined.get(1) ?? 0;
  const constant = combined.get(0) ?? 0;

  if (maxPower === 0) {
    const balanced = Math.abs(constant) < 1e-9;

    return {
      status: "ok",
      summary: balanced ? "True for every x" : "No solution",
      steps: [
        ...steps,
        {
          title: "Compare the constants",
          body: balanced
            ? "Both sides match, so the equation is true for every value of x."
            : "The two sides are different numbers, so no value of x works.",
        },
      ],
    };
  }

  const solution =
    maxPower === 2
      ? solveQuadratic(quadratic, linear, constant)
      : solveLinear(linear, constant, 0);

  if (!solution) {
    throw new AlgebraError("Enter finite numbers.");
  }

  const workedSteps = solution.steps.filter(
    (step, index) => !(index === 0 && step.title === "Write the equation"),
  );

  return {
    status: "ok",
    summary: solution.summary,
    steps: [...steps, ...workedSteps],
  };
}

function combineSteps(terms: Term[]): SolverStep[] {
  const groups = new Map<number, Term[]>();

  for (const term of terms) {
    const group = groups.get(term.power) ?? [];
    group.push(term);
    groups.set(term.power, group);
  }

  return [...groups.entries()]
    .filter(([, group]) => group.length > 1)
    .sort((left, right) => right[0] - left[0])
    .map(([power, group]) => {
      const total = group.reduce((sum, term) => sum + term.coefficient, 0);

      return {
        title: `Combine ${powerLabel(power)}`,
        body: `${joinUncombined(group)} = ${formatPolynomial(new Map([[power, total]]))}.`,
      };
    });
}

function parseDetailed(source: string) {
  if (source.includes("/")) {
    throw new AlgebraError(
      "Division stays on the scientific calculator. This solver uses +, -, and parentheses.",
    );
  }

  const parser = new PolyParser(source);
  const terms = parser.parseSum();

  if (!parser.done()) {
    throw new AlgebraError("Use + or - between terms.");
  }

  return { terms, expansions: parser.expansions };
}

class PolyParser {
  private index = 0;
  readonly expansions: string[] = [];

  constructor(private source: string) {}

  parseSum(): Term[] {
    if (this.done()) {
      throw new AlgebraError("The expression is incomplete.", true);
    }

    let sign = 1;

    if (this.peek() === "+") {
      this.index += 1;
    } else if (this.peek() === "-") {
      sign = -1;
      this.index += 1;
    }

    const terms = this.parseTerm(sign);

    while (!this.done() && (this.peek() === "+" || this.peek() === "-")) {
      sign = this.peek() === "+" ? 1 : -1;
      this.index += 1;

      if (this.done()) {
        throw new AlgebraError("The expression is incomplete.", true);
      }

      terms.push(...this.parseTerm(sign));
    }

    return terms;
  }

  done() {
    return this.index >= this.source.length;
  }

  private parseTerm(sign: number): Term[] {
    if (this.peek() === "(") {
      return this.distribute(sign);
    }

    if (this.isX()) {
      return [this.xTerm(sign)];
    }

    if (this.isNumberStart()) {
      const factor = sign * this.readNumber();

      if (this.peek() === "*") {
        this.index += 1;

        if (this.done()) {
          throw new AlgebraError("The expression is incomplete.", true);
        }
      }

      if (this.peek() === "(") {
        return this.distribute(factor);
      }

      if (this.isX()) {
        return [this.xTerm(factor)];
      }

      if (this.source[this.index] === "*") {
        throw new AlgebraError("Use * only before x or parentheses.");
      }

      return [{ coefficient: factor, power: 0 }];
    }

    if (/[a-z]/i.test(this.peek())) {
      throw new AlgebraError("This solver uses the variable x.");
    }

    throw new AlgebraError("Enter a term such as 2x, x^2, or 3(x + 2).");
  }

  private distribute(factor: number): Term[] {
    this.index += 1;

    if (this.peek() === ")") {
      throw new AlgebraError("Enter an expression inside the parentheses.");
    }

    const inner = this.parseSum();

    if (this.peek() !== ")") {
      throw new AlgebraError("A closing parenthesis is missing.", this.done());
    }

    this.index += 1;
    const scaled = inner.map((term) => ({
      coefficient: term.coefficient * factor,
      power: term.power,
    }));
    this.expansions.push(
      `${formatFactor(factor)}(${joinUncombined(inner)}) = ${joinUncombined(scaled)}.`,
    );

    return scaled;
  }

  private xTerm(coefficient: number): Term {
    this.index += 1;

    return { coefficient, power: this.readPower() };
  }

  private readPower() {
    if (this.peek() !== "^") {
      return 1;
    }

    this.index += 1;

    if (this.done() || !/\d/.test(this.peek())) {
      throw new AlgebraError("The expression is incomplete.", true);
    }

    const match = /^\d+/.exec(this.source.slice(this.index));

    if (!match) {
      throw new AlgebraError("The expression is incomplete.", true);
    }

    this.index += match[0].length;
    const power = Number(match[0]);

    if (power > 12) {
      throw new AlgebraError("Use an exponent of 12 or less.");
    }

    return power;
  }

  private readNumber() {
    const match = /^(?:\d+\.?\d*|\.\d+)/.exec(this.source.slice(this.index));

    if (!match) {
      throw new AlgebraError("Enter a number.");
    }

    this.index += match[0].length;
    return Number(match[0]);
  }

  private isNumberStart() {
    return /\d|\./.test(this.peek());
  }

  private isX() {
    return this.peek().toLowerCase() === "x";
  }

  private peek() {
    return this.source[this.index] ?? "";
  }
}

function combine(terms: Term[]) {
  const combined = new Map<number, number>();

  for (const term of terms) {
    combined.set(term.power, (combined.get(term.power) ?? 0) + term.coefficient);
  }

  for (const [power, coefficient] of combined) {
    if (Math.abs(coefficient) < 1e-9) {
      combined.delete(power);
    }
  }

  return combined;
}

export function formatPolynomial(terms: Map<number, number>) {
  const powers = [...terms.entries()]
    .filter(([, coefficient]) => Math.abs(coefficient) >= 1e-9)
    .sort((left, right) => right[0] - left[0]);

  if (powers.length === 0) {
    return "0";
  }

  return powers
    .map(([power, coefficient], index) => {
      const magnitude = formatNumber(Math.abs(coefficient));
      const number = power > 0 && Math.abs(Math.abs(coefficient) - 1) < 1e-9 ? "" : magnitude;
      const variable = power === 0 ? "" : power === 1 ? "x" : `x^${power}`;
      const piece = `${number}${variable}`;

      if (index === 0) {
        return coefficient < 0 ? `-${piece}` : piece;
      }

      return `${coefficient < 0 ? " - " : " + "}${piece}`;
    })
    .join("");
}

function joinUncombined(terms: Term[]) {
  return terms
    .map((term, index) => {
      const text = formatPolynomial(new Map([[term.power, term.coefficient]]));

      if (index === 0) {
        return text;
      }

      if (text.startsWith("-")) {
        return ` - ${text.slice(1)}`;
      }

      return ` + ${text}`;
    })
    .join("");
}

function formatFactor(factor: number) {
  if (Math.abs(factor - 1) < 1e-9) {
    return "";
  }

  if (Math.abs(factor + 1) < 1e-9) {
    return "-";
  }

  return formatNumber(factor);
}

function powerLabel(power: number) {
  if (power === 0) {
    return "constants";
  }

  if (power === 1) {
    return "x terms";
  }

  return `x^${power} terms`;
}

function preprocess(value: string) {
  return value
    .replace(/\s+/g, "")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-")
    .replace(/x²/gi, "x^2")
    .replace(/x³/gi, "x^3");
}
