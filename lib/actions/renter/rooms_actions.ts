// Actions for renter rooms

import { roomApi } from '@/lib/api/room';

export async function fetchRenterRooms() {
  try {
    const response = await roomApi.getAllRooms();
    return {
      success: response.success,
      message: response.message || "Rooms fetched successfully",
      data: response.data,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch rooms",
    };
  }
}
