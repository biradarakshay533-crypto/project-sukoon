import Link from "next/link";
import { SITE } from "@/lib/site-info";

const COLUMNS = [
  {
    title: "Company",
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
      { label: "My bookings", href: "/account" },
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

const headingStyle = "font-display text-base font-semibold text-white";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-night text-white/80">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-4 py-14 lg:grid-cols-4">
        {COLUMNS.map((column) => (
          <nav key={column.title} className="flex flex-col gap-3 border-l border-white/20 pl-4">
            <p className={headingStyle}>{column.title}</p>
            {column.links.map((link) => (
              <Link key={link.label} href={link.href} className="text-sm transition hover:text-white">
                {link.label}
              </Link>
            ))}
          </nav>
        ))}
        <div className="col-span-2 flex flex-col gap-3 border-l border-white/20 pl-4 lg:col-span-1">
          <p className={headingStyle}>Support</p>
          {SITE.phone && (
            <a href={`tel:${SITE.phone}`} className="text-sm hover:text-white">
              {SITE.phone}
            </a>
          )}
          {SITE.email && (
            <a href={`mailto:${SITE.email}`} className="text-sm hover:text-white">
              {SITE.email}
            </a>
          )}
          <p className="text-sm">{SITE.city}</p>
          <Link href="/contact" className="text-sm underline underline-offset-4 hover:text-white">
            Get in touch
          </Link>
        </div>
      </div>
      <div className="border-t border-white/20">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-xl font-bold text-white">Sukoonam</p>
          <p>© 2026 Sukoonam. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
