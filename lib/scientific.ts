export type AngleMode = "deg" | "rad";

export type CalcStep = {
  title: string;
  body: string;
};

export type CalcEvaluation =
  | { status: "empty" }
  | { status: "incomplete" }
  | { status: "invalid"; message: string }
  | {
      status: "ok";
      result: string;
      scientific: string;
      steps: CalcStep[];
    };

const FUNCTIONS = new Set([
  "sin",
  "cos",
  "tan",
  "asin",
  "acos",
  "atan",
  "sqrt",
  "cbrt",
  "log",
  "ln",
  "abs",
  "exp",
]);

class ParseError extends Error {
  constructor(
    message: string,
    readonly incomplete = false,
  ) {
    super(message);
  }
}

type Token =
  | { type: "num"; value: number }
  | { type: "id"; value: string }
  | { type: "op"; value: "+" | "-" | "*" | "/" | "^" }
  | { type: "lp" }
  | { type: "rp" };

export function evaluateExpression(input: string, mode: AngleMode): CalcEvaluation {
  const source = input.trim();

  if (!source) {
    return { status: "empty" };
  }

  try {
    const value = new Parser(tokenize(source), mode).parse();

    if (!Number.isFinite(value)) {
      return {
        status: "invalid",
        message: "That expression does not have a finite result.",
      };
    }

    const formatted = formatCalculatorValue(value);
    const usesTrig = /\b(?:a?sin|a?cos|a?tan)\b/i.test(source);

    return {
      status: "ok",
      result: formatted.standard,
      scientific: formatted.scientific,
      steps: [
        {
          title: "Read the expression",
          body: `The expression is ${source}.`,
        },
        {
          title: "Apply the angle mode",
          body: usesTrig
            ? mode === "deg"
              ? "sin, cos, and tan treat the input as degrees and convert it to radians. Inverse trig results are converted back to degrees."
              : "sin, cos, tan, and their inverses use radians."
            : "This expression has no trigonometry, so degrees and radians give the same result.",
        },
        {
          title: "Evaluate",
          body: `${source} = ${formatted.standard}.`,
        },
        {
          title: "Write scientific notation",
          body: `${formatted.standard} = ${formatted.scientific}.`,
        },
      ],
    };
  } catch (error) {
    if (error instanceof ParseError && error.incomplete) {
      return { status: "incomplete" };
    }

    return {
      status: "invalid",
      message: error instanceof Error ? error.message : "Enter a valid expression.",
    };
  }
}

export function formatCalculatorValue(value: number) {
  if (value === 0) {
    return { standard: "0", scientific: "0 × 10^0" };
  }

  const sign = value < 0 ? "-" : "";
  const absolute = Math.abs(value);
  const exponent = Math.floor(Math.log10(absolute));
  const mantissa = absolute / 10 ** exponent;
  const scientific = `${sign}${trimNumber(mantissa.toFixed(8))} × 10^${exponent}`;
  const standard =
    exponent >= -4 && exponent <= 8
      ? `${sign}${trimNumber(absolute.toPrecision(12))}`
      : scientific;

  return { standard, scientific };
}

function trimNumber(value: string) {
  if (!value.includes(".")) {
    return value;
  }

  return value.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
}

function tokenize(source: string) {
  const tokens: Token[] = [];
  let index = 0;

  while (index < source.length) {
    const character = source[index];

    if (/\s/.test(character)) {
      index += 1;
      continue;
    }

    if (character === "+" || character === "-" || character === "*" || character === "/" || character === "^") {
      tokens.push({ type: "op", value: character });
      index += 1;
      continue;
    }

    if (character === "(") {
      tokens.push({ type: "lp" });
      index += 1;
      continue;
    }

    if (character === ")") {
      tokens.push({ type: "rp" });
      index += 1;
      continue;
    }

    const rest = source.slice(index);
    const number = /^(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/i.exec(rest);

    if (number) {
      tokens.push({ type: "num", value: Number(number[0]) });
      index += number[0].length;
      continue;
    }

    const identifier = /^[a-z]+/i.exec(rest);

    if (identifier) {
      tokens.push({ type: "id", value: identifier[0].toLowerCase() });
      index += identifier[0].length;
      continue;
    }

    throw new ParseError(`“${character}” is not part of a calculator expression.`);
  }

  return tokens;
}

class Parser {
  private index = 0;

  constructor(
    private tokens: Token[],
    private mode: AngleMode,
  ) {}

  parse() {
    const value = this.expression();

    if (!this.done()) {
      throw new ParseError("Unexpected input after the expression.");
    }

    return value;
  }

  private expression() {
    let value = this.term();

    while (this.isOperator("+") || this.isOperator("-")) {
      const operator = this.operator();
      value = operator === "+" ? value + this.term() : value - this.term();
    }

    return value;
  }

  private term() {
    let value = this.unary();

    while (this.isOperator("*") || this.isOperator("/")) {
      const operator = this.operator();
      const next = this.unary();

      if (operator === "/" && next === 0) {
        throw new ParseError("Division by zero is undefined.");
      }

      value = operator === "*" ? value * next : value / next;
    }

    return value;
  }

  private unary(): number {
    if (this.isOperator("+")) {
      this.index += 1;
      return this.unary();
    }

    if (this.isOperator("-")) {
      this.index += 1;
      return -this.unary();
    }

    return this.power();
  }

  private power() {
    const base = this.primary();

    if (!this.isOperator("^")) {
      return base;
    }

    this.index += 1;
    return base ** this.unary();
  }

  private primary(): number {
    if (this.done()) {
      throw new ParseError("The expression is incomplete.", true);
    }

    const token = this.tokens[this.index];

    if (token.type === "num") {
      this.index += 1;
      return this.withImplicit(token.value);
    }

    if (token.type === "lp") {
      this.index += 1;
      const value = this.expression();

      if (this.done()) {
        throw new ParseError("The expression is incomplete.", true);
      }

      if (this.tokens[this.index].type !== "rp") {
        throw new ParseError("A closing parenthesis is missing.");
      }

      this.index += 1;
      return this.withImplicit(value);
    }

    if (token.type === "id") {
      this.index += 1;
      const name = token.value;

      if (name === "pi") {
        return this.withImplicit(Math.PI);
      }

      if (name === "e") {
        return this.withImplicit(Math.E);
      }

      if (!FUNCTIONS.has(name)) {
        throw new ParseError(`“${name}” is not a calculator function.`);
      }

      if (this.done()) {
        throw new ParseError("The expression is incomplete.", true);
      }

      if (this.tokens[this.index].type !== "lp") {
        throw new ParseError(`${name} needs an argument in parentheses.`);
      }

      this.index += 1;
      const argument = this.expression();

      if (this.done()) {
        throw new ParseError("The expression is incomplete.", true);
      }

      if (this.tokens[this.index].type !== "rp") {
        throw new ParseError(`Close the parentheses after ${name}.`);
      }

      this.index += 1;
      return this.withImplicit(applyFunction(name, argument, this.mode));
    }

    throw new ParseError("Enter a number, a constant, or a function.");
  }

  private withImplicit(value: number) {
    const next = this.tokens[this.index];

    if (next && (next.type === "num" || next.type === "id" || next.type === "lp")) {
      return value * this.primary();
    }

    return value;
  }

  private isOperator(operator: "+" | "-" | "*" | "/" | "^") {
    const token = this.tokens[this.index];
    return token?.type === "op" && token.value === operator;
  }

  private operator() {
    const token = this.tokens[this.index];

    if (token?.type !== "op") {
      throw new ParseError("The expression is incomplete.", true);
    }

    this.index += 1;
    return token.value;
  }

  private done() {
    return this.index >= this.tokens.length;
  }
}

function applyFunction(name: string, argument: number, mode: AngleMode) {
  const toRadians = (value: number) => (mode === "deg" ? (value * Math.PI) / 180 : value);
  const fromRadians = (value: number) => (mode === "deg" ? (value * 180) / Math.PI : value);

  switch (name) {
    case "sin":
      return Math.sin(toRadians(argument));
    case "cos":
      return Math.cos(toRadians(argument));
    case "tan": {
      const radians = toRadians(argument);
      if (Math.abs(Math.cos(radians)) < 1e-12) {
        throw new ParseError("Tangent is undefined for that angle.");
      }
      return Math.tan(radians);
    }
    case "asin":
      if (argument < -1 || argument > 1) {
        throw new ParseError("Inverse sine needs a value from -1 to 1.");
      }
      return fromRadians(Math.asin(argument));
    case "acos":
      if (argument < -1 || argument > 1) {
        throw new ParseError("Inverse cosine needs a value from -1 to 1.");
      }
      return fromRadians(Math.acos(argument));
    case "atan":
      return fromRadians(Math.atan(argument));
    case "sqrt":
      if (argument < 0) {
        throw new ParseError("Square root needs a number that is zero or greater.");
      }
      return Math.sqrt(argument);
    case "cbrt":
      return Math.cbrt(argument);
    case "log":
      if (argument <= 0) {
        throw new ParseError("Logarithm needs a positive number.");
      }
      return Math.log10(argument);
    case "ln":
      if (argument <= 0) {
        throw new ParseError("Natural log needs a positive number.");
      }
      return Math.log(argument);
    case "exp":
      return Math.exp(argument);
    case "abs":
      return Math.abs(argument);
    default:
      throw new ParseError(`“${name}” is not a calculator function.`);
  }
}
