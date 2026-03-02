import { updateProfile } from "@/lib/api/auth";

export interface DashboardUserData {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  profileImage?: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

export function loadUserDataFromStorage(): DashboardUserData | null {
  if (typeof window === "undefined") return null;

  const localStorageData = localStorage.getItem("user_data");
  if (localStorageData) {
    return JSON.parse(localStorageData) as DashboardUserData;
  }

  const cookies = document.cookie.split("; ");
  const userDataCookie = cookies.find((cookiePart) =>
    cookiePart.startsWith("user_data=")
  );

  if (!userDataCookie) {
    return null;
  }

  const userDataString = decodeURIComponent(userDataCookie.split("=")[1]);
  const parsed = JSON.parse(userDataString) as DashboardUserData;
  localStorage.setItem("user_data", JSON.stringify(parsed));
  return parsed;
}

export function handleImageUpdate(
  file: File,
  previewUrl: string,
  setPendingImageFile: (file: File | null) => void,
  setPendingImagePreview: (url: string | null) => void
) {
  setPendingImageFile(file);
  setPendingImagePreview(previewUrl);
}

export function handleImageRemove(
  setPendingImageFile: (file: File | null) => void,
  setPendingImagePreview: (url: string | null) => void,
  setImageRemoved: (removed: boolean) => void
) {
  setPendingImageFile(null);
  setPendingImagePreview(null);
  setImageRemoved(true);
}

export function handleProfileUpdate(
  updatedData: DashboardUserData,
  setUserData: (data: DashboardUserData) => void,
  setPendingImageFile: (file: File | null) => void,
  setPendingImagePreview: (url: string | null) => void,
  setImageRemoved: (removed: boolean) => void
) {
  setUserData(updatedData);
  setPendingImageFile(null);
  setPendingImagePreview(null);
  setImageRemoved(false);
}

export async function submitProfileUpdate(
  userId: string,
  fullName: string,
  pendingImageFile?: File | null,
  imageRemoved = false,
  previousProfilePicture?: string
) {
  const formData = new FormData();
  formData.append("fullName", fullName);

  if (pendingImageFile) {
    formData.append("profilePicture", pendingImageFile);
  } else if (imageRemoved) {
    formData.append("profilePicture", "null");
  }

  const response = await updateProfile(userId, formData);

  if (!response?.success || !response?.data) {
    return response;
  }

  if (pendingImageFile && !response.data.profilePicture) {
    return {
      success: false,
      message: "Image upload may have failed. Please try again.",
    };
  }

  if (
    pendingImageFile &&
    response.data.profilePicture === previousProfilePicture
  ) {
    return {
      success: false,
      message: "Image upload failed. Please try again.",
    };
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("user_data", JSON.stringify(response.data));
    document.cookie = `user_data=${encodeURIComponent(
      JSON.stringify(response.data)
    )}; path=/; max-age=${60 * 60 * 24 * 30}`;
    window.dispatchEvent(new Event("profilePictureUpdated"));
  }

  return response;
}
