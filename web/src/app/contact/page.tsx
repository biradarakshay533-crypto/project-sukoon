import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";
import { SITE } from "@/lib/site-info";

export const metadata: Metadata = { title: "Contact us | Sukoonam" };

export default function ContactPage() {
  const hasDetails = SITE.email || SITE.phone;

  return (
    <InfoPage title="Contact us" intro="We are happy to help with bookings, payments and listings.">
      <ul>
        <li>
          <strong>Address:</strong> {SITE.city}
        </li>
        {SITE.email && (
          <li>
            <strong>Email:</strong>{" "}
            <a href={`mailto:${SITE.email}`} className="text-brand hover:underline">
              {SITE.email}
            </a>
          </li>
        )}
        {SITE.phone && (
          <li>
            <strong>Phone:</strong>{" "}
            <a href={`tel:${SITE.phone}`} className="text-brand hover:underline">
              {SITE.phone}
            </a>
          </li>
        )}
      </ul>
      {!hasDetails && <p className="text-muted">Our email and phone number will be listed here soon.</p>}
      <h2>About a booking</h2>
      <p>
        For questions about a visit, such as directions or timings, please contact the spa directly
        using the details on its page.
      </p>
    </InfoPage>
  );
}
