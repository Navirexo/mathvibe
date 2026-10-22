import { TextPage } from "@/components/content/TextPage";
import { pageMetadata } from "@/lib/seo";
import { contactEmail } from "@/lib/site";
import Link from "next/link";

const description =
  "The terms that apply when you use MathVibe’s free math tools, pages, and any ads shown on mathvibe.net.";

export const metadata = pageMetadata({
  title: "Terms of Use — MathVibe",
  description,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <TextPage
      eyebrow="Legal"
      title="Terms of Use"
      lede="These terms apply when you use mathvibe.net. They were last updated on 22 October 2026."
    >
      <section>
        <h2>Using the tools</h2>
        <p className="mt-3">
          MathVibe provides educational calculators and written explanations.
          You can use the pages for personal learning, homework checks, and
          general reference. You may not misuse the site, attempt to disrupt
          it, or copy it in a way that infringes someone else’s rights.
        </p>
      </section>
      <section>
        <h2>Results</h2>
        <p className="mt-3">
          The fraction converter uses exact integer division and shows repeating
          decimals in parentheses. Even so, you should review important work
          yourself. MathVibe is provided as available, without a promise that
          every future tool or page will be uninterrupted or free of mistakes.
        </p>
      </section>
      <section>
        <h2>Advertising</h2>
        <p className="mt-3">
          Pages may include advertising, including Google AdSense. Ads are
          labeled and sit apart from the calculator controls. Ad partners may
          use cookies as described in the{" "}
          <Link href="/privacy-policy">Privacy Policy</Link>.
        </p>
      </section>
      <section>
        <h2>Content on MathVibe</h2>
        <p className="mt-3">
          The site design, explanations, and tool pages belong to MathVibe.
          You may link to a public page, including a conversion address such as
          a fraction result, for ordinary reference.
        </p>
      </section>
      <section>
        <h2>Contact</h2>
        <p className="mt-3">
          Questions about these terms can go to{" "}
          <a href={`mailto:${contactEmail}`}>{contactEmail}</a> or the{" "}
          <Link href="/contact">contact page</Link>.
        </p>
      </section>
    </TextPage>
  );
}
