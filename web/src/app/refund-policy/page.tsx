import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { InfoPage } from "@/components/InfoPage";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Refund and cancellation policy | Sukoonam" };

// Draft wording. The client must review it before going live.
export default function RefundPolicyPage() {
  return (
    <InfoPage
      title="Refund and cancellation policy"
      intro="What happens to your payment if a booking does not go ahead."
    >
      <h2>If the spa declines or does not respond</h2>
      <p>
        Your payment is only held when you send a request. If the spa declines, or does not respond
        in time, the hold is released and you are not charged.
      </p>
      <h2>If you cancel</h2>
      <Suspense fallback={<p>Loading the current refund rules...</p>}>
        <CancellationRules />
      </Suspense>
      <h2>How refunds are paid</h2>
      <p>
        Refunds go back to the card, UPI account or bank account you paid with. Banks usually take
        5 to 7 working days to show the money in your account.
      </p>
      <h2>Questions</h2>
      <p>
        For help with a refund,{" "}
        <Link href="/contact" className="text-brand hover:underline">
          contact us
        </Link>
        .
      </p>
    </InfoPage>
  );
}

// Reads the live refund settings, so this page always matches the rules in use.
async function CancellationRules() {
  await connection();
  const supabase = await createClient();
  const { data: settings } = await supabase.from("settings").select().single();
  const percent = settings?.refund_percent ?? 100;
  const hours = settings?.refund_cutoff_hours ?? 6;

  return (
    <ul>
      <li>
        Cancel at least {hours} hours before your booking time to get {percent}% of your payment
        back.
      </li>
      <li>Cancellations made less than {hours} hours before the booking time are not refunded.</li>
    </ul>
  );
}
