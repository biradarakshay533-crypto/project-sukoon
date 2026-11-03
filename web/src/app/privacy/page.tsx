import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = { title: "Privacy policy | Sukoonam" };

// Draft wording. The client must review it before going live.
export default function PrivacyPage() {
  return (
    <InfoPage title="Privacy policy" intro="How Sukoonam collects, uses and protects your information.">
      <h2>What we collect</h2>
      <ul>
        <li>Account details: your name, email address and mobile number.</li>
        <li>Booking details: the spa, service, date and time you request.</li>
        <li>Spa details from spa partners: address, map location, photos, services and prices.</li>
      </ul>
      <h2>Your location</h2>
      <p>
        When you tap Near me, your browser shares your location so we can sort spas by distance.
        This happens on your device and we do not save your location.
      </p>
      <h2>Payments</h2>
      <p>
        Payments are processed by our payment partner. Sukoonam does not see or store your full card
        or UPI details.
      </p>
      <h2>Who sees your information</h2>
      <ul>
        <li>When you book, the spa receives your name, email, mobile number and booking details.</li>
        <li>Spas cannot see your account or bookings at other spas.</li>
        <li>We do not sell your information.</li>
      </ul>
      <h2>Cookies</h2>
      <p>We use cookies only to keep you logged in.</p>
      <h2>Your choices</h2>
      <p>
        You can update your name and mobile number from your account. To ask for a copy of your
        information or to delete your account,{" "}
        <Link href="/contact" className="text-brand hover:underline">
          contact us
        </Link>
        .
      </p>
    </InfoPage>
  );
}
