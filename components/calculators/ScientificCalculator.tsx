"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import { evaluateExpression, type AngleMode } from "@/lib/scientific";
import { useMemo, useRef, useState } from "react";

type HistoryEntry = {
  id: number;
  expression: string;
  result: string;
  scientific: string;
  mode: AngleMode;
};

type KeyTone = "digit" | "operator" | "function" | "equals";

type KeyDef = {
  label: string;
  aria: string;
  insert?: string;
  action?: "delete" | "clear" | "equals";
  tone: KeyTone;
  span?: number;
};

const keyRows: KeyDef[][] = [
  [
    { label: "sin", aria: "sine", insert: "sin(", tone: "function" },
    { label: "cos", aria: "cosine", insert: "cos(", tone: "function" },
    { label: "tan", aria: "tangent", insert: "tan(", tone: "function" },
    { label: "√", aria: "square root", insert: "sqrt(", tone: "function" },
    { label: "ln", aria: "natural log", insert: "ln(", tone: "function" },
  ],
  [
    { label: "sin⁻¹", aria: "inverse sine", insert: "asin(", tone: "function" },
    { label: "cos⁻¹", aria: "inverse cosine", insert: "acos(", tone: "function" },
    { label: "tan⁻¹", aria: "inverse tangent", insert: "atan(", tone: "function" },
    { label: "∛", aria: "cube root", insert: "cbrt(", tone: "function" },
    { label: "log", aria: "log base 10", insert: "log(", tone: "function" },
  ],
  [
    { label: "(", aria: "open parenthesis", insert: "(", tone: "function" },
    { label: ")", aria: "close parenthesis", insert: ")", tone: "function" },
    { label: "xʸ", aria: "power", insert: "^", tone: "operator" },
    { label: "π", aria: "pi", insert: "pi", tone: "function" },
    { label: "e", aria: "Euler's number", insert: "e", tone: "function" },
  ],
  [
    { label: "7", aria: "7", insert: "7", tone: "digit" },
    { label: "8", aria: "8", insert: "8", tone: "digit" },
    { label: "9", aria: "9", insert: "9", tone: "digit" },
    { label: "÷", aria: "divide", insert: "/", tone: "operator" },
    { label: "⌫", aria: "backspace", action: "delete", tone: "operator" },
  ],
  [
    { label: "4", aria: "4", insert: "4", tone: "digit" },
    { label: "5", aria: "5", insert: "5", tone: "digit" },
    { label: "6", aria: "6", insert: "6", tone: "digit" },
    { label: "×", aria: "multiply", insert: "*", tone: "operator" },
    { label: "AC", aria: "all clear", action: "clear", tone: "operator" },
  ],
  [
    { label: "1", aria: "1", insert: "1", tone: "digit" },
    { label: "2", aria: "2", insert: "2", tone: "digit" },
    { label: "3", aria: "3", insert: "3", tone: "digit" },
    { label: "−", aria: "subtract", insert: "-", tone: "operator" },
    { label: "EE", aria: "scientific notation", insert: "e", tone: "function" },
  ],
  [
    { label: "0", aria: "0", insert: "0", tone: "digit", span: 2 },
    { label: ".", aria: "decimal point", insert: ".", tone: "digit" },
    { label: "+", aria: "add", insert: "+", tone: "operator" },
    { label: "=", aria: "equals", action: "equals", tone: "equals" },
  ],
];

const examples = ["2+3*4", "sin(30)", "sqrt(2)", "2^10", "6.02e23"];

export function ScientificCalculator() {
  const inputRef = useRef<HTMLInputElement>(null);
  const expressionRef = useRef("");
  const cursorRef = useRef(0);
  const nextHistoryId = useRef(1);
  const [expression, setExpression] = useState("");
  const [mode, setMode] = useState<AngleMode>("deg");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [notice, setNotice] = useState("");
  const evaluation = useMemo(
    () => evaluateExpression(expression, mode),
    [expression, mode],
  );

  function placeCursor(cursor: number) {
    cursorRef.current = cursor;
    requestAnimationFrame(() => {
      const field = inputRef.current;
      field?.focus();
      field?.setSelectionRange(cursor, cursor);
    });
  }

  function selection() {
    const field = inputRef.current;
    const current = expressionRef.current;

    if (field && field.value === current) {
      return {
        start: field.selectionStart ?? cursorRef.current,
        end: field.selectionEnd ?? cursorRef.current,
      };
    }

    return { start: cursorRef.current, end: cursorRef.current };
  }

  function replaceExpression(next: string, cursor: number) {
    expressionRef.current = next;
    setExpression(next);
    setNotice("");
    placeCursor(cursor);
  }

  function insert(token: string) {
    const { start, end } = selection();
    const current = expressionRef.current;
    replaceExpression(`${current.slice(0, start)}${token}${current.slice(end)}`, start + token.length);
  }

  function backspace() {
    const { start, end } = selection();
    const current = expressionRef.current;

    if (start !== end) {
      replaceExpression(`${current.slice(0, start)}${current.slice(end)}`, start);
      return;
    }

    if (start === 0) {
      return;
    }

    replaceExpression(`${current.slice(0, start - 1)}${current.slice(start)}`, start - 1);
  }

  function remember() {
    const current = expressionRef.current;
    const latest = evaluateExpression(current, mode);

    if (latest.status !== "ok") {
      return;
    }

    const entry: HistoryEntry = {
      id: nextHistoryId.current,
      expression: current,
      result: latest.result,
      scientific: latest.scientific,
      mode,
    };
    nextHistoryId.current += 1;
    setHistory((current) => [entry, ...current].slice(0, 8));
  }

  function press(key: KeyDef) {
    if (key.action === "clear") {
      replaceExpression("", 0);
      return;
    }

    if (key.action === "delete") {
      backspace();
      return;
    }

    if (key.action === "equals") {
      remember();
      return;
    }

    if (key.insert) {
      insert(key.insert);
    }
  }

  async function copyResult() {
    if (evaluation.status !== "ok") {
      return;
    }

    try {
      await navigator.clipboard.writeText(`${expression} = ${evaluation.result}`);
      setNotice("Copied to clipboard.");
    } catch {
      setNotice("Clipboard permission was blocked.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Angle mode">
          <Button variant={mode === "deg" ? "primary" : "secondary"} onClick={() => setMode("deg")}>
            Degrees
          </Button>
          <Button variant={mode === "rad" ? "primary" : "secondary"} onClick={() => setMode("rad")}>
            Radians
          </Button>
        </div>
        <Input
          ref={inputRef}
          label="Expression"
          name="expression"
          autoComplete="off"
          spellCheck={false}
          placeholder="sin(30) + 2^3"
          value={expression}
          error={evaluation.status === "invalid" ? evaluation.message : undefined}
          hint={
            evaluation.status === "invalid"
              ? undefined
              : "Type or use the keypad. EE writes scientific notation, as in 6.02e23. Results update as you type."
          }
          onChange={(event) => {
            expressionRef.current = event.target.value;
            cursorRef.current = event.target.selectionStart ?? event.target.value.length;
            setExpression(event.target.value);
            setNotice("");
          }}
          onSelect={(event) => {
            cursorRef.current = event.currentTarget.selectionStart ?? cursorRef.current;
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              remember();
            }
          }}
        />
        <div className="mt-4 grid grid-cols-5 gap-2" aria-label="Calculator keypad">
          {keyRows.flat().map((key) => (
            <Button
              key={`${key.label}-${key.aria}`}
              variant={key.tone === "equals" ? "primary" : key.tone === "operator" ? "secondary" : "ghost"}
              aria-label={key.aria}
              className={cn(
                "w-full px-2 text-xs sm:text-sm",
                key.tone !== "equals" &&
                  "border !border-cyan-500/35 !bg-midnight !text-ink !shadow-none hover:!border-violet/80 hover:!bg-[#111C2D]",
                key.span === 2 && "col-span-2",
              )}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => press(key)}
            >
              {key.label}
            </Button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {examples.map((example) => (
            <Button
              key={example}
              variant="ghost"
              className="px-3"
              onClick={() => replaceExpression(example, example.length)}
            >
              {example}
            </Button>
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Button className="w-full sm:w-auto" onClick={copyResult} disabled={evaluation.status !== "ok"}>
            Copy result
          </Button>
          <Button
            variant="ghost"
            className="w-full sm:w-auto"
            onClick={() => replaceExpression("", 0)}
            disabled={!expression}
          >
            Reset
          </Button>
        </div>
        <p aria-live="polite" className="mt-3 min-h-5 text-sm text-cyan">
          {notice}
        </p>
      </Card>

      <div aria-live="polite" className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-ink">Result</h2>
          <p className="mt-3 break-words text-4xl font-semibold tracking-tight text-cyan">
            {evaluation.status === "ok" ? evaluation.result : "—"}
          </p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-ink">Scientific notation</h2>
          <p className="mt-3 break-words text-4xl font-semibold tracking-tight text-violet">
            {evaluation.status === "ok" ? evaluation.scientific : "—"}
          </p>
        </Card>
        <Card className="md:col-span-2">
          <h2 className="text-lg font-semibold text-ink">Step-by-step</h2>
          {evaluation.status === "ok" ? (
            <StepList steps={evaluation.steps} />
          ) : (
            <p className="mt-2 text-sm text-muted">
              {evaluation.status === "incomplete"
                ? "Finish the expression to see the steps."
                : "The evaluation steps appear here."}
            </p>
          )}
        </Card>
        <Card className="md:col-span-2">
          <h2 className="text-lg font-semibold text-ink">History</h2>
          {history.length > 0 ? (
            <ul className="mt-4 flex flex-col gap-2">
              {history.map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    className="flex w-full flex-col gap-1 rounded-xl border border-white/10 bg-midnight px-3 py-2 text-left hover:border-cyan-400/50 sm:flex-row sm:items-center sm:justify-between"
                    onClick={() => {
                      replaceExpression(entry.expression, entry.expression.length);
                      setMode(entry.mode);
                    }}
                  >
                    <span className="break-all text-sm text-ink">
                      {entry.expression} = {entry.result}
                    </span>
                    <span className="text-xs text-muted">
                      {entry.scientific} · {entry.mode === "deg" ? "degrees" : "radians"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted">
              Press equals to keep a result here. Select a saved line to load it again.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

function StepList({ steps }: { steps: { title: string; body: string }[] }) {
  return (
    <ol className="mt-4 space-y-4">
      {steps.map((step, index) => (
        <li key={step.title} className="flex gap-3">
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-violet/20 text-sm font-semibold text-ink">
            {index + 1}
          </span>
          <div>
            <p className="font-medium text-ink">{step.title}</p>
            <p className="mt-1 text-sm text-muted">{step.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
