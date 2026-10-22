import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { FractionConverter } from "@/components/calculators/FractionConverter";
import { FaqAccordion } from "@/components/content/FaqAccordion";
import { FractionWriteup } from "@/components/content/FractionWriteup";
import { GuideSection } from "@/components/content/GuideSection";
import { evaluateFraction } from "@/lib/math";
import { roundDisplayedFraction } from "@/lib/rounding";
import { pageMetadata } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

const examples = ["5/6", "3/4", "7/8"] as const;

const workedExamples = examples.map((example) => {
  const evaluation = evaluateFraction(example);

  if (evaluation.status !== "ok") {
    throw new Error(`Expected ${example} to convert.`);
  }

  return roundDisplayedFraction(evaluation.result, 6, 2);
});

const pageDescription =
  "Convert fractions such as 5/6, 3/4, and 7/8 into decimals, percents, and equivalent fractions, with a step-by-step breakdown.";

const converterFaqs = [
  {
    question: "How do you convert a fraction to a decimal?",
    answer: "Divide the numerator by the denominator. For example, 3/4 = 3 ÷ 4 = 0.75.",
  },
  {
    question: "How do you convert a fraction to a percent?",
    answer: "Multiply the fraction by 100. For example, 7/8 = (7 × 100) ÷ 8 = 87.5%.",
  },
  {
    question: "What is an equivalent fraction?",
    answer:
      "An equivalent fraction has the same value after the numerator and denominator are multiplied by the same whole number. 1/2, 2/4, and 3/6 are equivalent.",
  },
];

export const metadata = pageMetadata({
  title: "Fraction & Decimal Converter — MathVibe",
  description: pageDescription,
  path: "/calculators/fraction-converter",
});

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "Fraction & Decimal Converter",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      url: `${siteUrl}/calculators/fraction-converter`,
      description: pageDescription,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
    {
      "@type": "HowTo",
      name: "How to convert a fraction to a decimal and a percent",
      description:
        "Divide the numerator by the denominator, multiply that decimal by 100, then simplify and build equivalent fractions.",
      step: [
        {
          "@type": "HowToStep",
          name: "Read the fraction",
          text: "Identify the numerator and the denominator. In 5/6, the numerator is 5 and the denominator is 6.",
        },
        {
          "@type": "HowToStep",
          name: "Divide to find the decimal",
          text: "Decimal = numerator ÷ denominator. For 5/6, the page shows 5 ÷ 6 = 0.833333. The exact decimal repeats as 0.8(3).",
        },
        {
          "@type": "HowToStep",
          name: "Multiply by 100 to find the percent",
          text: "Percent = (numerator × 100) ÷ denominator. For 5/6, the page shows 500 ÷ 6 = 83.33%. The exact percent repeats as 83.(3)%.",
        },
        {
          "@type": "HowToStep",
          name: "Simplify and find equivalent fractions",
          text: "Divide the numerator and denominator by their greatest common divisor, then multiply both parts by 2, 3, 4, and 5.",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: converterFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ],
};

export default function FractionConverterPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 py-12 sm:gap-16 sm:px-6 sm:py-16">
      <section>
        <p className="text-sm font-medium tracking-[0.18em] text-cyan uppercase">
          Fraction & Decimal Converters
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
          Fraction & Decimal Converter
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted sm:text-lg">
          Turn a fraction into a decimal, a percent, and equivalent fractions.
          The steps stay visible so the result can be checked.
        </p>
        <ul className="mt-6 flex flex-col gap-2 text-sm">
          <li>
            <Link href="/convert/5-6-as-a-percent" className="text-[#00D1F7] underline-offset-4 hover:underline">
              What is 5/6 as a percent?
            </Link>
          </li>
          <li>
            <Link href="/convert/3-4-as-a-decimal" className="text-[#00D1F7] underline-offset-4 hover:underline">
              What is 3/4 as a decimal?
            </Link>
          </li>
          <li>
            <Link href="/convert/5-8" className="text-[#00D1F7] underline-offset-4 hover:underline">
              Convert 5/8
            </Link>
          </li>
        </ul>
      </section>

      <FractionConverter />

      <AdSlot placement="rectangle" />

      <FractionWriteup examples={workedExamples} rounded decimalPlaces={6} percentPlaces={2} />

      <section aria-labelledby="converter-faq-heading" className="max-w-3xl">
        <h2 id="converter-faq-heading" className="text-xl font-semibold text-ink">
          Frequently Asked Questions
        </h2>
        <div className="mt-6">
          <FaqAccordion items={converterFaqs} idPrefix="converter-faq" />
        </div>
      </section>

      <GuideSection />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  );
}
