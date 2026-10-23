"use client";

import { Card } from "@/components/ui/Card";
import { CopyResultBlock } from "@/components/ui/CopyResultButton";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { evaluateFraction } from "@/lib/math";
import { toScientificNotation } from "@/lib/notation";
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
      empty={invalid ? "Enter a finite number." : "Enter a number to see the explanation."}
      resetKey={value}
    />
  );
}

function PowerGuide({ value }: { value: string }) {
  const exponent = value.trim() === "" ? null : Number(value);
  const ready = exponent !== null && Number.isFinite(exponent);
  const steps = ready
    ? [
        {
          title: "Read the exponent",
          body: `The exponent is ${trimExponent(exponent)}.`,
        },
        {
          title: "Expand the power",
          body: `10^${trimExponent(exponent)} = ${formatPower(exponent)}.`,
        },
      ]
    : undefined;

  return (
    <ResultCard
      result={ready ? `10^${trimExponent(exponent)} = ${formatPower(exponent)}` : undefined}
      steps={steps}
      empty={value.trim() && !ready ? "Enter a finite exponent." : "Enter an exponent such as 2 or 3."}
      resetKey={value}
    />
  );
}

function ResultCard({
  result,
  steps,
  empty,
  resetKey,
}: {
  result?: string;
  steps?: { title: string; body: string }[];
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
        <CopyResultBlock text={result ?? null} resetKey={resetKey} />
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
                  <p className="mt-1 text-base text-slate-200">{step.body}</p>
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
        <p className="mt-3 text-3xl font-semibold tracking-tight text-cyan sm:text-4xl">
          {result ? `${result.decimal} = ${result.percent}` : "—"}
        </p>
        <CopyResultBlock
          text={result ? `${result.decimal} = ${result.percent}` : null}
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
                  <p className="mt-1 text-base text-slate-200">{step.body}</p>
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
