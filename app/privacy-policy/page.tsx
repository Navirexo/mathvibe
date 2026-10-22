import { TextPage } from "@/components/content/TextPage";
import { pageMetadata } from "@/lib/seo";
import { contactEmail } from "@/lib/site";
import Link from "next/link";

const description =
  "How MathVibe handles browser calculations, site logs, cookies, and advertising if ads are shown.";

export const metadata = pageMetadata({
  title: "Privacy Policy — MathVibe",
  description,
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <TextPage
      eyebrow="Legal"
      title="Privacy Policy"
      lede="This policy explains what MathVibe does with information when you use mathvibe.net. It was last updated on 22 October 2026."
    >
      <section>
        <h2>Who we are</h2>
        <p className="mt-3">
          MathVibe publishes free math tools at mathvibe.net. Questions about
          this policy can be sent to{" "}
          <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
        </p>
      </section>
      <section>
        <h2>Calculations stay in the browser</h2>
        <p className="mt-3">
          Fraction and decimal conversions run in your browser. The fraction
          you type is used to compute the result on that page. MathVibe does
          not ask you to create an account, and it does not keep a profile of
          your calculations.
        </p>
      </section>
      <section>
        <h2>Information the host may receive</h2>
        <p className="mt-3">
          Like most websites, the server that delivers MathVibe can record
          standard request details such as your IP address, browser type, the
          page address, and the time of the request. Those logs are used to
          operate, secure, and understand the site.
        </p>
      </section>
      <section>
        <h2>Cookies and advertising</h2>
        <p className="mt-3">
          MathVibe may show ads through Google AdSense. Google and its
          advertising partners can use cookies and similar technologies to
          serve ads, limit how often you see an ad, and measure performance.
          Those technologies can collect device and usage information as
          described in{" "}
          <a href="https://policies.google.com/privacy">Google’s Privacy Policy</a>.
          You can manage ad personalization at{" "}
          <a href="https://adssettings.google.com">Google Ad Settings</a>.
        </p>
      </section>
      <section>
        <h2>What we do not do</h2>
        <ul>
          <li>We do not sell personal information.</li>
          <li>We do not require an account to use the tools.</li>
          <li>The site is not directed at children under 13.</li>
        </ul>
      </section>
      <section>
        <h2>Contact</h2>
        <p className="mt-3">
          Email <a href={`mailto:${contactEmail}`}>{contactEmail}</a> about
          privacy, or use the <Link href="/contact">contact page</Link>.
        </p>
      </section>
    </TextPage>
  );
}
