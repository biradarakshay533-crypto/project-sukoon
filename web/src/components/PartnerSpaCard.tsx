import Link from "next/link";
import { currentTime } from "@/lib/booking-time";
import { getPartnerContext } from "@/lib/partner";

const linkStyle =
  "rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-foreground transition hover:border-brand";

// The partner's spa status and links, shown on their dashboard.
export async function PartnerSpaCard() {
  const { supabase, spa } = await getPartnerContext();

  if (!spa) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p>You have not added your spa yet.</p>
        <Link
          href="/partner/spa"
          className="rounded-full bg-brand px-5 py-2.5 font-medium text-white transition hover:bg-brand-dark"
        >
          Add your spa
        </Link>
      </div>
    );
  }

  const [{ count }, { count: waiting }] = await Promise.all([
    supabase.from("services").select("id", { count: "exact", head: true }).eq("spa_id", spa.id),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("spa_id", spa.id)
      .eq("status", "requested")
      .gt("respond_by", currentTime().toISOString()),
  ]);

  return (
    <div className="flex flex-col items-start gap-3">
      <div>
        <p className="text-lg font-semibold text-foreground">{spa.name}</p>
        <p className="text-sm">
          {spa.is_approved
            ? "Approved and visible to customers"
            : "Waiting for approval. Customers cannot see your spa yet."}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/partner/bookings"
          className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-dark"
        >
          Booking requests{waiting ? ` (${waiting} new)` : ""}
        </Link>
        <Link href="/partner/spa" className={linkStyle}>
          Edit spa and photos
        </Link>
        <Link href="/partner/services" className={linkStyle}>
          Services ({count ?? 0})
        </Link>
      </div>
    </div>
  );
}
