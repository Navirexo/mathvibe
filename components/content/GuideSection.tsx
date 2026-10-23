import { AmbientGlow } from "@/components/home/AmbientGlow";
import { FaqAccordion, type FaqItem } from "@/components/content/FaqAccordion";
import { Card } from "@/components/ui/Card";
import { evaluateFraction } from "@/lib/math";
import {
  decimalApproximationNote,
  percentApproximationNote,
} from "@/lib/rounding";
import type { ReactNode } from "react";

const steps = [
  {
    title: "Select a tool",
    body: "Search the homepage or open a converter. The Fraction & Decimal Converter and each conversion page start from the same place.",
    icon: <SelectIcon />,
  },
  {
    title: "Enter an expression",
    body: "Type a fraction such as 5/6, 3/4, or 7/8. The page reads the numerator and denominator as you type.",
    icon: <EnterIcon />,
  },
  {
    title: "Get an instant solution",
    body: "Decimal, percent, equivalent fractions, and the worked steps appear immediately. Copy the result when you need it elsewhere.",
    icon: <SolutionIcon />,
  },
] as const;

const reasons = [
  {
    title: "Speed",
    body: "Results update with the input. There is no extra submit step and no waiting on a server round trip for the calculation.",
    icon: <SpeedIcon />,
  },
  {
    title: "Step-by-step breakdown",
    body: "Every answer shows the operations behind it, from the division to the percent and the simplified fraction.",
    icon: <StepsIcon />,
  },
  {
    title: "Mobile responsiveness",
    body: "Cards stack on a phone, tap targets stay comfortable, and the same solution is readable on a small screen.",
    icon: <MobileIcon />,
  },
] as const;

const repeatingExample = evaluateFraction("5/6");
const repeatingResult = repeatingExample.status === "ok" ? repeatingExample.result : null;

const faqs: FaqItem[] = [
  {
    question: "How accurate are MathVibe calculations?",
    answer: repeatingResult
      ? `5/6 is exactly ${repeatingResult.decimal}, or ${repeatingResult.percent}. ${decimalApproximationNote(repeatingResult)} ${percentApproximationNote(repeatingResult)} The fraction converter, guides, and conversion pages use this same display.`
      : "Repeating decimals are shown exactly, with the repeating digits in parentheses.",
  },
  {
    question: "How do I use MathVibe?",
    answer:
      "Choose a tool from the homepage, or open a conversion address such as /convert/3-4-as-a-decimal. Enter a fraction. The decimal, percent, and steps update on the page.",
  },
  {
    question: "How do the step-by-step solvers work?",
    answer:
      "The solver reads the numerator and denominator, divides to find the decimal, multiplies by 100 for the percent, simplifies by the greatest common divisor, and lists equivalent fractions. Each of those moves is written out beside the answer.",
  },
  {
    question: "Can I use MathVibe on a phone?",
    answer:
      "Yes. The layout reflows for narrow screens, and the calculations run in the browser. You can search, convert, and read the steps without installing an app.",
  },
  {
    question: "Do I need an account?",
    answer:
      "No. The tools are open in the browser. There is no sign-in, and a finished conversion page can be shared by its address.",
  },
];

export function GuideSection({
  includeSchema = false,
}: {
  includeSchema?: boolean;
}) {
  const items = faqs;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <section id="how-to-use" aria-labelledby="how-to-use-heading" className="relative overflow-x-clip">
      <AmbientGlow className="-inset-x-8 -top-8 h-64" />
      <div className="relative flex flex-col gap-12 sm:gap-14">
        <div>
          <p className="text-sm font-medium tracking-[0.18em] text-[#00D1F7] uppercase">
            How to use & FAQ
          </p>
          <h2 id="how-to-use-heading" className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            How to Use MathVibe
          </h2>
          <p className="mt-3 max-w-2xl text-base text-slate-200">
            Pick a tool, enter the expression, and read a solution that shows its work.
          </p>
          <ol className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title}>
                <Card className="flex h-full flex-col">
                  <div className="flex items-center justify-between gap-3">
                    <IconFrame>{step.icon}</IconFrame>
                    <span className="text-sm font-semibold tracking-[0.18em] text-[#8B5CF6]">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-ink">{step.title}</h3>
                  <p className="mt-2 text-base text-slate-200">{step.body}</p>
                </Card>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Why Choose MathVibe
          </h2>
          <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {reasons.map((reason) => (
              <li key={reason.title}>
                <Card className="flex h-full flex-col">
                  <IconFrame>{reason.icon}</IconFrame>
                  <h3 className="mt-5 text-lg font-semibold text-ink">{reason.title}</h3>
                  <p className="mt-2 text-base text-slate-200">{reason.body}</p>
                </Card>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 max-w-2xl text-base text-slate-200">
            Accuracy, everyday use, and how the step-by-step solvers are built.
          </p>
          <div className="mt-6">
            <FaqAccordion items={items} idPrefix="guide-faq" />
          </div>
        </div>
      </div>
      {includeSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
      ) : null}
    </section>
  );
}

function IconFrame({ children }: { children: ReactNode }) {
  return (
    <span className="grid size-11 place-items-center rounded-xl border border-cyan-500/30 bg-midnight/80 text-[#00D1F7] shadow-[0_0_16px_rgba(0,209,247,0.22)]">
      {children}
    </span>
  );
}

function SelectIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M14.5 16.75h5.5M17.25 14v5.5" stroke="#8B5CF6" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function EnterIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7 10h6M7 14h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M15 13.5 17.5 16 15 18.5" stroke="#8B5CF6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SolutionIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.5 12.2 11 14.6 15.8 9.4" stroke="#8B5CF6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SpeedIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
      <path d="M13 3.5 6.5 13.5h5L10.5 20.5 17.5 10h-5L13 3.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function StepsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
      <path d="M5 7h4v4H5V7ZM10 12h4v4h-4v-4ZM15 7h4v4h-4V7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 9h6M12 11v1" stroke="#8B5CF6" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function MobileIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
      <rect x="7" y="3" width="10" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M11 18h2" stroke="#8B5CF6" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
