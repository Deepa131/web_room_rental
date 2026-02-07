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
        GET_ALL: '/api/admin/users',
        GET_BY_ID: (id: string) => `/api/admin/users/${id}`,
        UPDATE: (id: string) => `/api/admin/users/${id}`,
        DELETE: (id: string) => `/api/admin/users/${id}`,
    }
}