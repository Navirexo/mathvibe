import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { GuideExplorer } from "@/components/calculators/GuideExplorer";
import { FaqAccordion } from "@/components/content/FaqAccordion";
import { pageMetadata } from "@/lib/seo";

const description =
  "Practice scientific notation, fraction conversions, and powers of ten with a result that updates as you type.";

const faqs = [
  {
    question: "What is scientific notation?",
    answer:
      "Scientific notation writes a number as a coefficient times a power of ten. The coefficient is at least 1 and less than 10. 6.022 × 10^23 is the scientific notation for Avogadro’s number.",
  },
  {
    question: "How do I turn a fraction into a percent from this guide?",
    answer:
      "Choose Fraction to percent and enter a fraction such as 3/4. The guide divides the numerator by the denominator and multiplies by 100.",
  },
  {
    question: "Where are the full calculators?",
    answer:
      "The scientific calculator, unit converter, and fraction converter each have their own page when you want the complete tool.",
  },
];

export const metadata = pageMetadata({
  title: "Educational Guides — MathVibe",
  description,
  path: "/guides",
});

export default function GuidesPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 py-12 sm:gap-16 sm:px-6 sm:py-16">
      <section>
        <p className="text-sm font-medium tracking-[0.18em] text-cyan uppercase">Educational Guides</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
          Educational Guides
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted sm:text-lg">{description}</p>
        <ul className="mt-4 flex flex-col gap-2 text-sm">
          <li>
            <Link href="/scientific-calculator" className="text-[#00D1F7] underline-offset-4 hover:underline">
              Scientific calculator
            </Link>
          </li>
          <li>
            <Link href="/unit-converter" className="text-[#00D1F7] underline-offset-4 hover:underline">
              Unit converter
            </Link>
          </li>
          <li>
            <Link href="/calculators/fraction-converter" className="text-[#00D1F7] underline-offset-4 hover:underline">
              Fraction converter
            </Link>
          </li>
        </ul>
      </section>
      <GuideExplorer />
      <AdSlot placement="rectangle" />
      <article className="flex max-w-3xl flex-col gap-10">
        <section>
          <h2 className="text-xl font-semibold text-ink">How It Works</h2>
          <p className="mt-3 text-sm text-muted sm:text-base">
            Choose a guide and type a value. The explanation is rebuilt from that value, so the same steps you see are the steps for your example.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-ink">Formula & Logic Explanation</h2>
          <div className="mt-3 space-y-3 text-sm text-muted sm:text-base">
            <p>Scientific notation: n = m × 10^e, with 1 ≤ |m| &lt; 10.</p>
            <p>A fraction a/b becomes the decimal a ÷ b and the percent (a × 100) ÷ b.</p>
            <p>A power of ten, 10^e, moves the decimal point e places.</p>
          </div>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-ink">Step-by-Step Examples</h2>
          <div className="mt-3 space-y-3 text-sm text-muted sm:text-base">
            <p>6.022e23 is already 6.022 × 10^23.</p>
            <p>3/4 = 0.75 = 75%.</p>
            <p>10^2 = 100 and 10^3 = 1000.</p>
          </div>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-ink">Frequently Asked Questions</h2>
          <div className="mt-6">
            <FaqAccordion items={faqs} idPrefix="guide-page-faq" />
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
