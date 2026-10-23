"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CopyResultBlock } from "@/components/ui/CopyResultButton";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { convertUnits, unitGroups, type UnitDimension } from "@/lib/units";
import { useMemo, useState } from "react";

const preferredUnits: Record<UnitDimension, [string, string]> = {
  length: ["km", "m"],
  mass: ["kg", "lb"],
  volume: ["l", "gal"],
};

const numericText = /^[+-]?(?:\d[\d,]*\.?\d*|\.\d*)$/;

function extractNumericText(input: string) {
  const match = input.match(/[+-]?(?:\d[\d,]*\.?\d*|\.\d+)/);

  if (!match || !/\d/.test(match[0])) {
    return null;
  }

  return match[0].replace(/,/g, "").replace(/\.$/, "");
}

function readAmount(input: string) {
  const trimmed = input.trim().replace(/,/g, "");

  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(trimmed)) {
    return null;
  }

  const amount = Number(trimmed);
  return Number.isFinite(amount) ? amount : null;
}

export function UnitConverterTool() {
  const [dimension, setDimension] = useState<UnitDimension>("length");
  const [fromId, setFromId] = useState(preferredUnits.length[0]);
  const [toId, setToId] = useState(preferredUnits.length[1]);
  const [value, setValue] = useState("1");
  const group = unitGroups[dimension];
  const amount = readAmount(value);
  const conversion = useMemo(() => {
    if (amount === null) {
      return null;
    }

    return convertUnits(amount, dimension, fromId, toId);
  }, [amount, dimension, fromId, toId]);
  const invalid = value.trim() !== "" && amount === null && !/^[+-]?\.?$/.test(value.trim());

  function updateValue(raw: string) {
    const trimmed = raw.trim();

    if (trimmed === "" || numericText.test(trimmed)) {
      setValue(raw);
      return;
    }

    setValue(extractNumericText(raw) ?? raw);
  }

  const fromUnit = group.units.find((unit) => unit.id === fromId);
  const toUnit = group.units.find((unit) => unit.id === toId);

  function changeDimension(next: UnitDimension) {
    setDimension(next);
    setFromId(preferredUnits[next][0]);
    setToId(preferredUnits[next][1]);
  }

  function swapUnits() {
    setFromId(toId);
    setToId(fromId);
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Measurement"
            value={dimension}
            onChange={(event) => changeDimension(event.target.value as UnitDimension)}
          >
            {Object.entries(unitGroups).map(([id, item]) => (
              <option key={id} value={id}>
                {item.label}
              </option>
            ))}
          </Select>
          <Input
            label="Value"
            name="value"
            inputMode="decimal"
            autoComplete="off"
            value={value}
            error={invalid ? "Enter a number such as 1, 2.5, or 100." : undefined}
            hint={invalid ? undefined : "The conversion updates as you type."}
            onChange={(event) => updateValue(event.target.value)}
          />
        </div>
        <div className="mt-4 grid grid-cols-1 items-end gap-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <Select label="From" value={fromId} onChange={(event) => setFromId(event.target.value)}>
            {group.units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.label} ({unit.id})
              </option>
            ))}
          </Select>
          <Button variant="secondary" className="w-full sm:w-auto" onClick={swapUnits}>
            Swap units
          </Button>
          <Select label="To" value={toId} onChange={(event) => setToId(event.target.value)}>
            {group.units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.label} ({unit.id})
              </option>
            ))}
          </Select>
        </div>
      </Card>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-ink">Result</h2>
          <p className="mt-3 break-words text-4xl font-semibold tracking-tight text-cyan">
            {conversion ? conversion.result : "—"}
          </p>
          <p className="mt-2 text-base text-slate-200">
            {conversion && toUnit ? toUnit.label : "Choose units to convert."}
          </p>
          <CopyResultBlock
            text={conversion && toUnit ? `${conversion.result} ${toUnit.label}` : null}
            resetKey={`${dimension}:${fromId}:${toId}:${value}`}
          />
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-ink">Factor</h2>
          <p className="mt-3 break-words text-4xl font-semibold tracking-tight text-violet">
            {conversion ? conversion.factor : "—"}
          </p>
          <p className="mt-2 text-base text-slate-200">
            {conversion && fromUnit && toUnit
              ? `1 ${fromUnit.label.toLowerCase().replace(/s$/, "")} = ${conversion.factor} ${toUnit.label.toLowerCase()}`
              : "The direct factor appears here."}
          </p>
        </Card>
      </div>
      <Card>
        <h2 className="text-lg font-semibold text-ink">Steps</h2>
        {conversion ? (
          <ol className="mt-4 space-y-4">
            {conversion.steps.map((step, index) => (
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
          <p className="mt-2 text-base text-slate-200">Enter a value to see the conversion steps.</p>
        )}
      </Card>
    </div>
  );
}
