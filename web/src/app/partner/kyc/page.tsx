import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/DashboardShell";
import type { KycFile } from "@/components/KycDocument";
import { KycForm } from "@/components/KycForm";
import type { KycRow } from "@/components/KycForm";
import { getPartnerContext } from "@/lib/partner";

export const metadata: Metadata = { title: "Spa verification (KYC) | Sukoonam" };

export default function PartnerKycPage() {
  return (
    <DashboardShell>
      <KycEditor />
    </DashboardShell>
  );
}

const BANNERS: Record<string, { style: string; title: string; text: string }> = {
  draft: {
    style: "border-line bg-accent-soft",
    title: "Verify your spa",
    text: "Fill in these details and upload the documents. Save a draft any time, then submit when everything is ready. Your spa goes live once we approve it.",
  },
  submitted: {
    style: "border-amber-300 bg-amber-50",
    title: "Under review",
    text: "Thank you. We are checking your details and documents. You cannot change them while they are being reviewed.",
  },
  approved: {
    style: "border-green-300 bg-green-50",
    title: "Verified",
    text: "Your spa is verified and visible to customers. If a licence changes or expires, please contact us.",
  },
  rejected: {
    style: "border-red-300 bg-red-50",
    title: "Changes needed",
    text: "Please fix the points below and submit again.",
  },
};

async function KycEditor() {
  const { supabase, spa } = await getPartnerContext();

  if (!spa) {
    redirect("/partner/spa");
  }

  const [{ data: kyc }, { data: documents }] = await Promise.all([
    supabase.from("spa_kyc").select("*").eq("spa_id", spa.id).maybeSingle(),
    supabase.from("kyc_documents").select("id, kind, storage_path, file_name").eq("spa_id", spa.id).order("created_at"),
  ]);

  // Private files open through links that work for one hour.
  const { data: links } = documents?.length
    ? await supabase.storage.from("spa-kyc").createSignedUrls(documents.map((doc) => doc.storage_path), 3600)
    : { data: [] };

  const files: Record<string, KycFile[]> = {};
  (documents ?? []).forEach((doc, index) => {
    (files[doc.kind] ??= []).push({ id: doc.id, fileName: doc.file_name, url: links?.[index]?.signedUrl ?? null });
  });

  const status = kyc?.status ?? "draft";
  const banner = BANNERS[status] ?? BANNERS.draft;

  return (
    <div className="rise-in flex flex-col gap-6">
      <div>
        <Link href="/partner" className="text-sm text-brand hover:underline">
          Back to dashboard
        </Link>
        <h1 className="mt-2 font-display text-3xl font-bold">Spa verification (KYC)</h1>
      </div>

      <div className={`rounded-2xl border p-5 ${banner.style}`}>
        <p className="font-display text-lg font-semibold">{banner.title}</p>
        <p className="mt-1 text-sm">{banner.text}</p>
        {status === "rejected" && kyc?.review_note && (
          <p className="mt-3 rounded-lg bg-white px-4 py-3 text-sm font-medium">{kyc.review_note}</p>
        )}
      </div>

      <KycForm
        spaId={spa.id}
        kyc={(kyc as KycRow | null) ?? null}
        files={files}
        editable={status === "draft" || status === "rejected"}
      />
    </div>
  );
}
