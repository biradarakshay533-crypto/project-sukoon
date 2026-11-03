import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SpaMapLoader } from "@/components/SpaMapLoader";
import { formatRupees } from "@/lib/format";
import { getSpa } from "@/lib/spas";

export const metadata: Metadata = { title: "Spa | Sukoonam" };

export default function SpaPage({ params }: PageProps<"/spas/[id]">) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 pt-2 pb-10">
        <Suspense fallback={<p className="text-muted">Loading spa...</p>}>
          <SpaDetails params={params} />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}

async function SpaDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const spa = await getSpa(id);

  if (!spa) {
    notFound();
  }

  const hours = spa.opening_hours as { open?: string; close?: string } | null;

  return (
    <div className="rise-in flex flex-col gap-6">
      <Link href="/spas" className="text-sm text-brand hover:underline">
        All spas
      </Link>

      {spa.photos.length > 0 && (
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1">
          {spa.photos.map((photo, index) => (
            <div
              key={photo.id}
              className="relative aspect-[4/3] w-[85%] shrink-0 snap-center overflow-hidden rounded-3xl sm:w-[60%]"
            >
              <Image
                src={photo.url}
                alt={`${spa.name} photo ${index + 1}`}
                fill
                sizes="(min-width: 640px) 60vw, 85vw"
                priority={index === 0}
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <div>
        <h1 className="font-display text-4xl font-semibold tracking-tight">{spa.name}</h1>
        <p className="mt-1 text-muted">
          {spa.address}, {spa.city}
        </p>
        {hours?.open && hours.close && (
          <p className="mt-1 text-sm text-muted">
            Open {hours.open} to {hours.close}
          </p>
        )}
      </div>

      {spa.description && <p className="leading-relaxed">{spa.description}</p>}

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Services</h2>
        {spa.services.length === 0 && (
          <p className="text-muted">This spa has not listed its services yet.</p>
        )}
        {spa.services.map((service) => {
          const type = service.massage_types as unknown as { name: string } | null;
          return (
            <div
              key={service.id}
              className="flex items-start justify-between gap-4 rounded-3xl border border-line bg-card p-5 shadow-sm"
            >
              <div>
                <p className="font-semibold">{service.name}</p>
                <p className="text-sm text-muted">
                  {[type?.name, `${service.duration_minutes} min`].filter(Boolean).join(" · ")}
                </p>
                {service.description && <p className="mt-2 text-sm">{service.description}</p>}
              </div>
              <p className="shrink-0 font-semibold">{formatRupees(service.price_paise)}</p>
            </div>
          );
        })}
        <p className="rounded-2xl bg-brand/10 px-4 py-3 text-sm text-brand-dark">
          Online booking requests are coming soon.
        </p>
      </section>

      {spa.latitude !== null && spa.longitude !== null && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">Location</h2>
          <div className="h-64 overflow-hidden rounded-3xl border border-line">
            <SpaMapLoader
              center={{ latitude: spa.latitude, longitude: spa.longitude }}
              zoom={15}
              linkToSpa={false}
              spas={[
                { id: spa.id, name: spa.name, latitude: spa.latitude, longitude: spa.longitude },
              ]}
            />
          </div>
          <a
            href={`https://www.openstreetmap.org/?mlat=${spa.latitude}&mlon=${spa.longitude}#map=17/${spa.latitude}/${spa.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-brand hover:underline"
          >
            Open in a full map
          </a>
        </section>
      )}
    </div>
  );
}
