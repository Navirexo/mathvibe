import { ContactForm } from "@/components/content/ContactForm";
import { TextPage } from "@/components/content/TextPage";
import { Card } from "@/components/ui/Card";
import { pageMetadata } from "@/lib/seo";
import { contactEmail } from "@/lib/site";

const description =
  "Contact MathVibe about a calculation, a correction, privacy, or the site at mathvibe.net.";

export const metadata = pageMetadata({
  title: "Contact — MathVibe",
  description,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <TextPage
      eyebrow="MathVibe"
      title="Contact"
      lede="Send a note about a result, a correction, privacy, or anything else on the site."
    >
      <section>
        <h2>Email</h2>
        <p className="mt-3">
          Write directly to{" "}
          <a href={`mailto:${contactEmail}`}>{contactEmail}</a>. Include the
          page address if your message is about a specific fraction or tool.
        </p>
      </section>
      <Card>
        <h2>Send a message</h2>
        <div className="mt-4">
          <ContactForm />
        </div>
      </Card>
    </TextPage>
  );
}
