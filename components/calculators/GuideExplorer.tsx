"use client";

import { Card } from "@/components/ui/Card";
import { CopyResultBlock } from "@/components/ui/CopyResultButton";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { evaluateFraction, type FractionResult } from "@/lib/math";
import { explainPowerOfTen, formatNotationReport, toScientificNotation } from "@/lib/notation";
import {
  decimalApproximationNote,
  formatFractionGuideReport,
  percentApproximationNote,
} from "@/lib/rounding";
import { useMemo, useState } from "react";

type Topic = "notation" | "fraction" | "powers";

export function GuideExplorer() {
  const [topic, setTopic] = useState<Topic>("notation");
  const [value, setValue] = useState("6.022e23");

  function changeTopic(next: Topic) {
    setTopic(next);
    setValue(next === "fraction" ? "3/4" : next === "powers" ? "2" : "6.022e23");
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Guide"
            value={topic}
            onChange={(event) => changeTopic(event.target.value as Topic)}
          >
            <option value="notation">Scientific notation</option>
            <option value="fraction">Fraction to percent</option>
            <option value="powers">Powers of ten</option>
          </Select>
          <Input
            label={topic === "fraction" ? "Fraction" : topic === "powers" ? "Exponent" : "Number"}
            name="example"
            autoComplete="off"
            spellCheck={false}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            hint="The explanation updates as you type."
          />
        </div>
      </Card>
      {topic === "fraction" ? (
        <FractionGuide value={value} />
      ) : topic === "powers" ? (
        <PowerGuide value={value} />
      ) : (
        <NotationGuide value={value} />
      )}
    </div>
  );
}

function NotationGuide({ value }: { value: string }) {
  const amount = value.trim() === "" ? null : Number(value);
  const invalid = value.trim() !== "" && (amount === null || Number.isNaN(amount));
  const notation = amount !== null && !Number.isNaN(amount) ? toScientificNotation(amount) : null;

  return (
    <ResultCard
      result={notation?.notation}
      steps={notation?.steps}
      report={notation ? formatNotationReport(value, notation) : null}
      empty={invalid ? "Enter a finite number." : "Enter a number to see the explanation."}
      resetKey={value}
    />
  );
}

function PowerGuide({ value }: { value: string }) {
  const explanation = explainPowerOfTen(value);

  return (
    <ResultCard
      result={explanation?.result}
      steps={explanation?.steps}
      report={explanation?.report ?? null}
      empty={value.trim() && !explanation ? "Enter a finite exponent." : "Enter an exponent such as 2 or 3."}
      resetKey={value}
    />
  );
}

function ResultCard({
  result,
  steps,
  report,
  empty,
  resetKey,
}: {
  result?: string;
  steps?: { title: string; body: string }[];
  report?: string | null;
  empty: string;
  resetKey: string;
}) {
  return (
    <>
      <Card>
        <h2 className="text-lg font-semibold text-ink">Result</h2>
        <p className="mt-3 break-words text-3xl font-semibold tracking-tight text-cyan sm:text-4xl">
          {result ?? "—"}
        </p>
        <CopyResultBlock text={report ?? null} resetKey={resetKey} />
      </Card>
      <Card>
        <h2 className="text-lg font-semibold text-ink">Steps</h2>
        {steps ? (
          <ol className="mt-4 space-y-4">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-3">
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
          <p className="mt-2 text-base text-slate-200">{empty}</p>
        )}
      </Card>
    </>
  );
}

function FractionGuide({ value }: { value: string }) {
  const evaluation = useMemo(() => evaluateFraction(value), [value]);
  const result = evaluation.status === "ok" ? evaluation.result : null;

  return (
    <>
      <Card>
        <h2 className="text-lg font-semibold text-ink">Result</h2>
        <p className="mt-3 break-words text-3xl font-semibold tracking-tight text-cyan sm:text-4xl">
          {result ? `${result.decimal} = ${result.percent}` : "—"}
        </p>
        {result ? <ApproximationNotes result={result} /> : null}
        <CopyResultBlock
          text={result ? formatFractionGuideReport(result) : null}
          resetKey={value}
        />
      </Card>
      <Card>
        <h2 className="text-lg font-semibold text-ink">Steps</h2>
        {result ? (
          <ol className="mt-4 space-y-4">
            {result.steps.map((step, index) => (
              <li key={step.title} className="flex gap-3">
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
            {evaluation.status === "invalid"
              ? evaluation.message
              : "Enter a fraction such as 3/4."}
          </p>
        )}
      </Card>
    </>
  );
}

function ApproximationNotes({ result }: { result: FractionResult }) {
  const notes = [decimalApproximationNote(result), percentApproximationNote(result)].filter(
    (note): note is string => note !== null,
  );

  if (notes.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 space-y-1">
      {notes.map((note) => (
        <p key={note} className="text-base text-slate-200">
          {note}
        </p>
      ))}
    </div>
  );
}
