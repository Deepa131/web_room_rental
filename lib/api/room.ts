import { API } from './endpoints';
import axios from './axios';

export interface RoomType {
    id: string;
    typeName: string;
    status: 'active' | 'inactive';
}

export interface Location {
    latitude: number;
    longitude: number;
    address?: string;
}

export interface Room {
    id: string;
    ownerId: string;
    ownerContactNumber: string;
    roomTitle: string;
    monthlyPrice: number;
    location: string;
    locationCoords?: Location;
    roomType: RoomType | string;
    description?: string;
    images: string[];
    videos: string[];
    isAvailable: boolean;
    approvalStatus: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    updatedAt: string;
}

export interface CreateRoomData {
    ownerContactNumber: string;
    roomTitle: string;
    monthlyPrice: number;
    location: string;
    locationCoords?: Location;
    roomType: string;
    description?: string;
    images: string[];
    videos: string[];
}

export const roomApi = {
    // Get all room types
    getRoomTypes: async () => {
        const response = await axios.get(API.ROOM_TYPE.GET_ALL);
        return response.data;
    },

    // Upload room image
    uploadImage: async (file: File) => {
        const formData = new FormData();
        formData.append('images', file);
        const response = await axios.post(API.ROOM.UPLOAD_IMAGE, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Upload room video
    uploadVideo: async (file: File) => {
        const formData = new FormData();
        formData.append('videos', file);
        const response = await axios.post(API.ROOM.UPLOAD_VIDEO, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Create room
    createRoom: async (data: CreateRoomData) => {
        const response = await axios.post(API.ROOM.CREATE, data);
        return response.data;
    },

    // Get rooms by owner
    getRoomsByOwner: async (ownerId: string) => {
        const response = await axios.get(API.ROOM.GET_BY_OWNER(ownerId));
        return response.data;
    },

    // Get all rooms (optional query params)
    getAllRooms: async (params?: Record<string, string | number | boolean>) => {
        const response = await axios.get(API.ROOM.GET_ALL, { params });
        return response.data;
    },

    // Get only available rooms
    getAvailableRooms: async () => {
        const response = await axios.get(API.ROOM.GET_ALL, { params: { isAvailable: true } });
        return response.data;
    },

    // Update room
    updateRoom: async (id: string, data: Partial<Room>) => {
        const response = await axios.put(API.ROOM.UPDATE(id), data);
        return response.data;
    },

    // Delete room
    deleteRoom: async (id: string) => {
        const response = await axios.delete(API.ROOM.DELETE(id));
        return response.data;
    },

    // Get room by ID
    getRoomById: async (id: string) => {
        const response = await axios.get(API.ROOM.GET_BY_ID(id));
        return response.data;
    },

    // ===== ADMIN FUNCTIONS =====
    // Get all rooms (admin view with filters)
    adminGetAllRooms: async (page = 1, limit = 10, filters?: { 
        approvalStatus?: string;
        isAvailable?: boolean;
        searchText?: string;
    }) => {
        const response = await axios.get(API.ROOM.ADMIN_GET_ALL, {
            params: {
                page,
                limit,
                ...filters,
            },
        });
        return response.data;
    },

    // Update room approval status (admin only)
    adminUpdateRoomStatus: async (
        roomId: string,
        approvalStatus: 'approved' | 'rejected' | 'archived',
        reason?: string
    ) => {
        const response = await axios.put(API.ROOM.ADMIN_UPDATE_STATUS(roomId), {
            approvalStatus,
            reason,
        });
        return response.data;
    },

    // Delete room (admin only)
    adminDeleteRoom: async (roomId: string) => {
        const response = await axios.delete(API.ROOM.ADMIN_DELETE(roomId));
        return response.data;
    },
};
