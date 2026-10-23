import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { UnitConverterTool } from "@/components/calculators/UnitConverterTool";
import { FaqAccordion } from "@/components/content/FaqAccordion";
import { pageMetadata } from "@/lib/seo";

const description =
  "Convert length, mass, and volume instantly, with the factor and each conversion step shown.";

const faqs = [
  {
    question: "Which units can I convert?",
    answer:
      "Length includes millimeters through miles. Mass includes milligrams through pounds. Volume includes milliliters, liters, cubic meters, fluid ounces, cups, and gallons.",
  },
  {
    question: "What formula does the converter use?",
    answer:
      "Each unit has a factor in a base unit: meters, grams, or liters. The result is value × from-factor ÷ to-factor.",
  },
  {
    question: "Does 1 kilometer equal 1000 meters?",
    answer: "Yes. The length converter uses 1 km = 1000 m, 1 inch = 0.0254 m, and 1 mile = 1609.344 m.",
  },
];

export const metadata = pageMetadata({
  title: "Unit Converter — MathVibe",
  description,
  path: "/unit-converter",
});

export default function UnitConverterPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 py-12 sm:gap-16 sm:px-6 sm:py-16">
      <section>
        <p className="text-sm font-medium tracking-[0.18em] text-cyan uppercase">Calculators</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
          Unit Converter
        </h1>
        <p className="mt-4 max-w-2xl text-base text-slate-200 sm:text-lg">{description}</p>
        <p className="mt-4 text-base text-slate-200">
          Need powers or trigonometry?{" "}
          <Link href="/scientific-calculator" className="text-[#00D1F7] underline-offset-4 hover:underline">
            Open the scientific calculator
          </Link>
          .
        </p>
      </section>
      <UnitConverterTool />
      <AdSlot placement="rectangle" />
      <article className="flex max-w-3xl flex-col gap-10">
        <section>
          <h2 className="text-xl font-semibold text-ink">How It Works</h2>
          <p className="mt-3 text-base text-slate-200">
            Choose length, mass, or volume, enter a value, and pick the starting and target units. Swap exchanges the two units. The result updates immediately, and the steps show the conversion through the base unit.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-ink">Formula & Logic Explanation</h2>
          <p className="mt-3 text-base text-slate-200">
            result = value × (factor of the source unit) ÷ (factor of the target unit). For length, the factors are in meters, so 1 km × 1000 ÷ 1 = 1000 m.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-ink">Step-by-Step Examples</h2>
          <div className="mt-3 space-y-3 text-base text-slate-200">
            <p>1 km = 1000 m.</p>
            <p>1 kg = 1000 g = 2.20462 lb.</p>
            <p>1 L = 1000 mL.</p>
          </div>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-ink">Frequently Asked Questions</h2>
          <div className="mt-6">
            <FaqAccordion items={faqs} idPrefix="unit-faq" />
          </div>
        </section>
      </article>
      <FaqSchema faqs={faqs} />
    </div>
  );
}

function FaqSchema({ faqs }: { faqs: { question: string; answer: string }[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }).replace(/</g, "\\u003c"),
      }}
    />
  );
}
