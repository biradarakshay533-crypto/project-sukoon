import Link from "next/link";

const COLUMNS = [
  {
    title: "Sukoonam",
    links: [
      { label: "About us", href: "/about" },
      { label: "Contact us", href: "/contact" },
      { label: "List your spa", href: "/partner/signup" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Find a spa", href: "/spas" },
      { label: "Massages", href: "/#massages" },
      { label: "Spas near me", href: "/#nearby" },
    ],
  },
  {
    title: "Your account",
    links: [
      { label: "Sign up", href: "/signup" },
      { label: "Log in", href: "/login" },
      { label: "My bookings", href: "/account" },
      { label: "Partner dashboard", href: "/partner" },
    ],
  },
  {
    title: "Policies",
    links: [
      { label: "Terms and conditions", href: "/terms" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Refund and cancellation", href: "/refund-policy" },
    ],
  },
];

const LEGAL = [
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms and conditions", href: "/terms" },
  { label: "Refund policy", href: "/refund-policy" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-brand-dark text-white/75">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="mb-10 flex flex-col gap-2 border-b border-white/15 pb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-display text-4xl font-semibold text-white">Sukoonam</p>
            <p className="mt-2 max-w-md">
              Find spas near you, compare massages and prices, and book with secure online payment.
            </p>
          </div>
          <p className="text-sm">Dharwad, Karnataka</p>
        </div>
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-4">
          {COLUMNS.map((column) => (
            <nav key={column.title} className="flex flex-col gap-3">
              <p className="font-display text-xl font-semibold text-white">{column.title}</p>
              {column.links.map((link) => (
                <Link key={link.label} href={link.href} className="transition hover:text-white">
                  {link.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Sukoonam. All rights reserved.</p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            {LEGAL.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-white">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
