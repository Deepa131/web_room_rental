"use client";

import { useEffect, useState, useCallback } from "react";
import { MapPin, Clock, Navigation, Loader2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Location } from "@/lib/api/room";
import {
  calculateDistance,
  formatDistance,
  estimateTravelTime,
  getCurrentLocation,
  checkLocationPermission,
  grantLocationPermission,
  getCachedUserLocation,
  cacheUserLocation,
} from "@/lib/services/locationService";
import { toast } from "react-hot-toast";

interface RouteDisplayProps {
  roomLocation: Location;
  roomAddress: string;
  userId?: string;
  onShowNavigation?: () => void;
}

export default function RouteDisplay({
  roomLocation,
  userId,
  onShowNavigation,
}: RouteDisplayProps) {
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [travelTime, setTravelTime] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [showRouteDetails, setShowRouteDetails] = useState(false);

  const calculateRoute = useCallback((loc: Location) => {
    const dist = calculateDistance(
      loc.latitude,
      loc.longitude,
      roomLocation.latitude,
      roomLocation.longitude
    );
    setDistance(dist);
    setTravelTime(estimateTravelTime(dist));
  }, [roomLocation.latitude, roomLocation.longitude]);

  // Check permission on mount
  useEffect(() => {
    const hasPermission = checkLocationPermission(userId);
    setPermissionGranted(hasPermission);

    // Try to get cached location
    const cached = getCachedUserLocation();
    if (cached) {
      setUserLocation(cached);
      calculateRoute(cached);
    }
  }, [userId, calculateRoute]);

  const handleRequestLocation = async () => {
    setLoading(true);
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
      cacheUserLocation(location);
      grantLocationPermission(userId);
      setPermissionGranted(true);
      calculateRoute(location);
      toast.success("Location accessed successfully");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Could not access your location. Please enable location permissions.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Permission Request */}
      {!permissionGranted ? (
        <button
          onClick={handleRequestLocation}
          disabled={loading}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Accessing location...</span>
            </>
          ) : (
            <>
              <MapPin size={16} />
              <span>Show distance & route</span>
            </>
          )}
        </button>
      ) : userLocation && distance !== null ? (
        <div className="space-y-3">
          {/* Compact Location Info with Icon */}
          <button
            onClick={() => setShowRouteDetails(!showRouteDetails)}
            className="w-full flex items-center justify-between text-sm group"
          >
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin size={16} className="text-blue-600" />
              <span className="font-medium">{formatDistance(distance)} away</span>
              <span className="text-gray-500">•</span>
              <Clock size={14} className="text-amber-600" />
              <span className="text-gray-600">{travelTime}</span>
            </div>
            <div className="text-blue-600 group-hover:text-blue-700 transition-colors">
              {showRouteDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </button>

          {/* Expandable Route Details */}
          {showRouteDetails && (
            <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
              {/* Distance and Time Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-200 bg-linear-to-br from-blue-50 to-white p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Navigation size={16} className="text-blue-600" />
                    <span className="text-sm font-semibold text-gray-900">
                      {formatDistance(distance)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">Distance from you</p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-linear-to-br from-amber-50 to-white p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Clock size={16} className="text-amber-600" />
                    <span className="text-sm font-semibold text-gray-900">{travelTime}</span>
                  </div>
                  <p className="text-xs text-gray-600">Travel time</p>
                </div>
              </div>

              {/* View Route Button - Opens Navigation in Main Area */}
              <button
                onClick={onShowNavigation}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-white bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transition-all text-sm"
              >
                <Navigation size={16} />
                View Route on Map
              </button>
            </div>
          )}
        </div>
      ) : permissionGranted ? (
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <AlertCircle size={16} />
          <span>Location data unavailable</span>
        </div>
      ) : null}
    </div>
  );
}
