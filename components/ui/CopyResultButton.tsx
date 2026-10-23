"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useEffect, useRef, useState } from "react";

const copiedLabel = "Copied!";
const idleLabel = "Copy result";

export function useCopyResult(text: string | null, resetKey = "") {
  const [label, setLabel] = useState(idleLabel);
  const [notice, setNotice] = useState("");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    window.clearTimeout(timer.current);
    setLabel(idleLabel);
    setNotice("");
  }, [text, resetKey]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    if (!text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setLabel(copiedLabel);
      setNotice(copiedLabel);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        setLabel(idleLabel);
        setNotice("");
      }, 2000);
    } catch {
      window.clearTimeout(timer.current);
      setLabel(idleLabel);
      setNotice("Clipboard permission was blocked.");
    }
  }

  return {
    copy,
    disabled: text === null,
    label,
    notice,
  };
}

export function CopyResultButton({
  copy,
  className,
}: {
  copy: ReturnType<typeof useCopyResult>;
  className?: string;
}) {
  return (
    <Button className={cn("w-full sm:w-auto", className)} onClick={copy.copy} disabled={copy.disabled}>
      {copy.label}
    </Button>
  );
}

export function CopyResultNotice({ notice }: { notice: string }) {
  return (
    <p aria-live="polite" className="mt-3 min-h-5 text-sm text-cyan">
      {notice}
    </p>
  );
}

export function CopyResultBlock({ text, resetKey }: { text: string | null; resetKey?: string }) {
  const copy = useCopyResult(text, resetKey);

  return (
    <div className="mt-5">
      <CopyResultButton copy={copy} />
      <CopyResultNotice notice={copy.notice} />
    </div>
  );
}
