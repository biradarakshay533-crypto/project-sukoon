import Link from "next/link";
import { currentTime } from "@/lib/booking-time";
import { getPartnerContext } from "@/lib/partner";

const KYC_LABELS: Record<string, { text: string; style: string; action: string }> = {
  none: { text: "KYC not started", style: "bg-red-50 text-red-800", action: "Start KYC" },
  draft: { text: "KYC not submitted yet", style: "bg-red-50 text-red-800", action: "Finish KYC" },
  submitted: { text: "KYC under review", style: "bg-amber-50 text-amber-900", action: "View KYC" },
  approved: { text: "KYC verified", style: "bg-green-50 text-green-800", action: "View KYC" },
  rejected: { text: "KYC needs changes", style: "bg-red-50 text-red-800", action: "Fix KYC" },
};

const linkStyle =
  "rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-brand hover:text-brand";

// The partner's spa status and links, shown on their dashboard.
export async function PartnerSpaCard() {
  const { supabase, spa } = await getPartnerContext();

  if (!spa) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p>You have not added your spa yet.</p>
        <Link
          href="/partner/spa"
          className="rounded-lg bg-brand px-5 py-2.5 font-semibold text-white transition hover:bg-brand-dark"
        >
          Add your spa
        </Link>
      </div>
    );
  }

  const [{ count }, { count: waiting }, { data: kyc }] = await Promise.all([
    supabase.from("services").select("id", { count: "exact", head: true }).eq("spa_id", spa.id),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("spa_id", spa.id)
      .eq("status", "requested")
      .gt("respond_by", currentTime().toISOString()),
    supabase.from("spa_kyc").select("status").eq("spa_id", spa.id).maybeSingle(),
  ]);
  const kycLabel = KYC_LABELS[kyc?.status ?? "none"] ?? KYC_LABELS.none;

  return (
    <div className="flex flex-col items-start gap-3">
      <div>
        <p className="font-display text-xl font-bold text-foreground">{spa.name}</p>
        <p className="text-sm">
          {spa.is_approved
            ? "Approved and visible to customers"
            : "Waiting for approval. Customers cannot see your spa yet."}
        </p>
      </div>
      <Link
        href="/partner/kyc"
        className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium ${kycLabel.style}`}
      >
        <span>{kycLabel.text}</span>
        <span className="font-semibold underline">{kycLabel.action} →</span>
      </Link>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/partner/bookings"
          className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
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
