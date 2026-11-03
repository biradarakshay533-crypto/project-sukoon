"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { Point } from "@/lib/distance";

// A drawn pin, so the map does not depend on Leaflet's image files.
const spaPin = L.divIcon({
  className: "",
  html: '<span style="display:block;width:22px;height:22px;border-radius:50% 50% 50% 0;background:#2f5d50;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4);transform:rotate(-45deg)"></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 22],
  popupAnchor: [0, -22],
});

const youPin = L.divIcon({
  className: "",
  html: '<span style="display:block;width:16px;height:16px;border-radius:50%;background:#c8975a;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></span>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

type SpaMapProps = {
  center: Point;
  you?: Point | null;
  spas: { id: string; name: string; latitude: number; longitude: number; label?: string }[];
  zoom?: number;
  linkToSpa?: boolean;
};

export default function SpaMap({ center, you, spas, zoom = 13, linkToSpa = true }: SpaMapProps) {
  return (
    <MapContainer
      center={[center.latitude, center.longitude]}
      zoom={zoom}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {you && <Marker position={[you.latitude, you.longitude]} icon={youPin} />}
      {spas.map((spa) => (
        <Marker key={spa.id} position={[spa.latitude, spa.longitude]} icon={spaPin}>
          <Popup>
            <strong>{spa.name}</strong>
            {spa.label && <div>{spa.label}</div>}
            {linkToSpa && (
              <div>
                <Link href={`/spas/${spa.id}`}>View spa</Link>
              </div>
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
