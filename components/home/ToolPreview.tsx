import type { ReactNode } from "react";

export function ToolPreview({ id }: { id: string }) {
  if (id === "scientific-calculator") {
    return <FormulaPreview />;
  }

  if (id === "fraction-to-percent") {
    return <FractionPreview />;
  }

  if (id === "unit-converter") {
    return <UnitScalePreview />;
  }

  return null;
}

function PreviewFrame({ children }: { children: ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className="relative -mx-5 -mt-5 mb-5 h-28 overflow-hidden border-b border-cyan-500/20 bg-midnight/70 sm:-mx-6 sm:-mt-6"
    >
      {children}
    </div>
  );
}

function FormulaPreview() {
  return (
    <PreviewFrame>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,209,247,0.35),transparent_62%)]" />
      <svg viewBox="0 0 240 80" className="absolute inset-x-0 bottom-2 h-16 w-full">
        <path
          d="M8 50 C 36 50, 40 18, 64 18 S 92 62, 116 62 S 148 22, 176 22 S 208 54, 232 46"
          fill="none"
          stroke="#00D1F7"
          strokeWidth="2"
          className="drop-shadow-[0_0_8px_rgba(0,209,247,0.9)]"
        />
      </svg>
      <p className="absolute left-4 top-4 text-lg font-semibold tracking-wide text-[#00D1F7] drop-shadow-[0_0_12px_rgba(0,209,247,0.85)]">
        sin θ + eⁱˣ
      </p>
    </PreviewFrame>
  );
}

function FractionPreview() {
  return (
    <PreviewFrame>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.35),transparent_55%)]" />
      <div className="relative flex h-full flex-col justify-center px-5">
        <div className="mb-3 flex items-end justify-between text-sm">
          <span className="text-2xl font-semibold text-ink">3/4</span>
          <span className="text-[#8B5CF6]">75%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-[#00D1F7] to-[#8B5CF6] shadow-[0_0_14px_rgba(0,209,247,0.85)]" />
        </div>
      </div>
    </PreviewFrame>
  );
}

function UnitScalePreview() {
  const ticks = [18, 32, 46, 60, 74, 88];

  return (
    <PreviewFrame>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,rgba(0,209,247,0.22),transparent_60%)]" />
      <div className="relative mx-5 mt-10">
        <div className="h-px bg-[#00D1F7] shadow-[0_0_12px_rgba(0,209,247,0.9)]" />
        <div className="relative h-8">
          {ticks.map((left) => (
            <span
              key={left}
              className="absolute top-0 h-3 w-px bg-[#00D1F7]/80"
              style={{ left: `${left}%` }}
            />
          ))}
          <span className="absolute top-0 left-[46%] h-5 w-0.5 -translate-x-1/2 rounded-full bg-[#8B5CF6] shadow-[0_0_12px_rgba(139,92,246,0.95)]" />
        </div>
        <div className="flex justify-between text-[11px] tracking-wide text-muted uppercase">
          <span>km</span>
          <span>mi</span>
        </div>
      </div>
    </PreviewFrame>
  );
}
