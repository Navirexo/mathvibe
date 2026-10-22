"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Ref } from "react";

type ToolSearchProps = {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
  inputRef?: Ref<HTMLInputElement>;
};

export function ToolSearch({
  value,
  onChange,
  resultCount,
  inputRef,
}: ToolSearchProps) {
  const query = value.trim();
  const status = query
    ? resultCount === 0
      ? `No tools match “${query}”.`
      : `${resultCount} ${resultCount === 1 ? "match" : "matches"} found.`
    : "Results update as you type.";

  return (
    <form
      role="search"
      className="flex flex-col gap-3"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <Input
            ref={inputRef}
            label="Search tools"
            type="search"
            name="q"
            placeholder="Try fraction, calculator, or unit"
            value={value}
            autoComplete="off"
            enterKeyHint="search"
            glow
            onChange={(event) => onChange(event.target.value)}
          />
        </div>
        {query ? (
          <Button variant="ghost" className="w-full sm:w-auto" onClick={() => onChange("")}>
            Clear
          </Button>
        ) : null}
      </div>
      <p aria-live="polite" className="text-sm text-muted">
        {status}
      </p>
    </form>
  );
}
