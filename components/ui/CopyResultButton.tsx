"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { copyDetailedResultLabel, isCurrentCopyPayload } from "@/lib/report";
import { useEffect, useRef, useState } from "react";

const copiedLabel = "Copied!";
const defaultIdleLabel = copyDetailedResultLabel;

export function useCopyResult(text: string | null, resetKey = "", idleLabel = defaultIdleLabel) {
  const [label, setLabel] = useState(idleLabel);
  const [notice, setNotice] = useState("");
  const [snapshot, setSnapshot] = useState({ text, resetKey, idleLabel });
  const [confirmed, setConfirmed] = useState<{ text: string; resetKey: string } | null>(null);
  const timer = useRef<number | undefined>(undefined);

  if (snapshot.text !== text || snapshot.resetKey !== resetKey || snapshot.idleLabel !== idleLabel) {
    setSnapshot({ text, resetKey, idleLabel });
    setLabel(idleLabel);
    setNotice("");
    if (confirmed) {
      setConfirmed(null);
    }
  } else if (confirmed && !isCurrentCopyPayload(confirmed.text, confirmed.resetKey, text, resetKey)) {
    setConfirmed(null);
    setLabel(idleLabel);
    setNotice("");
  }

  useEffect(() => {
    window.clearTimeout(timer.current);
  }, [text, resetKey, idleLabel]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    const payload = text;
    const key = resetKey;

    if (!payload) {
      return;
    }

    try {
      await navigator.clipboard.writeText(payload);
      setConfirmed({ text: payload, resetKey: key });
      setLabel(copiedLabel);
      setNotice(copiedLabel);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        setConfirmed((current) =>
          current && isCurrentCopyPayload(payload, key, current.text, current.resetKey) ? null : current,
        );
        setLabel(idleLabel);
        setNotice("");
      }, 2000);
    } catch {
      window.clearTimeout(timer.current);
      setConfirmed({ text: payload, resetKey: key });
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
    <Button
      className={cn(
        "w-full min-w-0 max-w-full whitespace-normal text-balance text-center !leading-snug !tracking-normal sm:w-auto",
        className,
      )}
      onClick={copy.copy}
      disabled={copy.disabled}
    >
      {copy.label}
    </Button>
  );
}

export function CopyResultNotice({ notice }: { notice: string }) {
  return (
    <p aria-live="polite" className="mt-3 min-h-6 text-base text-cyan">
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
