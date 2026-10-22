import type { FractionResult } from "@/lib/math";

export function FractionWriteup({
  examples,
  rounded = false,
  decimalPlaces = 4,
  percentPlaces = 2,
}: {
  examples: FractionResult[];
  rounded?: boolean;
  decimalPlaces?: number;
  percentPlaces?: number;
}) {
  const focus = examples[0];

  return (
    <div className="flex max-w-3xl flex-col gap-10">
      <section aria-labelledby="how-it-works-heading">
        <h2 id="how-it-works-heading" className="text-xl font-semibold text-ink">
          How It Works
        </h2>
        <p className="mt-3 text-sm text-muted sm:text-base">
          A fraction is a division problem. {focus.fraction} means{" "}
          {focus.numerator} divided by {focus.denominator}. MathVibe divides
          those whole numbers exactly, writes the decimal, then multiplies by
          100 for the percent. If the greatest common divisor is greater than
          1, both parts of the fraction are divided by it to reach simplest
          form. Equivalent fractions are the simplest form multiplied by 2, 3,
          4, and 5.
        </p>
      </section>

      <section aria-labelledby="formula-heading">
        <h2 id="formula-heading" className="text-xl font-semibold text-ink">
          Formula & Logic Explanation
        </h2>
        <div className="mt-3 space-y-3 text-sm text-muted sm:text-base">
          <p>
            Decimal = numerator ÷ denominator. For {focus.fraction}, that is{" "}
            {focus.numerator} ÷ {focus.denominator} = {focus.decimal}.
          </p>
          <p>
            Percent = (numerator × 100) ÷ denominator. For {focus.fraction},
            that is ({focus.numerator} × 100) ÷ {focus.denominator} ={" "}
            {focus.numerator * 100} ÷ {focus.denominator} = {focus.percent}.
          </p>
          <p>
            Simplest form divides the numerator and denominator by their
            greatest common divisor. {focus.fraction} in simplest form is{" "}
            {focus.simplified}.{" "}
            {rounded
              ? `Decimals are rounded to ${decimalPlaces} places and percentages to ${percentPlaces} places, so ${focus.fraction} is shown as ${focus.decimal} and ${focus.percent}.`
              : "Repeating decimals keep the repeating digits in parentheses, so the displayed value stays exact instead of rounding to a short float."}
          </p>
        </div>
      </section>

      <section aria-labelledby="examples-heading">
        <h2 id="examples-heading" className="text-xl font-semibold text-ink">
          Step-by-Step Examples
        </h2>
        <div className="mt-6 flex flex-col gap-8">
          {examples.map((example) => (
            <article key={example.fraction}>
              <h3 className="text-lg font-semibold text-ink">
                {example.fraction} = {example.decimal} = {example.percent}
              </h3>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted">
                {example.steps.map((step) => (
                  <li key={step.title}>
                    <span className="font-medium text-ink">{step.title}. </span>
                    {step.body}
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
