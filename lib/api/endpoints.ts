export const API = {
    AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        FORGOT_PASSWORD: '/api/auth/forgot-password',
        RESET_PASSWORD: (token: string) => `/api/auth/reset-password/${token}`,
        UPDATE_PROFILE_PICTURE: '/api/auth/profile-picture',
        UPDATE_PROFILE: (id: string) => `/api/auth/${id}`,
    },
    USER: {
        CREATE: '/api/admin/users',
        GET_ALL: '/api/admin/users',
        GET_BY_ID: (id: string) => `/api/admin/users/${id}`,
        UPDATE: (id: string) => `/api/admin/users/${id}`,
        DELETE: (id: string) => `/api/admin/users/${id}`,
    },
    ROOM: {
        CREATE: '/api/rooms',
        GET_ALL: '/api/rooms',
        GET_BY_ID: (id: string) => `/api/rooms/${id}`,
        GET_BY_OWNER: (ownerId: string) => `/api/rooms/owner/${ownerId}`,
        UPDATE: (id: string) => `/api/rooms/${id}`,
        DELETE: (id: string) => `/api/rooms/${id}`,
        UPLOAD_IMAGE: '/api/rooms/upload-image',
        UPLOAD_VIDEO: '/api/rooms/upload-video',
        // Admin room management
        ADMIN_GET_ALL: '/api/admin/rooms',
        ADMIN_UPDATE_STATUS: (id: string) => `/api/admin/rooms/${id}/status`,
        ADMIN_DELETE: (id: string) => `/api/admin/rooms/${id}`,
    },
    ROOM_TYPE: {
        GET_ALL: '/api/room-types',
        GET_BY_ID: (id: string) => `/api/room-types/${id}`,
    },
    APPOINTMENT: {
        BOOK: '/api/appointments/book',
        GET_RENTER: (renterId: string) => `/api/appointments/renter/${renterId}`,
        GET_OWNER: (ownerId: string) => `/api/appointments/owner/${ownerId}`,
        GET_BY_ID: (id: string) => `/api/appointments/${id}`,
        UPDATE: (id: string) => `/api/appointments/${id}`,
        UPDATE_STATUS: (id: string) => `/api/appointments/${id}/status`,
        CANCEL: (id: string) => `/api/appointments/${id}`,
    }
}