"use client";

import { useActionState, useState } from "react";
import type { ReactNode } from "react";
import { FormField, FormMessage, SelectField } from "@/components/FormField";
import { KycDocument } from "@/components/KycDocument";
import type { KycFile } from "@/components/KycDocument";
import { saveKyc } from "@/lib/kyc-actions";

export type KycRow = {
  status: string;
  legal_name: string | null;
  business_type: string | null;
  owner_name: string | null;
  pan: string | null;
  gst_registered: boolean;
  gstin: string | null;
  trade_licence_number: string | null;
  trade_licence_authority: string | null;
  trade_licence_expiry: string | null;
  shop_establishment_number: string | null;
  id_proof_type: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
  bank_ifsc: string | null;
  declaration_accepted: boolean;
};

type KycFormProps = {
  spaId: string;
  kyc: KycRow | null;
  files: Record<string, KycFile[]>;
  editable: boolean;
};

const BUSINESS_TYPES = [
  ["proprietorship", "Sole proprietorship"],
  ["partnership", "Partnership firm"],
  ["llp", "LLP"],
  ["private_limited", "Private limited company"],
  ["other", "Other"],
];

const ID_PROOFS = [
  ["aadhaar_masked", "Masked Aadhaar"],
  ["driving_licence", "Driving licence"],
  ["passport", "Passport"],
  ["voter_id", "Voter ID"],
];

function Section({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
      <h2 className="flex items-center gap-3 font-display text-lg font-semibold">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
          {number}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function KycForm({ spaId, kyc, files, editable }: KycFormProps) {
  const [state, action, pending] = useActionState(saveKyc, {});
  const [gst, setGst] = useState(kyc?.gst_registered ?? false);
  const doc = (kind: string) => files[kind] ?? [];
  const shared = { spaId, editable };

  return (
    <form action={action} className="flex flex-col gap-5">
      <fieldset disabled={!editable || pending} className="flex flex-col gap-5">
        <Section number={1} title="Business details">
          <FormField label="Legal business name" name="legal_name" defaultValue={kyc?.legal_name ?? ""} placeholder="As on your trade licence" />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField label="Type of business" name="business_type" defaultValue={kyc?.business_type ?? ""}>
              <option value="">Choose one</option>
              {BUSINESS_TYPES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </SelectField>
            <FormField label="Owner's full name" name="owner_name" defaultValue={kyc?.owner_name ?? ""} placeholder="As on the ID proof" />
          </div>
        </Section>

        <Section number={2} title="PAN">
          <FormField
            label="PAN of the business (or the owner, for a proprietorship)"
            name="pan"
            defaultValue={kyc?.pan ?? ""}
            placeholder="ABCDE1234F"
            maxLength={10}
            autoCapitalize="characters"
          />
          <KycDocument {...shared} kind="pan" label="PAN card" required files={doc("pan")} />
        </Section>

        <Section number={3} title="GST">
          <div className="flex flex-wrap gap-3 text-sm font-medium">
            {[
              [true, "GST registered"],
              [false, "Not GST registered"],
            ].map(([value, label]) => (
              <label
                key={String(value)}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-line px-4 py-2.5 has-checked:border-brand has-checked:bg-accent-soft"
              >
                <input
                  type="radio"
                  name="gst_registered"
                  value={value ? "yes" : "no"}
                  checked={gst === value}
                  onChange={() => setGst(value as boolean)}
                  className="accent-brand"
                />
                {label}
              </label>
            ))}
          </div>
          {gst ? (
            <>
              <FormField
                label="GSTIN"
                name="gstin"
                defaultValue={kyc?.gstin ?? ""}
                placeholder="29ABCDE1234F1Z5"
                maxLength={15}
                autoCapitalize="characters"
              />
              <KycDocument {...shared} kind="gst" label="GST registration certificate" required files={doc("gst")} />
            </>
          ) : (
            <p className="text-sm text-muted">
              Fine if your yearly turnover is below the GST limit. You can add GST later.
            </p>
          )}
        </Section>

        <Section number={4} title="Trade licence">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Trade licence number" name="trade_licence_number" defaultValue={kyc?.trade_licence_number ?? ""} />
            <FormField label="Valid until" name="trade_licence_expiry" type="date" defaultValue={kyc?.trade_licence_expiry ?? ""} />
          </div>
          <FormField
            label="Issued by"
            name="trade_licence_authority"
            defaultValue={kyc?.trade_licence_authority ?? "Hubballi-Dharwad Municipal Corporation"}
          />
          <KycDocument {...shared} kind="trade_licence" label="Trade licence" required files={doc("trade_licence")} />
        </Section>

        <Section number={5} title="Shops and establishments registration">
          <FormField
            label="Registration number (if you have one)"
            name="shop_establishment_number"
            defaultValue={kyc?.shop_establishment_number ?? ""}
          />
          <KycDocument
            {...shared}
            kind="shop_establishment"
            label="Registration certificate"
            hint="Under the Karnataka Shops and Commercial Establishments Act."
            files={doc("shop_establishment")}
          />
        </Section>

        <Section number={6} title="Owner ID proof">
          <SelectField label="ID proof" name="id_proof_type" defaultValue={kyc?.id_proof_type ?? ""}>
            <option value="">Choose one</option>
            {ID_PROOFS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </SelectField>
          <KycDocument
            {...shared}
            kind="id_proof"
            label="ID proof (front and back in one file)"
            hint="For Aadhaar, please upload a masked Aadhaar, which shows only the last 4 digits. You can download it from myaadhaar.uidai.gov.in."
            required
            files={doc("id_proof")}
          />
        </Section>

        <Section number={7} title="Bank account for payouts">
          <p className="-mt-2 text-sm text-muted">Your booking money is sent to this account.</p>
          <FormField label="Account holder name" name="bank_account_name" defaultValue={kyc?.bank_account_name ?? ""} />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Account number"
              name="bank_account_number"
              defaultValue={kyc?.bank_account_number ?? ""}
              inputMode="numeric"
              autoComplete="off"
            />
            <FormField
              label="Account number again"
              name="bank_account_confirm"
              defaultValue={kyc?.bank_account_number ?? ""}
              inputMode="numeric"
              autoComplete="off"
            />
          </div>
          <FormField
            label="IFSC"
            name="bank_ifsc"
            defaultValue={kyc?.bank_ifsc ?? ""}
            placeholder="SBIN0001234"
            maxLength={11}
            autoCapitalize="characters"
          />
          <KycDocument {...shared} kind="bank_proof" label="Cancelled cheque or bank passbook" required files={doc("bank_proof")} />
        </Section>

        <Section number={8} title="Other licences (optional)">
          <KycDocument
            {...shared}
            kind="other"
            label="Other documents"
            hint="For example a fire safety NOC, police NOC or therapist certificates."
            files={doc("other")}
            multiple
          />
        </Section>

        <label className="flex items-start gap-3 rounded-2xl border border-line bg-white p-5 text-sm">
          <input
            type="checkbox"
            name="declaration"
            defaultChecked={kyc?.declaration_accepted ?? false}
            className="mt-0.5 size-5 shrink-0 accent-brand"
          />
          <span>
            I confirm that these details and documents are true, that my spa holds the licences needed to operate
            legally, and that I will tell Sukoonam if any of them change or expire.
          </span>
        </label>
      </fieldset>

      <FormMessage error={state.error} success={state.success} />

      {editable && (
        <div className="sticky bottom-3 flex gap-3 rounded-2xl border border-line bg-white/95 p-3 shadow-lg backdrop-blur">
          <button
            type="submit"
            name="intent"
            value="save"
            disabled={pending}
            className="flex-1 rounded-lg border-2 border-line px-4 py-3 font-semibold transition hover:border-brand hover:text-brand disabled:opacity-50"
          >
            {pending ? "Saving..." : "Save draft"}
          </button>
          <button
            type="submit"
            name="intent"
            value="submit"
            disabled={pending}
            className="flex-1 rounded-lg bg-brand px-4 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
          >
            Submit for review
          </button>
        </div>
      )}
    </form>
  );
}
