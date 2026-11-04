import type { Metadata } from "next";
import Link from "next/link";
import { DashboardShell } from "@/components/DashboardShell";
import { PhotoManager } from "@/components/PhotoManager";
import { SpaForm } from "@/components/SpaForm";
import { getPartnerContext } from "@/lib/partner";

export const metadata: Metadata = { title: "My spa | Sukoonam" };

export default function PartnerSpaPage() {
  return (
    <DashboardShell>
      <SpaEditor />
    </DashboardShell>
  );
}

async function SpaEditor() {
  const { supabase, spa } = await getPartnerContext();

  const { data: photos } = spa
    ? await supabase
        .from("spa_photos")
        .select("id, storage_path")
        .eq("spa_id", spa.id)
        .order("position")
    : { data: null };

  return (
    <div className="rise-in flex flex-col gap-6">
      <div>
        <Link href="/partner" className="text-sm text-brand hover:underline">
          Back to dashboard
        </Link>
        <h1 className="mt-2 font-display text-3xl font-bold">
          {spa ? "Your spa" : "Add your spa"}
        </h1>
      </div>

      <section className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
        <SpaForm spa={spa} />
      </section>

      {spa && (
        <section className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">Photos</h2>
          <PhotoManager
            spaId={spa.id}
            photos={(photos ?? []).map((photo) => ({
              id: photo.id,
              url: supabase.storage.from("spa-photos").getPublicUrl(photo.storage_path).data
                .publicUrl,
            }))}
          />
        </section>
      )}
    </div>
  );
}
