import { cn } from "@/lib/cn";
import type { ComponentProps } from "react";

export const gradientActionClass =
  "inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#00D1F7] to-[#8B5CF6] px-4 text-sm font-semibold tracking-wide text-midnight shadow-[0_0_20px_rgba(0,209,247,0.28)] transition-[box-shadow,filter] hover:shadow-[0_0_28px_rgba(139,92,246,0.55)] motion-reduce:transition-none";

export const secondaryActionClass =
  "inline-flex min-h-11 items-center justify-center rounded-xl border border-violet/80 bg-violet/10 px-4 text-sm font-semibold tracking-wide text-ink shadow-[0_0_24px_rgba(139,92,246,0.22)] transition-[color,background-color,border-color,box-shadow] hover:bg-violet/20 motion-reduce:transition-none";

const variants = {
  primary:
    "bg-cyan text-midnight shadow-[0_0_24px_rgba(45,212,191,0.28)] hover:bg-cyan-bright",
  secondary: secondaryActionClass,
  ghost: "bg-transparent text-ink hover:bg-white/10",
  gradient: gradientActionClass,
} as const;

type ButtonProps = ComponentProps<"button"> & {
  variant?: keyof typeof variants;
};

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold tracking-wide transition-[color,background-color,border-color,box-shadow,opacity] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
