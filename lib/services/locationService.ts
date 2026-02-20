/**
 * Location Service for handling geolocation, permissions, and distance calculations
 */

import { Location } from '@/lib/api/room';

export interface LocationPermissionStatus {
  granted: boolean;
  checked: boolean;
}

const LOCATION_PERMISSION_KEY = 'location_permission_granted';
const USER_LOCATION_KEY = 'user_current_location';
const ROOM_LOCATION_PREFIX = 'room_location_';

/**
 * Check if location permission has been granted for a specific user
 */
export const checkLocationPermission = (userId?: string): boolean => {
  if (typeof window === 'undefined') return false;
  const key = userId ? `${LOCATION_PERMISSION_KEY}_${userId}` : LOCATION_PERMISSION_KEY;
  return localStorage.getItem(key) === 'true';
};

/**
 * Grant location permission (store in localStorage)
 */
export const grantLocationPermission = (userId?: string): void => {
  if (typeof window === 'undefined') return;
  const key = userId ? `${LOCATION_PERMISSION_KEY}_${userId}` : LOCATION_PERMISSION_KEY;
  localStorage.setItem(key, 'true');
};

/**
 * Request and get user's current location using Geolocation API
 */
export const getCurrentLocation = (): Promise<Location> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  });
};

/**
 * Get user's cached location
 */
export const getCachedUserLocation = (): Location | null => {
  if (typeof window === 'undefined') return null;
  const cached = localStorage.getItem(USER_LOCATION_KEY);
  return cached ? JSON.parse(cached) : null;
};

/**
 * Cache user's location
 */
export const cacheUserLocation = (location: Location): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_LOCATION_KEY, JSON.stringify(location));
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Get Google Maps URL for routing between two locations
 */
export const getGoogleMapsUrl = (
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number
): string => {
  return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${startLat}%2C${startLon}%3B${endLat}%2C${endLon}`;
};

/**
 * Get cached room location
 */
export const getCachedRoomLocation = (roomId: string): Location | null => {
  if (typeof window === 'undefined') return null;
  const cached = localStorage.getItem(`${ROOM_LOCATION_PREFIX}${roomId}`);
  return cached ? JSON.parse(cached) : null;
};

/**
 * Cache room location
 */
export const cacheRoomLocation = (roomId: string, location: Location): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${ROOM_LOCATION_PREFIX}${roomId}`, JSON.stringify(location));
};

/**
 * Reverse geocode coordinates to address (requires Google Maps API)
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          "Accept": "application/json",
        },
      }
    );
    const data = await response.json();

    if (data && data.display_name) {
      return data.display_name;
    }
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  } catch (error) {
    console.error('Geocoding error:', error);
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
};

/**
 * Geocode address to coordinates (requires Google Maps API)
 */
export const geocodeAddress = async (address: string): Promise<Location | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(
        address
      )}`,
      {
        headers: {
          "Accept": "application/json",
        },
      }
    );
    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      const lat = Number(data[0].lat);
      const lng = Number(data[0].lon);
      return {
        latitude: lat,
        longitude: lng,
        address: data[0].display_name,
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

/**
 * Format distance for display
 */
export const formatDistance = (km: number): string => {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
};

/**
 * Estimate travel time (approximate: 40km/hour average)
 */
export const estimateTravelTime = (distanceKm: number): string => {
  const avgSpeed = 40; // km/h
  const minutes = Math.round((distanceKm / avgSpeed) * 60);

  if (minutes < 1) return '1min';
  if (minutes < 60) return `${minutes}min`;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
};
