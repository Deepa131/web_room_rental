"use client";

import { useState } from "react";
import ProfileForm from "./_components/ProfileForm";
import ProfilePictureSection from "./_components/ProfilePictureSection";

interface UserData {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  profileImage?: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(() => {
    // Initialize from localStorage on mount
    if (typeof window !== 'undefined') {
      const localStorageData = localStorage.getItem("user_data");
      if (localStorageData) {
        try {
          return JSON.parse(localStorageData);
        } catch (e) {
          console.error("Failed to parse user data from localStorage:", e);
        }
      }
      
      // Fallback to cookie
      const cookies = document.cookie.split("; ");
      const userDataCookie = cookies.find((c) => c.startsWith("user_data="));
      
      if (userDataCookie) {
        try {
          const userDataStr = decodeURIComponent(userDataCookie.split("=")[1]);
          const parsed = JSON.parse(userDataStr);
          // Sync cookie data to localStorage for future access
          localStorage.setItem("user_data", JSON.stringify(parsed));
          return parsed;
        } catch (e) {
          console.error("Failed to parse user data from cookie:", e);
        }
      }
    }
    return null;
  });
  // Pending image state - stored in memory only, lost on navigation
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);

  const handleImageUpdate = (file: File, previewUrl: string) => {
    // Store the pending image file and preview IN MEMORY ONLY 
    // This will be lost if user navigates away without clicking "Update Profile"
    setPendingImageFile(file);
    setPendingImagePreview(previewUrl);
  };

  const handleImageRemove = () => {
    // Clear both pending and current image
    setPendingImageFile(null);
    setPendingImagePreview(null);
    setImageRemoved(true);
  };

  const handleProfileUpdate = (updatedData: UserData) => {
    setUserData(updatedData);
    
    // Clear pending images since they're now permanently saved
    setPendingImageFile(null);
    setPendingImagePreview(null);
    setImageRemoved(false);
  };

  if (!userData) {
    return (
      <div className="w-full flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Unable to load user data</p>
          <p className="text-sm text-gray-500">Please log in again</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            My Profile
          </h1>
          <p className="text-gray-600 mt-1 text-sm">Manage your personal information and settings</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Profile Picture Section */}
          <div className="bg-gray-50 px-6 py-6 border-b border-gray-200">
            <ProfilePictureSection
              fullName={userData.fullName}
              email={userData.email}
              profilePicture={userData.profilePicture || userData.profileImage}
              pendingImagePreview={pendingImagePreview}
              onImageUpdate={handleImageUpdate}
              onImageRemove={handleImageRemove}
            />
          </div>

          {/* Form Section */}
          <div className="p-6">
            <ProfileForm 
              initialData={userData} 
              pendingImageFile={pendingImageFile}
              imageRemoved={imageRemoved}
              onSubmitSuccess={handleProfileUpdate} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
