import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SpaBrowser } from "@/components/SpaBrowser";
import { getApprovedSpas } from "@/lib/spas";

export const metadata: Metadata = { title: "Find a spa | Sukoonam" };

export default function SpasPage({ searchParams }: PageProps<"/spas">) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 pt-8 pb-16">
        <div className="rise-in">
          <h1 className="font-display text-4xl font-semibold">Find a spa</h1>
          <p className="mt-1 text-muted">Choose a massage and book a spa near you.</p>
        </div>
        <Suspense fallback={<p className="text-muted">Loading spas...</p>}>
          <SpaList searchParams={searchParams} />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}

async function SpaList({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { q, type, near, within } = await searchParams;
  const radius = Number(within);
  const { spas, massageTypes } = await getApprovedSpas();
  // "type" may be a massage type's id or its name.
  const match = typeof type === "string" ? massageTypes.find((t) => t.id === type || t.name === type) : null;

  return (
    <SpaBrowser
      spas={spas}
      massageTypes={massageTypes}
      initialQuery={typeof q === "string" ? q : ""}
      initialTypeId={match?.id ?? null}
      initialRadius={[1, 3, 5, 10].includes(radius) ? radius : null}
      startNearMe={near === "1" || [1, 3, 5, 10].includes(radius)}
    />
  );
}
