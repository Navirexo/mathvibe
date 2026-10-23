import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { ScientificCalculator } from "@/components/calculators/ScientificCalculator";
import { FaqAccordion } from "@/components/content/FaqAccordion";
import { pageMetadata } from "@/lib/seo";

const description =
  "Evaluate scientific expressions with trig, powers, roots, and scientific notation, and see each step.";

const faqs = [
  {
    question: "Does the scientific calculator use degrees or radians?",
    answer:
      "Degrees are selected when the page opens. sin(30) is 0.5 in degrees. Switch to radians when the angle is already in radians.",
  },
  {
    question: "Which functions can I type?",
    answer:
      "Use sin, cos, tan, asin, acos, atan, sqrt, cbrt, log, ln, abs, and exp. x², x!, ±, %, 1/x, eˣ, 10ˣ, and Ans are on the keypad. pi and e are constants. ^ raises a number to a power, % divides by 100, and 6.02e23 is scientific notation.",
  },
  {
    question: "How is the result checked?",
    answer:
      "The page shows the standard result, the scientific-notation form, and the steps used to read the expression.",
  },
];

export const metadata = pageMetadata({
  title: "Scientific Calculator — MathVibe",
  description,
  path: "/scientific-calculator",
});

export default function ScientificCalculatorPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 py-12 sm:gap-16 sm:px-6 sm:py-16">
      <section>
        <p className="text-sm font-medium tracking-[0.18em] text-cyan uppercase">Calculators</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
          Scientific Calculator
        </h1>
        <p className="mt-4 max-w-2xl text-base text-slate-200 sm:text-lg">{description}</p>
        <p className="mt-4 text-base text-slate-200">
          Need a measurement instead?{" "}
          <Link href="/unit-converter" className="text-[#00D1F7] underline-offset-4 hover:underline">
            Open the unit converter
          </Link>
          .
        </p>
      </section>
      <ScientificCalculator />
      <AdSlot placement="rectangle" />
      <article className="flex max-w-3xl flex-col gap-10">
        <section>
          <h2 className="text-xl font-semibold text-ink">How It Works</h2>
          <p className="mt-3 text-base text-slate-200">
            Type an expression. MathVibe reads numbers, operators, parentheses, and named functions, then evaluates them with ordinary precedence: parentheses first, then powers, then multiplication and division, then addition and subtraction.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-ink">Formula & Logic Explanation</h2>
          <div className="mt-3 space-y-3 text-base text-slate-200">
            <p>Powers use a^b. For example, 2^3 = 8.</p>
            <p>In degrees, sin(θ) = sin(θ × π ÷ 180). In radians, the angle is used directly.</p>
            <p>Scientific notation splits a value into a coefficient from 1 up to, but not including, 10, multiplied by a power of ten. 6.02e23 is already in that form.</p>
          </div>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-ink">Step-by-Step Examples</h2>
          <div className="mt-3 space-y-3 text-base text-slate-200">
            <p>2 + 3 × 4 = 2 + 12 = 14. Multiplication happens before addition.</p>
            <p>sin(30) in degrees = 0.5. The calculator converts 30° to π/6 radians, then takes the sine.</p>
            <p>sqrt(9) = 3, and 2^10 = 1024.</p>
          </div>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-ink">Frequently Asked Questions</h2>
          <div className="mt-6">
            <FaqAccordion items={faqs} idPrefix="scientific-faq" />
          </div>
        </section>
      </article>
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
    </div>
  );
}
