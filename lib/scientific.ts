import { formatDetailedReport } from "@/lib/report";

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
      value: number;
      result: string;
      scientific: string;
      steps: CalcStep[];
      usesAngle: boolean;
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
  | { type: "postfix"; value: "!" | "%" }
  | { type: "lp" }
  | { type: "rp" };

export type HistoryRecord = {
  expression: string;
  result: string;
  mode: AngleMode;
};

export function evaluateExpression(
  input: string,
  mode: AngleMode,
  ans: number | null = null,
): CalcEvaluation {
  const source = canonicalExpression(input);

  if (!source) {
    return { status: "empty" };
  }

  try {
    const value = new Parser(tokenize(source), mode, ans).parse();

    if (!Number.isFinite(value)) {
      return {
        status: "invalid",
        message: "That expression does not have a finite result.",
      };
    }

    const formatted = formatCalculatorValue(value);
    const inverse = bareInverse(source);
    const usesAngle = inverse !== null || usesTrig(source);
    const result = inverse ? withAngleUnit(formatted.standard, mode) : formatted.standard;

    return {
      status: "ok",
      value,
      result,
      scientific: formatted.scientific,
      usesAngle,
      steps: buildSteps(source, mode, formatted.standard, formatted.scientific, result, inverse),
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

export function formatScientificReport(
  expression: string,
  mode: AngleMode,
  evaluation: Extract<CalcEvaluation, { status: "ok" }>,
  previousAnswer: number | null = null,
) {
  const fields = [
    { label: "Expression", value: readableExpression(expression) },
    { label: "Result", value: evaluation.result },
    { label: "Scientific notation", value: evaluation.scientific },
  ];

  if (/\bans\b/i.test(expression) && previousAnswer !== null && Number.isFinite(previousAnswer)) {
    fields.splice(1, 0, {
      label: "Previous answer",
      value: formatCalculatorValue(previousAnswer).standard,
    });
  }

  if (evaluation.usesAngle) {
    fields.push({
      label: "Angle mode",
      value: mode === "deg" ? "Degrees" : "Radians",
    });
  }

  return formatDetailedReport({
    title: "Scientific Calculator Result",
    fields,
    notes: [roundingNote(evaluation.value, formatCalculatorValue(evaluation.value).standard)],
    steps: evaluation.steps,
  });
}

export function formatHistoryEntry(
  expression: string,
  result: string,
  scientific: string,
  mode: AngleMode | null,
) {
  return {
    primary: `${expression} = ${result}`,
    detail: `Scientific notation: ${scientific}`,
    modeLabel: mode === "deg" ? "Degrees" : mode === "rad" ? "Radians" : null,
  };
}

export function appendHistory<T extends HistoryRecord>(entries: T[], entry: T, limit = 8) {
  const latest = entries[0];

  if (
    latest &&
    latest.expression === entry.expression &&
    latest.result === entry.result &&
    latest.mode === entry.mode
  ) {
    return entries;
  }

  return [entry, ...entries].slice(0, limit);
}

export function toggleSign(expression: string, cursor: number) {
  const at = clamp(cursor, expression.length);
  const number = /(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/gi;
  let match: RegExpExecArray | null;
  let target: { start: number; end: number } | null = null;

  while ((match = number.exec(expression))) {
    const start = match.index;
    const end = start + match[0].length;

    if (start <= at && at <= end) {
      target = { start, end };
      break;
    }

    if (end <= at) {
      target = { start, end };
    }

    if (start > at) {
      break;
    }
  }

  if (!target) {
    return insertAt(expression, at, "-");
  }

  const minusIndex = target.start - 1;
  const beforeMinus = expression[minusIndex - 1];
  const isUnaryMinus =
    expression[minusIndex] === "-" &&
    (minusIndex === 0 || beforeMinus === undefined || /[+\-*/^(]/.test(beforeMinus));

  if (isUnaryMinus) {
    return {
      expression: expression.slice(0, minusIndex) + expression.slice(target.start),
      cursor: Math.max(minusIndex, at - 1),
    };
  }

  const operator = expression[minusIndex];

  if (operator === "+" || operator === "-") {
    const flipped = operator === "+" ? "-" : "+";
    return {
      expression: expression.slice(0, minusIndex) + flipped + expression.slice(target.start),
      cursor: at,
    };
  }

  const next = insertAt(expression, target.start, "-");
  return {
    expression: next.expression,
    cursor: at >= target.end ? target.end + 1 : next.cursor,
  };
}

export function clearEntry(expression: string, start: number, end = start) {
  const from = clamp(Math.min(start, end), expression.length);
  const to = clamp(Math.max(start, end), expression.length);

  if (from !== to) {
    return {
      expression: expression.slice(0, from) + expression.slice(to),
      cursor: from,
    };
  }

  const spans = entrySpans(expression);
  const target =
    spans.find((span) => span.start < from && from <= span.end) ??
    spans.find((span) => span.start <= from && from < span.end) ??
    entryBeforeCursor(spans, expression, from);

  if (!target) {
    return { expression, cursor: from };
  }

  return {
    expression: expression.slice(0, target.start) + expression.slice(target.end),
    cursor: target.start,
  };
}

export function insertSquare(expression: string, start: number, end = start) {
  return insertTransformed(expression, start, end, "^2", (value) =>
    shouldWrap(value) ? `(${value})^2` : `${value}^2`,
  );
}

export function insertReciprocal(expression: string, start: number, end = start) {
  return insertTransformed(expression, start, end, "1/", (value) => `1/(${value})`);
}

export function formatCalculatorValue(value: number) {
  if (value === 0) {
    return { standard: "0", scientific: "0 × 10⁰" };
  }

  const sign = value < 0 ? "-" : "";
  const absolute = Math.abs(value);
  const exponent = Math.floor(Math.log10(absolute));
  const mantissa = absolute / 10 ** exponent;
  const scientific = `${sign}${trimNumber(mantissa.toFixed(8))} × 10${superscript(exponent)}`;
  const standard =
    exponent >= -4 && exponent <= 8
      ? `${sign}${trimNumber(absolute.toPrecision(12))}`
      : scientific;

  return { standard, scientific };
}

function buildSteps(
  source: string,
  mode: AngleMode,
  standard: string,
  scientific: string,
  result: string,
  inverse: { name: "asin" | "acos" | "atan"; argument: string } | null,
) {
  const steps: CalcStep[] = [];
  const readable = readableExpression(source);

  if (inverse) {
    const ratio = { asin: "sine", acos: "cosine", atan: "tangent" }[inverse.name];
    steps.push({
      title: "Read the expression",
      body: `Find the angle whose ${ratio} is ${readableExpression(inverse.argument)}.`,
    });
    steps.push({
      title: "Apply the angle mode",
      body:
        mode === "deg"
          ? "The inverse trigonometric result is expressed in degrees."
          : "The inverse trigonometric result is expressed in radians.",
    });
  } else {
    steps.push({
      title: "Read the expression",
      body: `The expression is ${readable}.`,
    });

    if (usesTrig(source)) {
      steps.push({
        title: "Apply the angle mode",
        body:
          mode === "deg"
            ? "sin, cos, and tan treat the input as degrees and convert it to radians."
            : "sin, cos, and tan use radians.",
      });
    }
  }

  if (hasTopLevel(source, "+-") && hasTopLevel(source, "*/")) {
    steps.push({
      title: "Apply precedence",
      body: "Multiplication and division happen before addition and subtraction. Parentheses are evaluated first.",
    });
  }

  if (source.includes("%")) {
    steps.push({
      title: "Apply percent",
      body: "Percent divides the value before it by 100.",
    });
  }

  if (source.includes("!")) {
    steps.push({
      title: "Apply factorial",
      body: "Factorial multiplies every whole number from 1 through that value. 0! is 1.",
    });
  }

  steps.push({
    title: "Evaluate",
    body: `${readable} = ${result}.`,
  });
  steps.push({
    title: "Write scientific notation",
    body: `${standard} = ${scientific}.`,
  });

  return steps;
}

function canonicalExpression(input: string) {
  return input
    .trim()
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/[−–]/g, "-");
}

function readableExpression(source: string) {
  return canonicalExpression(source)
    .replace(/\basin\b/gi, "sin⁻¹")
    .replace(/\bacos\b/gi, "cos⁻¹")
    .replace(/\batan\b/gi, "tan⁻¹")
    .replace(/\bsqrt\b/gi, "√")
    .replace(/\bcbrt\b/gi, "∛")
    .replace(/\bexp\b/gi, "e^")
    .replace(/\bpi\b/gi, "π")
    .replace(/\*/g, "×")
    .replace(/\//g, "÷");
}

function usesTrig(source: string) {
  return /\b(?:asin|acos|atan|sin|cos|tan)\b/i.test(source);
}

function bareInverse(source: string) {
  const compact = source.trim().replace(/\s+/g, "");

  for (const name of ["asin", "acos", "atan"] as const) {
    const argument = outerArgument(compact, name);
    if (argument !== null) {
      return { name, argument };
    }
  }

  return null;
}

function outerArgument(source: string, name: string) {
  const head = `${name.toLowerCase()}(`;

  if (!source.toLowerCase().startsWith(head)) {
    return null;
  }

  let depth = 0;

  for (let index = name.length; index < source.length; index += 1) {
    const character = source[index];

    if (character === "(") {
      depth += 1;
    } else if (character === ")") {
      depth -= 1;

      if (depth === 0) {
        return index === source.length - 1 ? source.slice(name.length + 1, index) : null;
      }
    }
  }

  return null;
}

function withAngleUnit(standard: string, mode: AngleMode) {
  return mode === "deg" ? `${standard}°` : `${standard} rad`;
}

function roundingNote(value: number, standard: string) {
  if (standard.includes("×")) {
    return null;
  }

  const parsed = Number(standard);

  if (!Number.isFinite(parsed) || Object.is(parsed, value)) {
    return null;
  }

  if (Math.abs(parsed - value) <= 1e-9 * Math.max(1, Math.abs(value))) {
    return null;
  }

  return `Rounded for display: ${standard}.`;
}

function superscript(exponent: number) {
  const digits: Record<string, string> = {
    "0": "⁰",
    "1": "¹",
    "2": "²",
    "3": "³",
    "4": "⁴",
    "5": "⁵",
    "6": "⁶",
    "7": "⁷",
    "8": "⁸",
    "9": "⁹",
    "-": "⁻",
  };

  return String(exponent).replace(/[0-9-]/g, (digit) => digits[digit]);
}

function trimNumber(value: string) {
  if (!value.includes(".")) {
    return value;
  }

  return value.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
}

function hasTopLevel(source: string, operators: string) {
  let depth = 0;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];

    if (character === "(") {
      depth += 1;
    } else if (character === ")") {
      depth -= 1;
    } else if (depth === 0 && operators.includes(character)) {
      const previous = source[index - 1];
      const unary = (character === "+" || character === "-") && (index === 0 || /[+\-*/^(]/.test(previous ?? ""));

      if (!unary) {
        return true;
      }
    }
  }

  return false;
}

function shouldWrap(expression: string) {
  return hasTopLevel(expression, "+-*/") || expression.trim().startsWith("-");
}

function insertTransformed(
  expression: string,
  start: number,
  end: number,
  token: string,
  wrap: (value: string) => string,
) {
  const from = clamp(Math.min(start, end), expression.length);
  const to = clamp(Math.max(start, end), expression.length);

  if (from !== to) {
    const next = wrap(expression.slice(from, to));
    return {
      expression: expression.slice(0, from) + next + expression.slice(to),
      cursor: from + next.length,
    };
  }

  if (expression && from === expression.length && !/[+\-*/^(]$/.test(expression)) {
    const next = wrap(expression);
    return { expression: next, cursor: next.length };
  }

  return insertAt(expression, from, token);
}

function insertAt(expression: string, cursor: number, token: string) {
  const at = clamp(cursor, expression.length);
  return {
    expression: expression.slice(0, at) + token + expression.slice(at),
    cursor: at + token.length,
  };
}

function clamp(cursor: number, length: number) {
  return Math.max(0, Math.min(cursor, length));
}

function entryBeforeCursor(
  spans: { start: number; end: number }[],
  expression: string,
  cursor: number,
) {
  const previous = [...spans].reverse().find((span) => span.end <= cursor);

  if (!previous) {
    return undefined;
  }

  const between = expression.slice(previous.end, cursor);
  return between === "" || /^\)+$/.test(between) ? previous : undefined;
}

function entrySpans(expression: string) {
  const spans: { start: number; end: number }[] = [];
  let index = 0;

  while (index < expression.length) {
    const rest = expression.slice(index);
    const number = /^(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/i.exec(rest);
    const identifier = number ? null : /^[a-z]+/i.exec(rest);
    const token = number?.[0] ?? identifier?.[0];

    if (!token) {
      index += 1;
      continue;
    }

    let end = index + token.length;

    while (expression[end] === "!" || expression[end] === "%") {
      end += 1;
    }

    spans.push({ start: index, end });
    index = end;
  }

  return spans;
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

    if (character === "!" || character === "%") {
      tokens.push({ type: "postfix", value: character });
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
    private ans: number | null,
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
      return this.finish(token.value);
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
      return this.finish(value);
    }

    if (token.type === "id") {
      this.index += 1;
      const name = token.value;

      if (name === "pi") {
        return this.finish(Math.PI);
      }

      if (name === "e") {
        return this.finish(Math.E);
      }

      if (name === "ans") {
        if (this.ans === null || !Number.isFinite(this.ans)) {
          throw new ParseError("Press equals to save an answer before using Ans.");
        }

        return this.finish(this.ans);
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
      return this.finish(applyFunction(name, argument, this.mode));
    }

    throw new ParseError("Enter a number, a constant, or a function.");
  }

  private finish(value: number) {
    let current = value;

    while (this.isPostfix()) {
      const token = this.tokens[this.index];
      this.index += 1;

      if (token.type === "postfix" && token.value === "!") {
        current = factorial(current);
      } else if (token.type === "postfix" && token.value === "%") {
        current = current / 100;
      }
    }

    return this.withImplicit(current);
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

  private isPostfix() {
    return this.tokens[this.index]?.type === "postfix";
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

function factorial(value: number) {
  if (!Number.isFinite(value) || value < 0 || !Number.isInteger(value)) {
    throw new ParseError("Factorial needs a whole number that is zero or greater.");
  }

  if (value > 170) {
    throw new ParseError("That factorial is too large to calculate.");
  }

  let result = 1;

  for (let factor = 2; factor <= value; factor += 1) {
    result *= factor;
  }

  return result;
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
