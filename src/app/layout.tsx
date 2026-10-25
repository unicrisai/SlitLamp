import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "SlitLamp · Ophthalmology Evidence Tracker",
  description:
    "Weekly guideline changes and high-evidence ophthalmology studies, with a reviewed abbreviation glossary.",
};

const NAV = [
  { href: "/digest/", label: "Digest" },
  { href: "/guidelines/", label: "Guidelines" },
  { href: "/glossary/", label: "Glossary" },
  { href: "/about/", label: "About" },
];

// Every page carries the "information, not advice" notice: content pages via
// <Page>, the front page in its own layout.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <header className="border-b border-line bg-surface">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-ink">
              <span aria-hidden className="inline-block h-3 w-3 rounded-full bg-brand ring-4 ring-brand-soft" />
              SlitLamp
              <span className="hidden font-normal text-muted sm:inline">· Ophthalmology Evidence Tracker</span>
            </Link>
            <nav className="flex gap-1 text-sm">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="rounded-md px-3 py-1.5 text-muted hover:bg-brand-soft hover:text-brand">
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-line py-6 text-center text-xs text-muted">
          Information, not medical advice. Citation data from PubMed; guideline links point to their issuers.
        </footer>
      </body>
    </html>
  );
}
