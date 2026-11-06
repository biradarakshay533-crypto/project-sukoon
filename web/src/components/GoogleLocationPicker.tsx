"use client";

import { APIProvider, AdvancedMarker, Map, useMap } from "@vis.gl/react-google-maps";
import { useEffect } from "react";
import { SpaPin } from "@/components/GoogleSpaMap";
import type { LocationPickerProps } from "@/components/LocationPicker";
import type { Point } from "@/lib/distance";
import { GOOGLE_MAP_ID, GOOGLE_MAPS_KEY } from "@/lib/maps";

// Keeps the map centred when the pin moves from outside, such as "Use my location".
function FollowPin({ point }: { point: Point }) {
  const map = useMap();
  useEffect(() => {
    map?.panTo({ lat: point.latitude, lng: point.longitude });
  }, [map, point.latitude, point.longitude]);
  return null;
}

// Spa owners tap the map or drag the pin to the spa's front door.
export default function GoogleLocationPicker({ point, onPick }: LocationPickerProps) {
  return (
    <APIProvider apiKey={GOOGLE_MAPS_KEY}>
      <Map
        className="h-full w-full"
        defaultCenter={{ lat: point.latitude, lng: point.longitude }}
        defaultZoom={17}
        mapId={GOOGLE_MAP_ID}
        gestureHandling="greedy"
        clickableIcons={false}
        streetViewControl={false}
        mapTypeControl={false}
        onClick={(event) => {
          const spot = event.detail.latLng;
          if (spot) {
            onPick({ latitude: spot.lat, longitude: spot.lng });
          }
        }}
      >
        <AdvancedMarker
          position={{ lat: point.latitude, lng: point.longitude }}
          draggable
          onDragEnd={(event) => {
            const spot = event.latLng;
            if (spot) {
              onPick({ latitude: spot.lat(), longitude: spot.lng() });
            }
          }}
        >
          <SpaPin />
        </AdvancedMarker>
        <FollowPin point={point} />
      </Map>
    </APIProvider>
  );
}
