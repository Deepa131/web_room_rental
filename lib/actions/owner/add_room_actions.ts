import { CreateRoomData, roomApi } from '@/lib/api/room';

// Actions for owner add room

export async function addRoom(data: CreateRoomData) {
  try {
    const response = await roomApi.createRoom(data);
    return {
      success: response.success,
      message: response.message || (response.success ? "Room added successfully" : "Failed to add room"),
      data: response.data,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to add room",
    };
  }
}
