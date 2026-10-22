import type { Metadata } from "next";
import Link from "next/link";
import { FractionConverter } from "@/components/calculators/FractionConverter";
import { GuideSection } from "@/components/content/GuideSection";
import { evaluateFraction, type FractionResult } from "@/lib/math";

const examples = ["5/6", "3/4", "7/8"] as const;

const workedExamples = examples.map((example) => {
  const evaluation = evaluateFraction(example);

  if (evaluation.status !== "ok") {
    throw new Error(`Expected ${example} to convert.`);
  }

  return evaluation.result;
});

const pageDescription =
  "Convert fractions such as 5/6, 3/4, and 7/8 into decimals, percents, and equivalent fractions, with a step-by-step breakdown.";

export const metadata: Metadata = {
  title: "Fraction & Decimal Converter — MathVibe",
  description: pageDescription,
  alternates: {
    canonical: "/calculators/fraction-converter",
  },
  openGraph: {
    title: "Fraction & Decimal Converter — MathVibe",
    description: pageDescription,
    url: "/calculators/fraction-converter",
    siteName: "MathVibe",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Fraction & Decimal Converter — MathVibe",
    description: pageDescription,
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "Fraction & Decimal Converter",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      url: "https://mathvibe.net/calculators/fraction-converter",
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
          text: "Decimal = numerator ÷ denominator. For 5/6, 5 ÷ 6 = 0.8(3).",
        },
        {
          "@type": "HowToStep",
          name: "Multiply by 100 to find the percent",
          text: "Percent = (numerator × 100) ÷ denominator. For 5/6, 500 ÷ 6 = 83.(3)%.",
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
      mainEntity: [
        {
          "@type": "Question",
          name: "How do you convert a fraction to a decimal?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Divide the numerator by the denominator. For example, 3/4 = 3 ÷ 4 = 0.75.",
          },
        },
        {
          "@type": "Question",
          name: "How do you convert a fraction to a percent?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Multiply the fraction by 100. For example, 7/8 = (7 × 100) ÷ 8 = 87.5%.",
          },
        },
        {
          "@type": "Question",
          name: "What is an equivalent fraction?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "An equivalent fraction has the same value after the numerator and denominator are multiplied by the same whole number. 1/2, 2/4, and 3/6 are equivalent.",
          },
        },
      ],
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

      <section aria-labelledby="method-heading" className="max-w-3xl">
        <h2 id="method-heading" className="text-xl font-semibold text-ink">
          How the conversion works
        </h2>
        <p className="mt-3 text-sm text-muted sm:text-base">
          A fraction a/b is the division a ÷ b. That quotient is the decimal.
          Multiplying the decimal by 100, which is the same as (a × 100) ÷ b,
          gives the percent. Equivalent fractions keep the same value when the
          numerator and denominator are multiplied by the same whole number.
        </p>
        <div className="mt-8 flex flex-col gap-8">
          {workedExamples.map((example) => (
            <WorkedExample key={example.fraction} result={example} />
          ))}
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

function WorkedExample({ result }: { result: FractionResult }) {
  return (
    <article>
      <h3 className="text-lg font-semibold text-ink">
        {result.fraction} = {result.decimal} = {result.percent}
      </h3>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted">
        {result.steps.map((step) => (
          <li key={step.title}>
            <span className="font-medium text-ink">{step.title}. </span>
            {step.body}
          </li>
        ))}
      </ol>
    </article>
  );
}
