import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { EquationSolver } from "@/components/calculators/EquationSolver";
import { FaqAccordion } from "@/components/content/FaqAccordion";
import { pageMetadata } from "@/lib/seo";

const description =
  "Solve linear and quadratic equations, simplify expressions, and read every algebra step.";

const faqs = [
  {
    question: "What equations can this solver handle?",
    answer:
      "Solve accepts linear equations such as 2x + 3 = 11 and quadratic equations such as x^2 - 5x + 6 = 0. It also distributes a number across parentheses, as in 2(x + 3) = 10.",
  },
  {
    question: "How does Simplify combine like terms?",
    answer:
      "Simplify groups terms with the same power of x. 2x + 3x - x becomes 4x. 3(x + 2) + 4(x - 1) expands first, then becomes 7x + 2.",
  },
  {
    question: "What does a negative discriminant mean?",
    answer:
      "The discriminant is b² − 4ac. When it is negative, the quadratic formula asks for the square root of a negative number, so there is no real solution.",
  },
];

export const metadata = pageMetadata({
  title: "Scientific Solvers — MathVibe",
  description,
  path: "/scientific-solvers",
});

export default function ScientificSolversPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 py-12 sm:gap-16 sm:px-6 sm:py-16">
      <section>
        <p className="text-sm font-medium tracking-[0.18em] text-cyan uppercase">Scientific Solvers</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
          Equation Solver
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted sm:text-lg">{description}</p>
        <p className="mt-4 text-sm text-muted">
          For a single expression, use the{" "}
          <Link href="/scientific-calculator" className="text-[#00D1F7] underline-offset-4 hover:underline">
            scientific calculator
          </Link>
          .
        </p>
      </section>
      <EquationSolver />
      <AdSlot placement="rectangle" />
      <article className="flex max-w-3xl flex-col gap-10">
        <section>
          <h2 className="text-xl font-semibold text-ink">How It Works</h2>
          <p className="mt-3 text-sm text-muted sm:text-base">
            Type an equation or an expression. Solve moves every term to one side, then uses linear rearrangement or the quadratic formula. Simplify distributes parentheses and adds coefficients that share the same power of x.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-ink">Formula & Logic Explanation</h2>
          <div className="mt-3 space-y-3 text-sm text-muted sm:text-base">
            <p>A linear equation ax + b = 0 has the solution x = −b ÷ a when a is not zero.</p>
            <p>A quadratic equation ax² + bx + c = 0 uses x = (−b ± √(b² − 4ac)) ÷ 2a.</p>
            <p>Like terms add by their coefficients. 2x + 3x − x = (2 + 3 − 1)x = 4x.</p>
          </div>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-ink">Step-by-Step Examples</h2>
          <div className="mt-3 space-y-3 text-sm text-muted sm:text-base">
            <p>2x + 3 = 11 becomes 2x − 8 = 0, so x = 4.</p>
            <p>x² − 5x + 6 = 0 has discriminant 1, so x = 2 or x = 3.</p>
            <p>3(x + 2) + 4(x − 1) expands to 3x + 6 + 4x − 4, which simplifies to 7x + 2.</p>
          </div>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-ink">Frequently Asked Questions</h2>
          <div className="mt-6">
            <FaqAccordion items={faqs} idPrefix="solver-faq" />
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
