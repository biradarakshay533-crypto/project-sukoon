"use server";

import { revalidatePath } from "next/cache";
import type { FormState } from "@/lib/auth-actions";
import { createClient } from "@/lib/supabase/server";

const PAN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const GSTIN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const IFSC = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const ACCOUNT = /^[0-9]{9,18}$/;
const KINDS = ["pan", "gst", "trade_licence", "shop_establishment", "id_proof", "bank_proof", "other"];

function text(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

// Upper case with spaces removed, for codes like PAN and IFSC.
function code(formData: FormData, name: string) {
  return text(formData, name).replace(/\s+/g, "").toUpperCase();
}

async function ownSpaId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  if (!userId) {
    return null;
  }
  const { data: spa } = await supabase
    .from("spas")
    .select("id")
    .eq("owner_id", userId)
    .order("created_at")
    .limit(1)
    .maybeSingle();
  return spa?.id ?? null;
}

export async function saveKyc(_state: FormState, formData: FormData): Promise<FormState> {
  const pan = code(formData, "pan");
  const gstRegistered = text(formData, "gst_registered") === "yes";
  const gstin = code(formData, "gstin");
  const ifsc = code(formData, "bank_ifsc");
  const account = code(formData, "bank_account_number");
  const accountAgain = code(formData, "bank_account_confirm");
  const expiry = text(formData, "trade_licence_expiry");

  if (pan && !PAN.test(pan)) {
    return { error: "PAN should look like ABCDE1234F (5 letters, 4 numbers, 1 letter)." };
  }
  if (gstRegistered && gstin && !GSTIN.test(gstin)) {
    return { error: "GSTIN should be 15 characters, like 29ABCDE1234F1Z5." };
  }
  if (gstRegistered && gstin && pan && gstin.slice(2, 12) !== pan) {
    return { error: "Your GSTIN should contain your PAN (characters 3 to 12). Please check both." };
  }
  if (ifsc && !IFSC.test(ifsc)) {
    return { error: "IFSC should be 11 characters, like SBIN0001234." };
  }
  if (account && !ACCOUNT.test(account)) {
    return { error: "The bank account number should be 9 to 18 digits." };
  }
  if (account !== accountAgain) {
    return { error: "The two bank account numbers do not match." };
  }
  if (expiry && Number.isNaN(Date.parse(expiry))) {
    return { error: "Please choose the trade licence expiry date." };
  }

  const supabase = await createClient();
  const spaId = await ownSpaId(supabase);
  if (!spaId) {
    return { error: "Please add your spa first." };
  }

  const fields = {
    legal_name: text(formData, "legal_name") || null,
    business_type: text(formData, "business_type") || null,
    owner_name: text(formData, "owner_name") || null,
    pan: pan || null,
    gst_registered: gstRegistered,
    gstin: gstRegistered ? gstin || null : null,
    trade_licence_number: text(formData, "trade_licence_number") || null,
    trade_licence_authority: text(formData, "trade_licence_authority") || null,
    trade_licence_expiry: expiry || null,
    shop_establishment_number: text(formData, "shop_establishment_number") || null,
    id_proof_type: text(formData, "id_proof_type") || null,
    bank_account_name: text(formData, "bank_account_name") || null,
    bank_account_number: account || null,
    bank_ifsc: ifsc || null,
    declaration_accepted: formData.get("declaration") === "on",
  };

  const { data: existing } = await supabase.from("spa_kyc").select("status").eq("spa_id", spaId).maybeSingle();

  if (existing && !["draft", "rejected"].includes(existing.status)) {
    return { error: "Your KYC has been submitted and can no longer be changed." };
  }

  const { error } = existing
    ? await supabase.from("spa_kyc").update(fields).eq("spa_id", spaId)
    : await supabase.from("spa_kyc").insert({ ...fields, spa_id: spaId });

  if (error) {
    return { error: "We could not save your details. Please try again." };
  }

  revalidatePath("/partner", "layout");

  if (text(formData, "intent") !== "submit") {
    return { success: "Saved. You can come back and finish later." };
  }

  const { error: submitError } = await supabase.rpc("submit_kyc", { target_spa: spaId });
  if (submitError) {
    return {
      error:
        submitError.code === "P0001"
          ? `Saved, but not submitted yet: ${submitError.message}.`
          : "Saved, but we could not submit it. Please try again.",
    };
  }

  revalidatePath("/partner", "layout");
  return { success: "Submitted! We will check your documents and approve your spa." };
}

export async function recordKycDocument(kind: string, storagePath: string, fileName: string) {
  const supabase = await createClient();
  const spaId = await ownSpaId(supabase);

  if (!spaId || !KINDS.includes(kind) || !storagePath.startsWith(`${spaId}/`)) {
    return { error: "This file does not belong to your spa." };
  }

  // Each document type keeps one file, except "other".
  if (kind !== "other") {
    const { data: old } = await supabase
      .from("kyc_documents")
      .select("id, storage_path")
      .eq("spa_id", spaId)
      .eq("kind", kind);
    if (old?.length) {
      await supabase.storage.from("spa-kyc").remove(old.map((doc) => doc.storage_path));
      await supabase.from("kyc_documents").delete().in("id", old.map((doc) => doc.id));
    }
  }

  const { error } = await supabase
    .from("kyc_documents")
    .insert({ spa_id: spaId, kind, storage_path: storagePath, file_name: fileName.slice(0, 120) });

  if (error) {
    return { error: "We could not save this file. Please try again." };
  }

  revalidatePath("/partner/kyc");
  return {};
}

export async function deleteKycDocument(documentId: string) {
  const supabase = await createClient();
  const { data: doc } = await supabase
    .from("kyc_documents")
    .select("storage_path")
    .eq("id", documentId)
    .maybeSingle();

  if (!doc) {
    return { error: "We could not find this file." };
  }

  const { data: removed } = await supabase.from("kyc_documents").delete().eq("id", documentId).select("id");
  if (!removed?.length) {
    return { error: "This file can no longer be removed." };
  }
  await supabase.storage.from("spa-kyc").remove([doc.storage_path]);

  revalidatePath("/partner/kyc");
  return {};
}
