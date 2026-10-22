import { TextPage } from "@/components/content/TextPage";
import { pageMetadata } from "@/lib/seo";
import { contactEmail } from "@/lib/site";
import Link from "next/link";

const description =
  "MathVibe is a free collection of math tools and written solutions, built to show the steps behind each answer.";

export const metadata = pageMetadata({
  title: "About MathVibe",
  description,
  path: "/about",
});

export default function AboutPage() {
  return (
    <TextPage
      eyebrow="MathVibe"
      title="About"
      lede="MathVibe is a set of fast math tools for people who want the answer and the working."
    >
      <section>
        <h2>What the site does</h2>
        <p className="mt-3">
          The homepage helps you find a calculator or converter. The Fraction
          & Decimal Converter turns a fraction into a decimal, a percent, and
          equivalent fractions. Dedicated pages such as{" "}
          <Link href="/convert/5-6-as-a-percent">5/6 as a percent</Link> publish
          the same result with the steps written out so the page can be read
          and shared.
        </p>
      </section>
      <section>
        <h2>How the math is shown</h2>
        <p className="mt-3">
          Conversions use exact integer division. A repeating decimal is marked
          with parentheses, so 5/6 is 0.8(3) and 83.(3)%, rather than a rounded
          guess. Each solution lists the read, divide, percent, simplify, and
          equivalent-fraction steps.
        </p>
      </section>
      <section>
        <h2>Who it is for</h2>
        <p className="mt-3">
          Students, teachers, and anyone checking a fraction can use the tools
          in a browser on a phone or a computer. There is no account to create.
        </p>
      </section>
      <section>
        <h2>Contact</h2>
        <p className="mt-3">
          Write to <a href={`mailto:${contactEmail}`}>{contactEmail}</a> or
          visit the <Link href="/contact">contact page</Link>.
        </p>
      </section>
    </TextPage>
  );
}
