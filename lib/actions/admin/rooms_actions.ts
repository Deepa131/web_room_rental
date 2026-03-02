import { roomApi, Room, RoomType } from "@/lib/api/room";

export async function fetchAdminRooms(
  page = 1,
  limit = 10,
  filters?: {
    approvalStatus?: string;
    isAvailable?: boolean;
    searchText?: string;
  }
) {
  try {
    const response = await roomApi.adminGetAllRooms(page, limit, filters);
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

export async function fetchAdminRoomById(roomId: string) {
  try {
    const response = await roomApi.getRoomById(roomId);
    return {
      success: response.success,
      message: response.message || "Room fetched successfully",
      data: response.data,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch room",
    };
  }
}

export async function fetchAdminActiveRoomTypes() {
  try {
    const response = await roomApi.getRoomTypes();
    if (!response?.success) {
      return {
        success: false,
        message: response.message || "Failed to fetch room types",
      };
    }

    const activeTypes = (response.data || []).filter(
      (roomType: RoomType) => roomType.status === "active"
    );

    return {
      success: true,
      message: "Active room types fetched successfully",
      data: activeTypes,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch room types",
    };
  }
}

export async function uploadAdminRoomImage(file: File) {
  try {
    const response = await roomApi.uploadImage(file);
    return {
      success: response.success,
      message: response.message || (response.success ? "Image uploaded successfully" : "Failed to upload image"),
      data: response.data,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to upload image",
    };
  }
}

export async function uploadAdminRoomVideo(file: File) {
  try {
    const response = await roomApi.uploadVideo(file);
    return {
      success: response.success,
      message: response.message || (response.success ? "Video uploaded successfully" : "Failed to upload video"),
      data: response.data,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to upload video",
    };
  }
}

export async function updateAdminRoom(roomId: string, data: Partial<Room>) {
  try {
    const response = await roomApi.updateRoom(roomId, data);
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

export async function deleteAdminRoom(roomId: string) {
  try {
    const response = await roomApi.adminDeleteRoom(roomId);
    return {
      success: response.success,
      message: response.message || (response.success ? "Room deleted successfully" : "Failed to delete room"),
      data: response.data,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete room",
    };
  }
}

export function getAdminRoomImageUrl(imagePath: string) {
  if (!imagePath) return "/placeholder-room.jpg";
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

  if (!imagePath.startsWith("/public/") && !imagePath.startsWith("http")) {
    return `${apiBaseUrl}/public/room_images/${imagePath}`;
  }

  if (!imagePath.startsWith("http")) {
    return `${apiBaseUrl}${imagePath}`;
  }

  return imagePath;
}

export function getAdminRoomVideoUrl(videoPath: string) {
  if (!videoPath) return "";
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

  if (!videoPath.startsWith("/public/") && !videoPath.startsWith("http")) {
    return `${apiBaseUrl}/public/room_videos/${videoPath}`;
  }

  if (!videoPath.startsWith("http")) {
    return `${apiBaseUrl}${videoPath}`;
  }

  return videoPath;
}
