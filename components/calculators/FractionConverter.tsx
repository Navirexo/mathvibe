"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CopyResultButton, CopyResultNotice, useCopyResult } from "@/components/ui/CopyResultButton";
import { Input } from "@/components/ui/Input";
import {
  evaluateFraction,
  formatFractionResult,
  type FractionResult,
} from "@/lib/math";
import { roundDisplayedFraction } from "@/lib/rounding";
import { useMemo, useState } from "react";

export function FractionConverter() {
  const [value, setValue] = useState("");
  const evaluation = useMemo(() => evaluateFraction(value), [value]);
  const result = evaluation.status === "ok" ? roundDisplayedFraction(evaluation.result, 6, 2) : null;
  const copy = useCopyResult(result ? formatFractionResult(result) : null, value);

  function reset() {
    setValue("");
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <Input
          label="Fraction"
          name="fraction"
          type="text"
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          placeholder="5/6"
          value={value}
          error={evaluation.status === "invalid" ? evaluation.message : undefined}
          hint={
            evaluation.status === "invalid"
              ? undefined
              : "Try 5/6, 3/4, or 7/8. Results update as you type."
          }
          onChange={(event) => {
            setValue(event.target.value);
          }}
        />
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <CopyResultButton copy={copy} />
          <Button
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={reset}
            disabled={!value}
          >
            Reset
          </Button>
        </div>
        <CopyResultNotice notice={copy.notice} />
      </Card>

      <div aria-live="polite" className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <OutputCard title="Decimal" value={result?.decimal} />
        <OutputCard title="Percent" value={result?.percent} accent="violet" />
        <Card className="md:col-span-2">
          <h2 className="text-lg font-semibold text-ink">Equivalent fractions</h2>
          {result ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {result.equivalents.map((fraction) => (
                <li
                  key={fraction}
                  className="rounded-lg border border-violet/40 bg-midnight px-3 py-2 text-ink"
                >
                  {fraction}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted">
              Equivalent fractions appear here after you enter a fraction.
            </p>
          )}
        </Card>
        <Card className="md:col-span-2">
          <h2 className="text-lg font-semibold text-ink">Step-by-step</h2>
          {result ? (
            <StepList steps={result.steps} />
          ) : (
            <p className="mt-2 text-sm text-muted">
              The division, percent, and simplification steps appear here.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

function OutputCard({
  title,
  value,
  accent = "cyan",
}: {
  title: string;
  value?: string;
  accent?: "cyan" | "violet";
}) {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p
        className={
          accent === "violet"
            ? "mt-3 text-4xl font-semibold tracking-tight text-violet"
            : "mt-3 text-4xl font-semibold tracking-tight text-cyan"
        }
      >
        {value ?? "—"}
      </p>
    </Card>
  );
}

function StepList({ steps }: { steps: FractionResult["steps"] }) {
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
