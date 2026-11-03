import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/DashboardShell";
import { ServiceForm } from "@/components/ServiceForm";
import { formatRupees } from "@/lib/format";
import { getPartnerContext } from "@/lib/partner";
import { deleteService } from "@/lib/spa-actions";

export const metadata: Metadata = { title: "My services | Sukoonam" };

export default function PartnerServicesPage() {
  return (
    <DashboardShell>
      <ServiceManager />
    </DashboardShell>
  );
}

async function ServiceManager() {
  const { supabase, spa } = await getPartnerContext();

  if (!spa) {
    redirect("/partner/spa");
  }

  const [{ data: massageTypes }, { data: services }] = await Promise.all([
    supabase.from("massage_types").select("id, name").order("name"),
    supabase.from("services").select().eq("spa_id", spa.id).order("created_at"),
  ]);

  return (
    <div className="rise-in flex flex-col gap-6">
      <div>
        <Link href="/partner" className="text-sm text-brand hover:underline">
          Back to dashboard
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Your services</h1>
      </div>

      {services?.map((service) => (
        <details
          key={service.id}
          className="rounded-3xl border border-line bg-card p-6 shadow-sm"
        >
          <summary className="flex cursor-pointer items-center justify-between gap-4">
            <span>
              <span className="block font-semibold">{service.name}</span>
              <span className="text-sm text-muted">
                {service.duration_minutes} min
                {!service.is_active && " · Hidden from customers"}
              </span>
            </span>
            <span className="font-semibold">{formatRupees(service.price_paise)}</span>
          </summary>
          <div className="mt-6 flex flex-col gap-4">
            <ServiceForm spaId={spa.id} massageTypes={massageTypes ?? []} service={service} />
            <form action={deleteService}>
              <input type="hidden" name="service_id" value={service.id} />
              <button type="submit" className="text-sm text-red-700 hover:underline">
                Delete this service
              </button>
            </form>
          </div>
        </details>
      ))}

      <section className="rounded-3xl border border-line bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Add a service</h2>
        <ServiceForm spaId={spa.id} massageTypes={massageTypes ?? []} />
      </section>
    </div>
  );
}
