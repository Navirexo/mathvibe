import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/#categories", label: "Categories" },
  { href: "/#popular", label: "Popular" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-midnight/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-semibold text-ink">
            Math<span className="text-cyan">Vibe</span>
          </p>
          <p className="mt-1 text-sm text-muted">mathvibe.net</p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center text-sm text-muted hover:text-cyan"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="text-sm text-muted">© 2026 MathVibe</p>
      </div>
    </footer>
  );
}
