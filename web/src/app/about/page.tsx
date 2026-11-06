import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = { title: "About us | Sukoonam" };

export default function AboutPage() {
  return (
    <InfoPage
      title="About Sukoonam"
      intro="Sukoon means peace. We help you find it at a spa near you."
    >
      <p>
        Sukoonam is an online spa booking platform, starting in Hubballi and Dharwad. We bring local spas
        together in one place so you can compare their massages and prices, see where they are on
        a map, and send a booking request in under a minute.
      </p>
      <h2>For customers</h2>
      <p>
        Browse approved spas, pick a service and pay securely online. Your payment is only
        collected once the spa accepts your request.
      </p>
      <h2>For spas</h2>
      <p>
        Spa owners list their spa, photos and services for free and receive paid booking requests
        from customers nearby. Every spa is reviewed by our team before it appears on Sukoonam.
      </p>
      <p>
        <Link href="/spas" className="font-semibold text-brand hover:underline">
          Find a spa near you
        </Link>
      </p>
    </InfoPage>
  );
}
