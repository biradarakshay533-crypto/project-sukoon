import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type SpaSummary = {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  isFeatured: boolean;
  photoUrl: string | null;
  massageTypeIds: string[];
  massageTypeNames: string[];
  lowestPricePaise: number | null;
  shortestMinutes: number | null;
};

export type MassageType = {
  id: string;
  name: string;
  imageUrl: string | null;
  spaCount: number;
};

type PhotoRow = { storage_path: string; position: number };
type ServiceRow = { massage_type_id: string | null; price_paise: number; duration_minutes: number };

function photoUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  path: string,
) {
  return supabase.storage.from("spa-photos").getPublicUrl(path).data.publicUrl;
}

function byPosition<T extends PhotoRow>(photos: T[]) {
  return [...photos].sort((a, b) => a.position - b.position);
}

// Approved spas with their first photo, massage types and lowest price.
// Security rules already hide unapproved spas and hidden services.
export async function getApprovedSpas() {
  await connection();
  const supabase = await createClient();

  // "*" keeps this working before and after home-setup.sql adds new columns.
  const [{ data: spas }, { data: types }, { data: settings }] = await Promise.all([
    supabase
      .from("spas")
      .select("*, spa_photos(storage_path, position), services(massage_type_id, price_paise, duration_minutes)")
      .eq("is_approved", true)
      .order("name"),
    supabase.from("massage_types").select("*").order("name"),
    supabase.from("settings").select().single(),
  ]);

  const typeNames = new Map((types ?? []).map((type) => [type.id as string, type.name as string]));

  const summaries: SpaSummary[] = (spas ?? []).map((spa) => {
    const photos = byPosition((spa.spa_photos ?? []) as PhotoRow[]);
    const services = (spa.services ?? []) as ServiceRow[];
    const typeIds = [
      ...new Set(services.map((service) => service.massage_type_id).filter((id) => id !== null)),
    ];

    return {
      id: spa.id,
      name: spa.name,
      address: spa.address,
      city: spa.city,
      latitude: spa.latitude,
      longitude: spa.longitude,
      isFeatured: spa.is_featured === true,
      photoUrl: photos[0] ? photoUrl(supabase, photos[0].storage_path) : null,
      massageTypeIds: typeIds,
      massageTypeNames: typeIds.map((id) => typeNames.get(id)).filter((name) => name !== undefined),
      lowestPricePaise: services.length
        ? Math.min(...services.map((service) => service.price_paise))
        : null,
      shortestMinutes: services.length
        ? Math.min(...services.map((service) => service.duration_minutes))
        : null,
    };
  });

  const massageTypes: MassageType[] = (types ?? []).map((type) => ({
    id: type.id,
    name: type.name,
    imageUrl: type.image_url ?? null,
    spaCount: summaries.filter((spa) => spa.massageTypeIds.includes(type.id)).length,
  }));

  return {
    spas: summaries,
    massageTypes,
    refund: {
      percent: settings?.refund_percent ?? 100,
      cutoffHours: settings?.refund_cutoff_hours ?? 6,
    },
  };
}

// One approved spa with all its photos and visible services.
export async function getSpa(id: string) {
  await connection();
  const supabase = await createClient();

  const { data: spa } = await supabase
    .from("spas")
    .select(
      "id, name, description, address, city, phone, latitude, longitude, opening_hours, spa_photos(id, storage_path, position), services(id, name, description, duration_minutes, price_paise, massage_types(name))",
    )
    .eq("id", id)
    .eq("is_approved", true)
    .maybeSingle();

  if (!spa) {
    return null;
  }

  const photos = byPosition((spa.spa_photos ?? []) as (PhotoRow & { id: string })[]);

  return {
    ...spa,
    photos: photos.map((photo) => ({ id: photo.id, url: photoUrl(supabase, photo.storage_path) })),
    services: [...(spa.services ?? [])].sort((a, b) => a.price_paise - b.price_paise),
  };
}
