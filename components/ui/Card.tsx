import { cn } from "@/lib/cn";
import type { ComponentProps } from "react";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-cyan-500/20 bg-[#111C2D]/80 p-5 shadow-[0_0_20px_rgba(0,209,247,0.05)] backdrop-blur-xl transition-[border-color,box-shadow] duration-300 hover:border-cyan-400/50 hover:shadow-[0_0_25px_rgba(0,209,247,0.2)] motion-reduce:transition-none sm:p-6",
        className,
      )}
      {...props}
    />
  );
}
