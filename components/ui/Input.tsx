import { cn } from "@/lib/cn";
import { useId, type ComponentProps } from "react";

type InputProps = ComponentProps<"input"> & {
  label: string;
  hint?: string;
  error?: string;
  glow?: boolean;
};

export function Input({
  id,
  label,
  hint,
  error,
  glow = false,
  className,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex w-full flex-col gap-2">
      <label htmlFor={inputId} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "min-h-11 w-full rounded-xl border border-white/10 bg-midnight px-3.5 text-base text-ink placeholder:text-muted",
          "transition-[border-color,box-shadow] hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none",
          glow
            ? "focus-visible:border-[#00D1F7] focus-visible:shadow-[0_0_0_1px_rgba(0,209,247,0.9),0_0_24px_rgba(0,209,247,0.45)]"
            : "focus-visible:border-cyan",
          error && "border-violet",
          className,
        )}
        {...props}
      />
      {hint ? (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-sm font-medium text-violet">
          {error}
        </p>
      ) : null}
    </div>
  );
}
