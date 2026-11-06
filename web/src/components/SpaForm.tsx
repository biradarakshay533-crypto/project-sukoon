"use client";

import { useActionState, useState } from "react";
import { saveSpa } from "@/lib/spa-actions";
import {
  FormField,
  FormMessage,
  SubmitButton,
  TextAreaField,
} from "@/components/FormField";
import { LocationPickerLoader } from "@/components/SpaMapLoader";
import { DHARWAD } from "@/lib/distance";
import type { Point } from "@/lib/distance";

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
  const [point, setPoint] = useState<Point | null>(
    spa?.latitude != null && spa.longitude != null ? { latitude: spa.latitude, longitude: spa.longitude } : null,
  );

  function pick(spot: Point) {
    setPoint({ latitude: Number(spot.latitude.toFixed(6)), longitude: Number(spot.longitude.toFixed(6)) });
    setLocationNote("Pin moved. Save to keep this location.");
  }

  function fillMyLocation() {
    if (!navigator.geolocation) {
      setLocationNote("Your browser cannot share its location.");
      return;
    }

    setLocationNote("Finding your location...");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        pick({ latitude: coords.latitude, longitude: coords.longitude });
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
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Spa location on the map</p>
        <p className="-mt-1 text-xs text-muted">Tap the map or drag the red pin to your spa&apos;s front door.</p>
        <div className="h-72 overflow-hidden rounded-xl border border-line">
          <LocationPickerLoader point={point ?? DHARWAD} onPick={pick} />
        </div>
        <input type="hidden" name="latitude" value={point?.latitude ?? ""} />
        <input type="hidden" name="longitude" value={point?.longitude ?? ""} />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={fillMyLocation}
            className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-medium transition hover:border-brand hover:text-brand"
          >
            Use my current location
          </button>
          <span className="text-xs text-muted">
            {point ? `${point.latitude}, ${point.longitude}` : "No location chosen yet"}
          </span>
        </div>
      </div>
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
