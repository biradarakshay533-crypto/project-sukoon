import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";

// Temporary page that proves the website can reach Supabase.
export default function ConnectionCheck() {
  return (
    <main className="p-8 font-sans">
      <h1 className="text-2xl font-bold">Sukoonam connection check</h1>
      <Suspense fallback={<p className="mt-4">Checking...</p>}>
        <ConnectionResult />
      </Suspense>
    </main>
  );
}

async function ConnectionResult() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("settings").select().single();

  if (error) {
    return <p className="mt-4 text-red-600">Not connected: {error.message}</p>;
  }

  return (
    <p className="mt-4 text-green-700">
      Connected. Refund is {data.refund_percent}% up to{" "}
      {data.refund_cutoff_hours} hours before a booking.
    </p>
  );
}
