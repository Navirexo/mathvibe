import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { AdSlot } from "@/components/ads/AdSlot";
import { FaqAccordion } from "@/components/content/FaqAccordion";
import { FractionWriteup } from "@/components/content/FractionWriteup";
import { GuideSection } from "@/components/content/GuideSection";
import { Card } from "@/components/ui/Card";
import { CopyResultBlock } from "@/components/ui/CopyResultButton";
import { pageMetadata } from "@/lib/seo";
import { siteUrl } from "@/lib/site";
import {
  conversionFaqs,
  conversionHeadline,
  generateConversionMetadata,
  parseConversionSlug,
  relatedConversionLinks,
  staticConversionParams,
  workedExampleResults,
  type ParsedConversion,
} from "@/lib/pseo";

type ConvertPageProps = {
  params: Promise<{ slug: string }>;
};

export const instant = false;

export function generateStaticParams() {
  return staticConversionParams();
}

export async function generateMetadata({
  params,
}: ConvertPageProps): Promise<Metadata> {
  const { slug } = await params;
  const conversion = parseConversionSlug(slug);

  if (!conversion) {
    return {
      title: "Conversion not found — MathVibe",
    };
  }

  const metadata = generateConversionMetadata(conversion);

  return pageMetadata({
    title: metadata.title,
    description: metadata.description,
    path: metadata.canonical,
  });
}

export default async function ConversionPage({ params }: ConvertPageProps) {
  const { slug } = await params;
  const conversion = parseConversionSlug(slug);

  if (!conversion) {
    notFound();
  }

  if (slug !== conversion.slug) {
    permanentRedirect(`/convert/${conversion.slug}`);
  }

  const metadata = generateConversionMetadata(conversion);
  const faqs = conversionFaqs(conversion);
  const examples = workedExampleResults(conversion);
  const related = relatedConversionLinks(conversion);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${siteUrl}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Converters",
            item: `${siteUrl}/calculators/fraction-converter`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: conversion.label,
            item: `${siteUrl}${metadata.canonical}`,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
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

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 sm:gap-12 sm:px-6 sm:py-16">
      <article className="flex flex-col gap-10 sm:gap-12">
        <header>
          <Breadcrumb label={conversion.label} />
          <p className="mt-6 text-sm font-medium tracking-[0.18em] text-[#00D1F7] uppercase">
            Fraction & Decimal Converters
          </p>
          <h1 className="mt-3 max-w-4xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
            {conversionHeadline(conversion)}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted sm:text-lg">
            {metadata.description}
          </p>
        </header>

        <section aria-label="Conversion results" className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <ResultCard
            title="Result"
            value={resultValue(conversion)}
            detail={resultDetail(conversion)}
            copyText={resultValue(conversion)}
          />
          <ResultCard
            title="Percentage"
            value={conversion.result.percent}
            accent="violet"
          />
          <ResultCard title="Decimal" value={conversion.result.decimal} />
        </section>

        <AdSlot placement="rectangle" />

        <Card>
          <h2 className="text-lg font-semibold text-ink">Step-by-Step Math</h2>
          <ol className="mt-4 space-y-4">
            {conversion.result.steps.map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-violet/20 text-sm font-semibold text-ink">
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium text-ink">{step.title}</p>
                  <p className="mt-1 text-sm text-muted">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>

        <FractionWriteup examples={examples} rounded />

        <section aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-xl font-semibold text-ink">
            Frequently Asked Questions
          </h2>
          <div className="mt-6">
            <FaqAccordion items={faqs} idPrefix="conversion-faq" />
          </div>
          <Card className="mt-8">
            <h3 className="text-base font-semibold text-ink">Related conversions</h3>
            <ul className="mt-4 flex flex-col gap-2">
              {related.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#00D1F7] underline-offset-4 hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      </article>

      <GuideSection roundedAccuracy />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  );
}

function Breadcrumb({ label }: { label: string }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <li>
          <Link href="/" className="hover:text-[#00D1F7]">
            Home
          </Link>
        </li>
        <li aria-hidden="true">&gt;</li>
        <li>
          <Link
            href="/calculators/fraction-converter"
            className="hover:text-[#00D1F7]"
          >
            Converters
          </Link>
        </li>
        <li aria-hidden="true">&gt;</li>
        <li aria-current="page" className="text-ink">
          {label}
        </li>
      </ol>
    </nav>
  );
}

function ResultCard({
  title,
  value,
  detail,
  copyText,
  accent = "cyan",
}: {
  title: string;
  value: string;
  detail?: string;
  copyText?: string;
  accent?: "cyan" | "violet";
}) {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p
        className={
          accent === "violet"
            ? "mt-3 text-4xl font-semibold tracking-tight text-violet"
            : "mt-3 text-4xl font-semibold tracking-tight text-cyan"
        }
      >
        {value}
      </p>
      {detail ? <p className="mt-3 text-sm text-muted">{detail}</p> : null}
      {copyText ? <CopyResultBlock text={copyText} /> : null}
    </Card>
  );
}

function resultValue(conversion: ParsedConversion) {
  if (conversion.kind === "percent") {
    return conversion.result.percent;
  }

  if (conversion.kind === "decimal") {
    return conversion.result.decimal;
  }

  return `${conversion.result.decimal} = ${conversion.result.percent}`;
}

function resultDetail(conversion: ParsedConversion) {
  const { fraction, result } = conversion;

  if (conversion.kind === "percent") {
    return `${fraction} as a percent is ${result.percent}. Simplest form: ${result.simplified}.`;
  }

  if (conversion.kind === "decimal") {
    return `${fraction} as a decimal is ${result.decimal}. Simplest form: ${result.simplified}.`;
  }

  return `${fraction} equals ${result.decimal} and ${result.percent}. Simplest form: ${result.simplified}.`;
}
