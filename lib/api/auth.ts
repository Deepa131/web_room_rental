import { LoginData, RegisterData } from "@/app/(auth)/schema"
import axios from "./axios"
import { API } from "./endpoints"


export const register = async (registerData: RegisterData) => {
    try {
        const response = await axios.post(API.AUTH.REGISTER, registerData)
        return response.data
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message || error.message || 'Registration failed')
    }
}

export const login = async (loginData: LoginData) => {
    try {
        const response = await axios.post(API.AUTH.LOGIN, loginData)
        return response.data
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message || error.message || 'Login failed')
    }
}

export const updateProfilePicture = async (formData: FormData) => {
    try {
        const response = await axios.put(API.AUTH.UPDATE_PROFILE_PICTURE, formData)
        return response.data
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message || error.message || 'Profile picture update failed')
    }
}

export const updateProfile = async (userId: string, formData: FormData) => {
    try {
        const response = await axios.put(API.AUTH.UPDATE_PROFILE(userId), formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        })
        return response.data
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message || error.message || 'Profile update failed')
    }
}

export const createUser = async (formData: FormData) => {
    try {
        const response = await axios.post(API.AUTH.UPDATE_PROFILE(''), formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        })
        return response.data
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message || error.message || 'User creation failed')
    }
}

export const getAllUsers = async () => {
    try {
        const response = await axios.get(API.USER.GET_ALL)
        return response.data
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch users')
    }
}

export const getUserById = async (id: string) => {
    try {
        const response = await axios.get(API.USER.GET_BY_ID(id))
        return response.data
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch user')
    }
}

export const updateUser = async (id: string, formData: FormData) => {
    try {
        const response = await axios.put(API.USER.UPDATE(id), formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        })
        return response.data
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message || error.message || 'User update failed')
    }
}

export const deleteUser = async (id: string) => {
    try {
        const response = await axios.delete(API.USER.DELETE(id))
        return response.data
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message || error.message || 'User deletion failed')
    }
}