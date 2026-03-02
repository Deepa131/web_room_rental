import { Room } from '@/lib/api/room';
import { roomApi } from '@/lib/api/room';

// Actions for owner edit room

export async function editRoom(id: string, data: Partial<Room>) {
  try {
    const response = await roomApi.updateRoom(id, data);
    return {
      success: response.success,
      message: response.message || (response.success ? "Room updated successfully" : "Failed to update room"),
      data: response.data,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update room",
    };
  }
}
