"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { Icon, LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Location } from "@/lib/api/room";
import { MapPin, Navigation, Clock, Play, Square, Check, ChevronDown, ChevronUp } from "lucide-react";
import { calculateDistance, formatDistance, estimateTravelTime } from "@/lib/services/locationService";
import { toast } from "react-hot-toast";

interface NavigationContainerProps {
  userLocation: Location;
  roomLocation: Location;
  roomAddress: string;
}

// Fix Leaflet default marker icons
const createIcon = (color: string) => {
  return new Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

const userIcon = createIcon("blue");
const roomIcon = createIcon("red");

// Component to recenter map
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  
  return null;
}

export default function NavigationContainer({
  userLocation: initialUserLocation,
  roomLocation,
  roomAddress,
}: NavigationContainerProps) {
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location>(initialUserLocation);
  const [hasArrived, setHasArrived] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true); // Start expanded to show map
  const watchIdRef = useRef<number | null>(null);
  const hasArrivedRef = useRef(false);

  // Calculate distance 
  const distance = calculateDistance(
    currentLocation.latitude,
    currentLocation.longitude,
    roomLocation.latitude,
    roomLocation.longitude
  );

  // Check arrival in the watchPosition callback instead of effect
  useEffect(() => {
    if (distance < 0.05 && isNavigating && !hasArrivedRef.current) {
      hasArrivedRef.current = true;
      // Use setTimeout to avoid state update in effect
      setTimeout(() => {
        setHasArrived(true);
        setIsNavigating(false);
        toast.success("🎉 You have arrived at your destination!");
      }, 0);
    }
  }, [distance, isNavigating]);

  const startNavigation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsNavigating(true);
    setHasArrived(false);
    hasArrivedRef.current = false;
    toast.success("Navigation started! Your location will update in real-time.");

    // Watch position changes
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCurrentLocation(newLocation);
      },
      (error) => {
        console.error("Location tracking error:", error);
        toast.error("Unable to track your location. Please check permissions.");
        setIsNavigating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    watchIdRef.current = watchId;
  }, []);

  const stopNavigation = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsNavigating(false);
    toast("Navigation stopped");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const userPos: LatLngExpression = [currentLocation.latitude, currentLocation.longitude];
  const roomPos: LatLngExpression = [roomLocation.latitude, roomLocation.longitude];

  // Calculate center point
  const centerLat = (currentLocation.latitude + roomLocation.latitude) / 2;
  const centerLng = (currentLocation.longitude + roomLocation.longitude) / 2;
  const center: LatLngExpression = [centerLat, centerLng];

  // Calculate zoom
  const latDiff = Math.abs(currentLocation.latitude - roomLocation.latitude);
  const lngDiff = Math.abs(currentLocation.longitude - roomLocation.longitude);
  const maxDiff = Math.max(latDiff, lngDiff);
  
  let zoom = 13;
  if (maxDiff > 0.1) zoom = 11;
  if (maxDiff > 0.5) zoom = 9;
  if (maxDiff < 0.01) zoom = 15;

  const routeLine: LatLngExpression[] = [userPos, roomPos];
  const travelTime = estimateTravelTime(distance);

  return (
    <div className="w-full space-y-3 animate-in slide-in-from-top-2 duration-300">
      {/* Navigation Header */}
      <div className="rounded-2xl bg-linear-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Navigation size={20} />
            <h3 className="font-bold text-lg">Navigate to Room</h3>
          </div>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-blue-500/30">
          <div className="flex items-center gap-2">
            <Navigation size={16} />
            <span className="font-semibold">{formatDistance(distance)}</span>
            <span className="text-blue-100 text-sm">away</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span className="font-semibold">{travelTime}</span>
          </div>
          {hasArrived && (
            <div className="ml-auto flex items-center gap-1.5 px-3 py-1 bg-green-500 rounded-full text-sm font-bold">
              <Check size={14} />
              Arrived!
            </div>
          )}
        </div>
      </div>

      {/* Expandable Navigation Content */}
      {isExpanded && (
        <div className="rounded-2xl bg-white border-2 border-blue-200 shadow-xl overflow-hidden">
          {/* Map Container */}
          <div className="h-96 w-full relative">
            <MapContainer
              center={center}
              zoom={zoom}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%" }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {isNavigating && <MapUpdater center={[currentLocation.latitude, currentLocation.longitude]} />}

              {/* Route line */}
              <Polyline
                positions={routeLine}
                color="#3b82f6"
                weight={4}
                opacity={0.8}
                dashArray="10, 10"
              />

              {/* User location marker (updates in real-time) */}
              <Marker position={userPos} icon={userIcon}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold text-blue-700">
                      {isNavigating ? "Your Current Location (Live)" : "Your Location"}
                    </p>
                    <p className="text-xs text-gray-600">
                      {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                    </p>
                  </div>
                </Popup>
              </Marker>

              {/* Room location marker */}
              <Marker position={roomPos} icon={roomIcon}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold text-red-700">Destination</p>
                    <p className="text-xs text-gray-600">{roomAddress}</p>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>

          {/* Controls Footer */}
          <div className="bg-gray-50 border-t-2 border-gray-200 p-4 space-y-3">
            {/* Destination Info */}
            <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-200">
              <MapPin size={18} className="text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{roomAddress}</p>
              </div>
            </div>

            {/* Navigation Button */}
            {!isNavigating ? (
              <button
                onClick={startNavigation}
                disabled={hasArrived}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-green-600 to-green-700 text-white rounded-xl font-bold text-base hover:from-green-700 hover:to-green-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play size={18} />
                Start Navigation
              </button>
            ) : (
              <button
                onClick={stopNavigation}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-red-600 to-red-700 text-white rounded-xl font-bold text-base hover:from-red-700 hover:to-red-800 transition-all shadow-lg"
              >
                <Square size={18} />
                Stop Navigation
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
