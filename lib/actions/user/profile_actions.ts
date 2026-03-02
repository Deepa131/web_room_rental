import {
  DashboardUserData,
  handleImageRemove as handleDashboardImageRemove,
  handleImageUpdate as handleDashboardImageUpdate,
  handleProfileUpdate as handleDashboardProfileUpdate,
  loadUserDataFromStorage,
  submitProfileUpdate,
} from "@/lib/actions/admin/profile_actions";

export type { DashboardUserData };

export function loadUserProfileData() {
  return loadUserDataFromStorage();
}

export function handleUserImageUpdate(
  file: File,
  previewUrl: string,
  setPendingImageFile: (file: File | null) => void,
  setPendingImagePreview: (url: string | null) => void
) {
  handleDashboardImageUpdate(
    file,
    previewUrl,
    setPendingImageFile,
    setPendingImagePreview
  );
}

export function handleUserImageRemove(
  setPendingImageFile: (file: File | null) => void,
  setPendingImagePreview: (url: string | null) => void,
  setImageRemoved: (removed: boolean) => void
) {
  handleDashboardImageRemove(
    setPendingImageFile,
    setPendingImagePreview,
    setImageRemoved
  );
}

export function handleUserProfileUpdate(
  updatedData: DashboardUserData,
  setUserData: (data: DashboardUserData) => void,
  setPendingImageFile: (file: File | null) => void,
  setPendingImagePreview: (url: string | null) => void,
  setImageRemoved: (removed: boolean) => void
) {
  handleDashboardProfileUpdate(
    updatedData,
    setUserData,
    setPendingImageFile,
    setPendingImagePreview,
    setImageRemoved
  );
}

export async function submitUserProfileUpdate(
  userId: string,
  fullName: string,
  pendingImageFile?: File | null,
  imageRemoved = false,
  previousProfilePicture?: string
) {
  return submitProfileUpdate(
    userId,
    fullName,
    pendingImageFile,
    imageRemoved,
    previousProfilePicture
  );
}
