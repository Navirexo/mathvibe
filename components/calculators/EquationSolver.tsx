"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CopyResultBlock } from "@/components/ui/CopyResultButton";
import { Input } from "@/components/ui/Input";
import { analyzeAlgebra, formatAlgebraReport, type AlgebraMode } from "@/lib/algebra";
import { useMemo, useState } from "react";

const examples: Record<AlgebraMode, string[]> = {
  solve: ["2x + 3 = 11", "x^2 - 5x + 6 = 0", "x^2 = 4", "2(x + 3) = 10"],
  simplify: ["2x + 3x - x", "3(x + 2) + 4(x - 1)", "x^2 + 2x^2 - x"],
};

export function EquationSolver() {
  const [mode, setMode] = useState<AlgebraMode>("solve");
  const [value, setValue] = useState("2x + 3 = 11");
  const evaluation = useMemo(() => analyzeAlgebra(value, mode), [value, mode]);

  function switchMode(next: AlgebraMode) {
    setMode(next);
    setValue(next === "solve" ? "2x + 3 = 11" : "2x + 3x - x");
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Solver mode">
          <Button variant={mode === "solve" ? "primary" : "secondary"} onClick={() => switchMode("solve")}>
            Solve
          </Button>
          <Button variant={mode === "simplify" ? "primary" : "secondary"} onClick={() => switchMode("simplify")}>
            Simplify
          </Button>
        </div>
        <Input
          label={mode === "solve" ? "Equation" : "Expression"}
          name="equation"
          autoComplete="off"
          spellCheck={false}
          value={value}
          placeholder={mode === "solve" ? "2x + 3 = 11" : "2x + 3x - x"}
          error={evaluation.status === "invalid" ? evaluation.message : undefined}
          hint={
            evaluation.status === "invalid"
              ? undefined
              : mode === "solve"
                ? "Try 2x + 3 = 11 or x^2 - 5x + 6 = 0. The solution updates as you type."
                : "Try 2x + 3x - x or 3(x + 2). Like terms combine as you type."
          }
          onChange={(event) => setValue(event.target.value)}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {examples[mode].map((example) => (
            <Button key={example} variant="ghost" className="px-3" onClick={() => setValue(example)}>
              {example}
            </Button>
          ))}
        </div>
      </Card>
      <div aria-live="polite" className="flex flex-col gap-4">
        <Card>
          <h2 className="text-lg font-semibold text-ink">Result</h2>
          <p className="mt-3 break-words text-3xl font-semibold tracking-tight text-cyan sm:text-4xl">
            {evaluation.status === "ok" ? evaluation.summary : "—"}
          </p>
          <CopyResultBlock
            text={evaluation.status === "ok" ? formatAlgebraReport(value, mode, evaluation) : null}
            resetKey={`${mode}:${value}`}
          />
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-ink">Step-by-step</h2>
          {evaluation.status === "ok" ? (
            <ol className="mt-4 space-y-4">
              {evaluation.steps.map((step, index) => (
                <li key={`${step.title}-${index}`} className="flex gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-violet/20 text-sm font-semibold text-ink">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-ink">{step.title}</p>
                    <p className="mt-1 break-words text-base text-slate-200">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-2 text-base text-slate-200">
              {evaluation.status === "incomplete"
                ? "Finish the expression to see the steps."
                : "The worked solution appears here."}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
