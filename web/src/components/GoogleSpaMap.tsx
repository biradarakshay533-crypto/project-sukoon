"use client";

import { APIProvider, AdvancedMarker, InfoWindow, Map } from "@vis.gl/react-google-maps";
import Link from "next/link";
import { useState } from "react";
import type { SpaMapProps } from "@/components/SpaMap";
import { GOOGLE_MAP_ID, GOOGLE_MAPS_KEY, PIN_RED, PIN_YOU } from "@/lib/maps";

// A Sukoonam pin: a red drop with a white dot.
export function SpaPin() {
  return (
    <svg width="30" height="40" viewBox="0 0 30 40" aria-hidden="true" style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,.35))" }}>
      <path d="M15 1C7.3 1 1 7.2 1 14.9 1 25.3 15 39 15 39s14-13.7 14-24.1C29 7.2 22.7 1 15 1Z" fill={PIN_RED} stroke="#fff" strokeWidth="2" />
      <circle cx="15" cy="15" r="5" fill="#fff" />
    </svg>
  );
}

export default function GoogleSpaMap({ center, you, spas, zoom = 13, linkToSpa = true }: SpaMapProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = spas.find((spa) => spa.id === openId);

  return (
    <APIProvider apiKey={GOOGLE_MAPS_KEY}>
      <Map
        className="h-full w-full"
        defaultCenter={{ lat: center.latitude, lng: center.longitude }}
        defaultZoom={zoom}
        mapId={GOOGLE_MAP_ID}
        gestureHandling="cooperative"
        clickableIcons={false}
        streetViewControl={false}
        mapTypeControl={false}
      >
        {you && (
          <AdvancedMarker position={{ lat: you.latitude, lng: you.longitude }} title="You are here">
            <span
              style={{ display: "block", width: 18, height: 18, borderRadius: "50%", background: PIN_YOU, border: "3px solid #fff", boxShadow: "0 0 0 6px rgba(37,99,235,.2)" }}
            />
          </AdvancedMarker>
        )}
        {spas.map((spa) => (
          <AdvancedMarker
            key={spa.id}
            position={{ lat: spa.latitude, lng: spa.longitude }}
            title={spa.name}
            onClick={() => setOpenId(spa.id)}
          >
            <SpaPin />
          </AdvancedMarker>
        ))}
        {open && (
          <InfoWindow
            position={{ lat: open.latitude, lng: open.longitude }}
            pixelOffset={[0, -40]}
            onCloseClick={() => setOpenId(null)}
            headerContent={<strong style={{ fontSize: 15 }}>{open.name}</strong>}
          >
            <div style={{ fontSize: 14, display: "flex", flexDirection: "column", gap: 6 }}>
              {open.label && <span>{open.label}</span>}
              {linkToSpa && (
                <Link href={`/spas/${open.id}`} style={{ color: PIN_RED, fontWeight: 600 }}>
                  View spa →
                </Link>
              )}
            </div>
          </InfoWindow>
        )}
      </Map>
    </APIProvider>
  );
}
