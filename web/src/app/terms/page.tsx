import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = { title: "Terms and conditions | Sukoonam" };

// Draft wording. The client must review it before going live.
export default function TermsPage() {
  return (
    <InfoPage title="Terms and conditions" intro="Please read these terms before using Sukoonam.">
      <h2>What Sukoonam does</h2>
      <p>
        Sukoonam is an online platform that connects customers with independent spas. The spas
        provide the services. Sukoonam handles listings, booking requests and online payments.
      </p>
      <h2>Your account</h2>
      <ul>
        <li>You must give your real name, email and mobile number.</li>
        <li>Keep your password private. You are responsible for activity on your account.</li>
        <li>Each email address can be used for one account, either as a customer or as a spa partner.</li>
      </ul>
      <h2>Booking requests</h2>
      <ul>
        <li>When you send a booking request, you approve the payment and it is held, not collected.</li>
        <li>The payment is collected only if the spa accepts your request.</li>
        <li>If the spa declines or does not respond in time, the held payment is released back to you.</li>
      </ul>
      <h2>Cancellations and refunds</h2>
      <p>
        Cancellations and refunds follow our{" "}
        <Link href="/refund-policy" className="text-brand hover:underline">
          refund and cancellation policy
        </Link>
        .
      </p>
      <h2>Spa partners</h2>
      <ul>
        <li>Spas must give accurate details, photos, services and prices.</li>
        <li>New spas appear on Sukoonam only after our team approves them.</li>
        <li>Spas are responsible for the services they provide to customers.</li>
      </ul>
      <h2>Fair use</h2>
      <p>
        Do not misuse Sukoonam, give false information or interfere with the website. We may suspend
        accounts that break these terms.
      </p>
      <h2>Changes to these terms</h2>
      <p>We may update these terms. The latest version is always on this page.</p>
    </InfoPage>
  );
}
