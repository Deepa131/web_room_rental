export const API = {
    AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        UPDATE_PROFILE_PICTURE: '/api/auth/profile-picture',
        UPDATE_PROFILE: (id: string) => `/api/auth/${id}`,
    },
    USER: {
        GET_ALL: '/api/auth',
        GET_BY_ID: (id: string) => `/api/auth/${id}`,
        UPDATE: (id: string) => `/api/auth/${id}`,
        DELETE: (id: string) => `/api/auth/${id}`,
    }
}