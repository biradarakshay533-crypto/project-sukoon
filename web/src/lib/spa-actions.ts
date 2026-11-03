"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/lib/auth-actions";
import { createClient } from "@/lib/supabase/server";

const INDIAN_MOBILE = /^[6-9]\d{9}$/;

function text(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

export async function saveSpa(_state: FormState, formData: FormData): Promise<FormState> {
  const spaId = text(formData, "spa_id");
  const latitude = Number(text(formData, "latitude"));
  const longitude = Number(text(formData, "longitude"));
  const phone = text(formData, "phone");

  if (!INDIAN_MOBILE.test(phone)) {
    return { error: "Please enter a 10-digit mobile number." };
  }
  if (!latitude || !longitude || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    return { error: "Please add your spa's location so it can appear on the map." };
  }

  const fields = {
    name: text(formData, "name"),
    description: text(formData, "description"),
    address: text(formData, "address"),
    city: text(formData, "city"),
    phone,
    latitude,
    longitude,
    opening_hours: { open: text(formData, "open"), close: text(formData, "close") },
  };

  if (!fields.name || !fields.address || !fields.city) {
    return { error: "Please fill in the spa name, address and city." };
  }

  const supabase = await createClient();

  if (spaId) {
    const { data, error } = await supabase
      .from("spas")
      .update(fields)
      .eq("id", spaId)
      .select("id");

    if (error || !data?.length) {
      return { error: "We could not save your spa. Please try again." };
    }

    revalidatePath("/partner", "layout");
    return { success: "Your spa details are saved." };
  }

  const { error } = await supabase.from("spas").insert(fields);

  if (error) {
    return { error: "We could not create your spa. Please try again." };
  }

  revalidatePath("/partner", "layout");
  redirect("/partner/spa");
}

export async function recordPhoto(spaId: string, storagePath: string) {
  if (!storagePath.startsWith(`${spaId}/`)) {
    return { error: "This photo does not belong to your spa." };
  }

  const supabase = await createClient();
  const { count } = await supabase
    .from("spa_photos")
    .select("id", { count: "exact", head: true })
    .eq("spa_id", spaId);

  const { error } = await supabase
    .from("spa_photos")
    .insert({ spa_id: spaId, storage_path: storagePath, position: count ?? 0 });

  if (error) {
    return { error: "We could not save this photo. Please try again." };
  }

  revalidatePath("/partner", "layout");
  return {};
}

export async function deletePhoto(photoId: string) {
  const supabase = await createClient();
  const { data: photo } = await supabase
    .from("spa_photos")
    .select("storage_path")
    .eq("id", photoId)
    .single();

  if (!photo) {
    return { error: "We could not find this photo." };
  }

  await supabase.storage.from("spa-photos").remove([photo.storage_path]);
  await supabase.from("spa_photos").delete().eq("id", photoId);

  revalidatePath("/partner", "layout");
  return {};
}

export async function saveService(_state: FormState, formData: FormData): Promise<FormState> {
  const serviceId = text(formData, "service_id");
  const rupees = Number(text(formData, "price"));
  const duration = Number(text(formData, "duration_minutes"));

  if (!Number.isFinite(rupees) || rupees <= 0) {
    return { error: "Please enter a price above zero." };
  }
  if (!Number.isInteger(duration) || duration <= 0) {
    return { error: "Please enter the duration in minutes." };
  }

  const fields = {
    name: text(formData, "name"),
    description: text(formData, "description"),
    massage_type_id: text(formData, "massage_type_id") || null,
    duration_minutes: duration,
    price_paise: Math.round(rupees * 100),
    is_active: formData.get("is_active") === "on",
  };

  if (!fields.name) {
    return { error: "Please enter a service name." };
  }

  const supabase = await createClient();

  if (serviceId) {
    const { data, error } = await supabase
      .from("services")
      .update(fields)
      .eq("id", serviceId)
      .select("id");

    if (error || !data?.length) {
      return { error: "We could not save this service. Please try again." };
    }
  } else {
    const { error } = await supabase
      .from("services")
      .insert({ ...fields, spa_id: text(formData, "spa_id") });

    if (error) {
      return { error: "We could not add this service. Please try again." };
    }
  }

  revalidatePath("/partner", "layout");
  return { success: "Service saved." };
}

export async function deleteService(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("services").delete().eq("id", text(formData, "service_id"));
  revalidatePath("/partner", "layout");
}
