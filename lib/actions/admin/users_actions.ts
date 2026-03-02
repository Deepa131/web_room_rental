import { createUser, deleteUser, getAllUsers, getUserById, updateUser } from "@/lib/api/auth";

export async function fetchAdminUsers(page = 1, limit = 10) {
  try {
    const response = await getAllUsers(page, limit);
    return {
      success: response.success,
      message: response.message || "Users fetched successfully",
      data: response.data,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch users",
    };
  }
}

export async function fetchAdminUserById(userId: string) {
  try {
    const response = await getUserById(userId);
    return {
      success: response.success,
      message: response.message || "User fetched successfully",
      data: response.data,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch user",
    };
  }
}

export async function createAdminUser(formData: FormData) {
  try {
    const response = await createUser(formData);
    return {
      success: response.success,
      message: response.message || (response.success ? "User created successfully" : "Failed to create user"),
      data: response.data,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create user",
    };
  }
}

export async function updateAdminUser(userId: string, formData: FormData) {
  try {
    const response = await updateUser(userId, formData);
    return {
      success: response.success,
      message: response.message || (response.success ? "User updated successfully" : "Failed to update user"),
      data: response.data,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update user",
    };
  }
}

export async function deleteAdminUser(userId: string) {
  try {
    const response = await deleteUser(userId);
    return {
      success: response.success,
      message: response.message || (response.success ? "User deleted successfully" : "Failed to delete user"),
      data: response.data,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete user",
    };
  }
}
