"use server";
import { login, register } from "@/lib/api/auth"
import { LoginData, RegisterData } from "@/app/(auth)/schema"
import { setAuthToken, setUserData, clearAuthCookies } from "../cookie"
import { redirect } from "next/navigation";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";

export const handleRegister = async (data: RegisterData & {role: string}) => {
    try {
        const response = await register(data)
        if (response.success) {
            return {
                success: true,
                message: 'Registration successful',
                data: response.data
            }
        }
        return {
            success: false,
            message: response.message || 'Registration failed'
        }
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'Registration action failed' }
    }
}

export const handleLogin = async (data: LoginData) => {
    try {
        // Check if this is an admin login attempt
        if (data.email === ADMIN_EMAIL && data.password === ADMIN_PASSWORD) {
            // Try to register admin first (in case they don't exist)
            try {
                const registerResponse = await register({
                    fullName: "Admin",
                    email: ADMIN_EMAIL,
                    password: ADMIN_PASSWORD,
                    role: "admin"
                });
                console.log("Admin registration response:", registerResponse);
            } catch (error) {
                // Ignore error if admin already exists
                console.log("Admin may already exist, proceeding to login");
            }
            
            // Now login with admin credentials
            const response = await login(data);
            if (response.success) {
                await setAuthToken(response.token);
                await setUserData(response.data);
                return {
                    success: true,
                    message: "Admin login successful",
                    data: response.data,
                    token: response.token
                };
            }
            
            return {
                success: false,
                message: response.message || "Admin login failed"
            };
        }
        
        // Regular user login
        const response = await login(data)
        if (response.success) {
            await setAuthToken(response.token)
            await setUserData(response.data)
            return {
                success: true,
                message: 'Login successful',
                data: response.data,
                token: response.token
            }
        }
        return {
            success: false,
            message: response.message || 'Login failed'
        }
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'Login action failed' }
    }
}

export const handleLogout = async () => {
    await clearAuthCookies();
    return redirect('/login');
}