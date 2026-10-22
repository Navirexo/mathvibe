import { GuideSection } from "@/components/content/GuideSection";
import { AmbientGlow } from "@/components/home/AmbientGlow";
import { HomeExplorer } from "@/components/home/HomeExplorer";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 py-12 sm:gap-16 sm:px-6 sm:py-16">
      <section className="relative">
        <AmbientGlow className="-inset-x-6 -top-10 h-72" />
        <div className="relative">
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-[#111C2D]/70 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-[#00D1F7] uppercase shadow-[0_0_18px_rgba(0,209,247,0.35)]">
            <span aria-hidden="true">⚡</span>
            Next-gen math engine
          </p>
          <h1 className="mt-4 max-w-4xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
            Less Friction. More Done. Smart Math Tools & Calculators.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted sm:text-lg">
            Fast, accessible, and step-by-step mathematical solutions.
          </p>
        </div>
      </section>
      <HomeExplorer />
      <GuideSection includeSchema />
    </div>
  );
}
