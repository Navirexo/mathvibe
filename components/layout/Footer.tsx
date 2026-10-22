import Link from "next/link";

const siteLinks = [
  { href: "/", label: "Home" },
  { href: "/#categories", label: "Categories" },
  { href: "/#popular", label: "Popular" },
];

const legalLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-midnight/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-2.5">
            <FooterLogo />
            <div>
              <p className="font-semibold text-ink">
                Math<span className="text-cyan">Vibe</span>
              </p>
              <p className="mt-1 text-sm text-muted">mathvibe.net</p>
            </div>
          </div>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {siteLinks.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <nav aria-label="Legal">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>
          <p className="text-sm text-muted">© 2026 MathVibe</p>
        </div>
      </div>
    </footer>
  );
}

function FooterLogo() {
  return (
    <span
      aria-hidden="true"
      className="grid size-8 shrink-0 place-items-center rounded-lg border border-cyan/40 bg-surface shadow-[0_0_18px_rgba(45,212,191,0.28)] sm:size-9"
    >
      <svg viewBox="0 0 24 24" className="size-4 sm:size-5" fill="none">
        <path
          d="M3.5 16.5 8.5 6.5l3.2 6.2L14.8 6.5l5.7 10"
          stroke="#2DD4BF"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="18.6" cy="6.2" r="1.5" fill="#8B5CF6" />
      </svg>
    </span>
  );
}

function FooterLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center text-sm text-muted hover:text-cyan"
    >
      {children}
    </Link>
  );
}
