import { cn } from "@/lib/cn";

type AdPlacement = "leaderboard" | "rectangle";

const frames: Record<AdPlacement, string> = {
  leaderboard: "min-h-[90px] w-full max-w-[728px]",
  rectangle: "min-h-[250px] w-full max-w-[336px]",
};

export function AdSlot({ placement }: { placement: AdPlacement }) {
  return (
    <aside aria-label="Advertisement" className="flex justify-center">
      <div
        data-ad-placement={placement}
        className={cn(
          "flex items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-3 text-center",
          frames[placement],
        )}
      >
        <p className="text-[11px] font-medium tracking-[0.16em] text-muted uppercase">
          Advertisement
        </p>
      </div>
    </aside>
  );
}
