"use client";

import { useActionState, useRef, useState } from "react";
import { saveSpa } from "@/lib/spa-actions";
import {
  FormField,
  FormMessage,
  SubmitButton,
  TextAreaField,
} from "@/components/FormField";

type SpaFormProps = {
  spa: {
    id: string;
    name: string;
    description: string | null;
    address: string;
    city: string;
    phone: string | null;
    latitude: number | null;
    longitude: number | null;
    opening_hours: { open?: string; close?: string } | null;
  } | null;
};

export function SpaForm({ spa }: SpaFormProps) {
  const [state, action, pending] = useActionState(saveSpa, {});
  const [locationNote, setLocationNote] = useState("");
  const latitudeInput = useRef<HTMLInputElement>(null);
  const longitudeInput = useRef<HTMLInputElement>(null);

  function fillMyLocation() {
    if (!navigator.geolocation) {
      setLocationNote("Your browser cannot share its location.");
      return;
    }

    setLocationNote("Finding your location...");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        latitudeInput.current!.value = coords.latitude.toFixed(6);
        longitudeInput.current!.value = coords.longitude.toFixed(6);
        setLocationNote("Location added. Use this only when you are at the spa.");
      },
      () => setLocationNote("We could not get your location. Please type it in."),
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      {spa && <input type="hidden" name="spa_id" value={spa.id} />}
      <FormField label="Spa name" name="name" defaultValue={spa?.name} required />
      <TextAreaField
        label="About your spa"
        name="description"
        defaultValue={spa?.description ?? ""}
      />
      <TextAreaField label="Address" name="address" defaultValue={spa?.address} required />
      <FormField label="City" name="city" defaultValue={spa?.city ?? "Dharwad"} required />
      <FormField
        label="Spa mobile number"
        name="phone"
        type="tel"
        inputMode="numeric"
        maxLength={10}
        pattern="[6-9][0-9]{9}"
        title="A 10-digit mobile number"
        defaultValue={spa?.phone ?? ""}
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Opens at"
          name="open"
          type="time"
          defaultValue={spa?.opening_hours?.open ?? "10:00"}
          required
        />
        <FormField
          label="Closes at"
          name="close"
          type="time"
          defaultValue={spa?.opening_hours?.close ?? "21:00"}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          ref={latitudeInput}
          label="Latitude"
          name="latitude"
          type="number"
          step="any"
          min={-90}
          max={90}
          defaultValue={spa?.latitude ?? ""}
          required
        />
        <FormField
          ref={longitudeInput}
          label="Longitude"
          name="longitude"
          type="number"
          step="any"
          min={-180}
          max={180}
          defaultValue={spa?.longitude ?? ""}
          required
        />
      </div>
      <button
        type="button"
        onClick={fillMyLocation}
        className="self-start rounded-full border border-line bg-white px-4 py-2 text-sm font-medium transition hover:border-brand"
      >
        Use my current location
      </button>
      {locationNote && <p className="text-sm text-muted">{locationNote}</p>}
      <FormMessage error={state.error} success={state.success} />
      <SubmitButton
        pending={pending}
        label={spa ? "Save changes" : "Create my spa"}
        pendingLabel="Saving..."
      />
    </form>
  );
}
