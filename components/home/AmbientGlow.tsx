import { cn } from "@/lib/cn";

export function AmbientGlow({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute", className)}
    >
      <div className="absolute -left-8 -top-8 h-56 w-56 rounded-full bg-[#00D1F7]/25 blur-3xl" />
      <div className="absolute top-4 right-0 h-52 w-52 rounded-full bg-[#8B5CF6]/30 blur-3xl" />
    </div>
  );
}
