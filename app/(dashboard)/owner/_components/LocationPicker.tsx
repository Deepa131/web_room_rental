"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { MapPin, Loader2, ChevronDown } from "lucide-react";
import { Location } from "@/lib/api/room";
import {
  getCurrentLocation,
  checkLocationPermission,
  grantLocationPermission,
  reverseGeocode,
  geocodeAddress,
  cacheUserLocation,
  getCachedUserLocation,
  setLocationPermissionMode,
  shouldShowPermissionPrompt,
} from "@/lib/services/locationService";
import { toast } from "react-hot-toast";
import LocationPermissionModal from "./LocationPermissionModal";

const OsmMapPicker = dynamic(() => import("./OsmMapPicker"), {
  ssr: false,
});

interface LocationPickerProps {
  onLocationSelect: (location: Location, address: string) => void;
  defaultLocation?: Location;
  title?: string;
  userId?: string;
  askForPermission?: boolean; // Set to false to skip permission modal 
}

export default function LocationPicker({
  onLocationSelect,
  defaultLocation,
  title = "Select Location",
  userId,
  askForPermission = true,
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
  const [permissionGanted, setPermissionGranted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  
  // Use ref to track if already attempted auto-loading 
  const autoRequestedRef = useRef(false);

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

  const handleRequestLocation = useCallback(async () => {
    setLoading(true);
    const permissionToastId = toast.loading("Requesting location permission...");
    try {
      const location = await getCurrentLocation();
      setDraftLocation(location);
      cacheUserLocation(location);

      const address = await reverseGeocode(location.latitude, location.longitude);
      setDraftAddress(address);

      // Permission is already granted or mode is set from modal
      if (!checkLocationPermission(userId)) {
        grantLocationPermission(userId);
      }
      setPermissionGranted(true);

      toast.success("Location detected", { id: permissionToastId });
    } catch (error: any) {
      // Handle error from location service with better messages
      let message = "Could not access your location. You can still select location manually on the map.";
      
      if (error instanceof Error && error.message) {
        // Use the improved error message from locationService
        message = error.message;
      }
      
      toast.error(message, { id: permissionToastId });
      console.error("Location error:", error?.message || error);
    } finally {
      setLoading(false);
      setShowPermissionModal(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!isOpen) {
      autoRequestedRef.current = false;
      return;
    }

    // If permission modal is showing, wait for user response
    if (showPermissionModal) {
      return;
    }

    // If already attempted, don't try again
    if (autoRequestedRef.current) return;

    autoRequestedRef.current = true;

    // Get the actual permission prompt status
    const needsPermissionPrompt = shouldShowPermissionPrompt();

    // If should ask for permission AND need to show prompt, show modal FIRST
    if (askForPermission && needsPermissionPrompt) {
      setShowPermissionModal(true);
      return;
    }

    // After permission is handled, check for cached location
    const cached = getCachedUserLocation();
    if (cached) {
      setDraftLocation(cached);
      // Try to get address but don't block if it fails
      reverseGeocode(cached.latitude, cached.longitude)
        .then((address) => {
          if (address) setDraftAddress(address);
        })
      return;
    }

    // If should not ask for permission, try to request without modal
    if (!askForPermission) {
      handleRequestLocation();
      return;
    }

    // Otherwise request location with permission already granted
    handleRequestLocation();
  }, [isOpen, showPermissionModal, askForPermission, handleRequestLocation, userId]);

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

  const handlePermissionAlways = async () => {
    setLocationPermissionMode("always");
    setPermissionGranted(true);
    await handleRequestLocation();
  };

  const handlePermissionJustThisTime = async () => {
    setLocationPermissionMode("just_this_time");
    setPermissionGranted(true);
    await handleRequestLocation();
  };

  const handlePermissionCancel = () => {
    setShowPermissionModal(false);
    autoRequestedRef.current = false; // Allow retry if user opens map again
    setIsOpen(false);
  };

  const handleCancel = () => {
    setDraftLocation(confirmedLocation);
    setDraftAddress(confirmedAddress);
    setIsOpen(false);
    autoRequestedRef.current = false; // Allow retry if user opens map again
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
      const nextAddress = result.address || searchQuery.trim();
      setDraftLocation({
        latitude: result.latitude,
        longitude: result.longitude,
        address: nextAddress,
      });
      setDraftAddress(nextAddress);
    } catch (error: any) {
      setSearchError(error?.message || "Search failed.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="w-full">
      <LocationPermissionModal
        isOpen={showPermissionModal}
        loading={loading}
        onAlways={handlePermissionAlways}
        onJustThisTime={handlePermissionJustThisTime}
        onCancel={handlePermissionCancel}
      />

      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 cursor-pointer hover:border-blue-500 hover:ring-1 hover:ring-blue-500 transition-all flex items-center justify-between group"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <MapPin size={18} className="text-blue-500 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-700 truncate">
              {confirmedAddress || "Click to select location"}
            </p>
          </div>
        </div>
        <ChevronDown
          size={18}
          className="shrink-0 text-gray-400 group-hover:text-blue-500 transition-colors"
        />
      </div>

      {isOpen && !showPermissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />

          <div className="relative w-full max-w-2xl max-h-[90vh] rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
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

              {loading && (
                <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Loader2 size={18} className="animate-spin text-blue-600" />
                  <p className="text-sm text-blue-800">Detecting your location...</p>
                </div>
              )}

              {!loading && draftLocation && draftAddress && (
                <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <MapPin size={18} className="text-blue-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-800">Selected Location</p>
                    <p className="text-xs text-blue-700 truncate">{draftAddress}</p>
                  </div>
                </div>
              )}

              <div className="w-full h-80 min-h-80 rounded-lg border border-gray-300 overflow-hidden">
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
                className="px-6 py-2 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
