export const API = {
    AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        UPDATE_PROFILE_PICTURE: '/api/auth/profile-picture',
        UPDATE_PROFILE: (id: string) => `/api/auth/${id}`,
    },
    USER: {
        GET_ALL: '/api/admin/users',
        GET_BY_ID: (id: string) => `/api/admin/users/${id}`,
        UPDATE: (id: string) => `/api/admin/users/${id}`,
        DELETE: (id: string) => `/api/admin/users/${id}`,
    }
}