"use client";

import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

function MapEvents({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (event) => {
      onSelect(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

interface OsmMapPickerProps {
  center: [number, number];
  selectedLocation: { latitude: number; longitude: number } | null;
  onSelect: (lat: number, lng: number) => void;
  onDragEnd: (lat: number, lng: number) => void;
}

export default function OsmMapPicker({
  center,
  selectedLocation,
  onSelect,
  onDragEnd,
}: OsmMapPickerProps) {
  return (
    <MapContainer center={center} zoom={15} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater center={center} />
      <MapEvents onSelect={onSelect} />
      {selectedLocation && (
        <Marker
          position={[selectedLocation.latitude, selectedLocation.longitude]}
          draggable
          icon={markerIcon}
          eventHandlers={{
            dragend: (event) => {
              const target = event.target as L.Marker;
              const pos = target.getLatLng();
              onDragEnd(pos.lat, pos.lng);
            },
          }}
        />
      )}
    </MapContainer>
  );
}
