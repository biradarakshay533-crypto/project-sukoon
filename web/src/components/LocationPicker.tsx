"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { Point } from "@/lib/distance";
import { PIN_RED } from "@/lib/maps";

export type LocationPickerProps = {
  point: Point;
  onPick: (point: Point) => void;
};

const pin = L.divIcon({
  className: "",
  html: `<span style="display:block;width:26px;height:26px;border-radius:50% 50% 50% 0;background:${PIN_RED};border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4);transform:rotate(-45deg)"></span>`,
  iconSize: [26, 26],
  iconAnchor: [13, 26],
});

// Taps on the map move the pin there.
function TapToMove({ onPick }: { onPick: LocationPickerProps["onPick"] }) {
  useMapEvents({
    click: (event) => onPick({ latitude: event.latlng.lat, longitude: event.latlng.lng }),
  });
  return null;
}

// Keeps the map centred when the pin moves from outside, such as "Use my location".
function FollowPin({ point }: { point: Point }) {
  const map = useMap();
  useEffect(() => {
    map.panTo([point.latitude, point.longitude]);
  }, [map, point.latitude, point.longitude]);
  return null;
}

// The free OpenStreetMap version of the pin picker.
export default function LocationPicker({ point, onPick }: LocationPickerProps) {
  return (
    <MapContainer center={[point.latitude, point.longitude]} zoom={16} scrollWheelZoom={false} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker
        position={[point.latitude, point.longitude]}
        icon={pin}
        draggable
        eventHandlers={{
          dragend: (event) => {
            const spot = (event.target as L.Marker).getLatLng();
            onPick({ latitude: spot.lat, longitude: spot.lng });
          },
        }}
      />
      <TapToMove onPick={onPick} />
      <FollowPin point={point} />
    </MapContainer>
  );
}
