import { cn } from "@/lib/cn";
import { useId, type ComponentProps } from "react";

type SelectProps = ComponentProps<"select"> & {
  label: string;
};

export function Select({ id, label, className, children, ...props }: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className="flex w-full flex-col gap-2">
      <label htmlFor={selectId} className="text-sm font-medium text-ink">
        {label}
      </label>
      <select
        id={selectId}
        className={cn(
          "min-h-11 w-full rounded-xl border border-white/10 bg-midnight px-3 text-base text-ink",
          "hover:border-white/20 focus-visible:border-cyan",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
