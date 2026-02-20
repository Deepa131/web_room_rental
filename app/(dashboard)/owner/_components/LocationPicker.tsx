"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Loader2, Zap, ChevronDown } from "lucide-react";
import { Location } from "@/lib/api/room";
import {
  getCurrentLocation,
  checkLocationPermission,
  grantLocationPermission,
  reverseGeocode,
  geocodeAddress,
  cacheUserLocation,
  getCachedUserLocation,
} from "@/lib/services/locationService";
import { toast } from "react-hot-toast";

const OsmMapPicker = dynamic(() => import("./OsmMapPicker"), {
  ssr: false,
});

interface LocationPickerProps {
  onLocationSelect: (location: Location, address: string) => void;
  defaultLocation?: Location;
  title?: string;
  userId?: string;
}

export default function LocationPicker({
  onLocationSelect,
  defaultLocation,
  title = "Select Location",
  userId,
}: LocationPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmedLocation, setConfirmedLocation] = useState<Location | null>(
    defaultLocation || null
  );
  const [confirmedAddress, setConfirmedAddress] = useState<string>(
    defaultLocation?.address || ""
  );
  const [draftLocation, setDraftLocation] = useState<Location | null>(
    defaultLocation || null
  );
  const [draftAddress, setDraftAddress] = useState<string>(
    defaultLocation?.address || ""
  );
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [autoRequested, setAutoRequested] = useState(false);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);

  const defaultCenter: [number, number] = useMemo(() => {
    if (draftLocation) {
      return [draftLocation.latitude, draftLocation.longitude];
    }
    return [27.7172, 85.324];
  }, [draftLocation]);

  useEffect(() => {
    const hasPermission = checkLocationPermission(userId);
    setPermissionGranted(hasPermission);
  }, [userId]);

  useEffect(() => {
    if (!isOpen) return;
    if (draftLocation && !draftAddress) {
      reverseGeocode(draftLocation.latitude, draftLocation.longitude)
        .then((address) => setDraftAddress(address))
        .catch(() => null);
    }
  }, [isOpen, draftLocation, draftAddress]);

  useEffect(() => {
    if (!defaultLocation) return;
    setConfirmedLocation(defaultLocation);
    setDraftLocation(defaultLocation);
    if (defaultLocation.address) {
      setConfirmedAddress(defaultLocation.address);
      setDraftAddress(defaultLocation.address);
    }
  }, [defaultLocation]);

  useEffect(() => {
    if (!isOpen) {
      setAutoRequested(false);
      return;
    }
    if (autoRequested) return;

    setAutoRequested(true);

    const cached = getCachedUserLocation();
    if (cached) {
      setDraftLocation(cached);
      reverseGeocode(cached.latitude, cached.longitude)
        .then((address) => setDraftAddress(address))
        .catch(() => null);
      return;
    }

    handleRequestLocation();
  }, [isOpen, autoRequested]);

  const handleRequestLocation = async () => {
    setLoading(true);
    setLocationNotice(null);
    try {
      const location = await getCurrentLocation();
      setDraftLocation(location);
      cacheUserLocation(location);

      const address = await reverseGeocode(location.latitude, location.longitude);
      setDraftAddress(address);

      grantLocationPermission(userId);
      setPermissionGranted(true);

      toast.success("Location updated");
    } catch (error: any) {
      const code = typeof error?.code === "number" ? error.code : null;
      const message =
        code === 1
          ? "Location permission denied. Please allow location access in your browser."
          : code === 2
          ? "Location is unavailable. Please turn on GPS/location services."
          : code === 3
          ? "Location request timed out. Try again."
          : "Could not access your location. Please ensure location permissions are enabled.";
      setLocationNotice(message);
      toast.error(message);
      console.error("Location error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!draftLocation) {
      toast.error("Please select a location");
      return;
    }

    let address = draftAddress;
    if (!address) {
      address = await reverseGeocode(draftLocation.latitude, draftLocation.longitude);
      setDraftAddress(address);
    }

    setConfirmedLocation(draftLocation);
    setConfirmedAddress(address);
    onLocationSelect(draftLocation, address);
    setIsOpen(false);
    toast.success("Location confirmed");
  };

  const handleCancel = () => {
    setDraftLocation(confirmedLocation);
    setDraftAddress(confirmedAddress);
    setIsOpen(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchError("Enter a location to search.");
      return;
    }

    setSearchError(null);
    setSearching(true);
    try {
      const result = await geocodeAddress(searchQuery.trim());
      if (!result) {
        setSearchError("No results found.");
        return;
      }
      setSearchError(null);
      setSelectedLocation({ latitude: result.latitude, longitude: result.longitude });
      setSelectedAddress(result.address || searchQuery.trim());
    } catch (error: any) {
      setSearchError(error?.message || "Search failed.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="w-full">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 cursor-pointer hover:border-blue-500 hover:ring-1 hover:ring-blue-500 transition-all flex items-center justify-between group"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <MapPin size={18} className="text-blue-500 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-700 truncate">
              {confirmedAddress || "Click to select location"}
            </p>
          </div>
        </div>
        <ChevronDown
          size={18}
          className="flex-shrink-0 text-gray-400 group-hover:text-blue-500 transition-colors"
        />
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />

          <div className="relative w-full max-w-2xl max-h-[90vh] rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <MapPin size={20} />
                {title}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-blue-700 p-1 rounded transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3 p-4 flex-1 overflow-auto">
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    type="text"
                    placeholder="Search for an address..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={searching}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
                  >
                    {searching ? "Searching..." : "Search"}
                  </button>
                </div>
                {searchError && (
                  <p className="text-xs text-red-600">{searchError}</p>
                )}
              </div>

              {locationNotice && (
                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  {locationNotice}
                </div>
              )}

              {!permissionGranted && (
                <button
                  onClick={handleRequestLocation}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Getting your location...
                    </>
                  ) : (
                    <>
                      <Zap size={18} />
                      Use My Current Location
                    </>
                  )}
                </button>
              )}

              {permissionGranted && draftLocation && draftAddress && (
                <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                  <MapPin size={18} className="text-green-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-800">Current location tracked</p>
                    <p className="text-xs text-green-700 truncate">{draftAddress}</p>
                  </div>
                </div>
              )}

              <div className="w-full h-80 min-h-[320px] rounded-lg border border-gray-300 overflow-hidden">
                <OsmMapPicker
                  center={defaultCenter}
                  selectedLocation={draftLocation}
                  onSelect={async (lat, lng) => {
                    const loc = { latitude: lat, longitude: lng };
                    setDraftLocation(loc);
                    const address = await reverseGeocode(lat, lng);
                    setDraftAddress(address);
                  }}
                  onDragEnd={async (lat, lng) => {
                    const loc = { latitude: lat, longitude: lng };
                    setDraftLocation(loc);
                    const address = await reverseGeocode(lat, lng);
                    setDraftAddress(address);
                  }}
                />
              </div>

              <p className="text-xs text-gray-500 text-center">
                Click on the map or drag the marker to update the location
              </p>
            </div>

            <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex gap-3 justify-end">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!draftLocation}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
