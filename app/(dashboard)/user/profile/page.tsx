"use client";

import { useState, useEffect } from "react";
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
  const [userData, setUserData] = useState<UserData | null>(null);
  // Pending image state - stored in memory only, lost on navigation (not saved to backend/localStorage)
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUserData = () => {
    // Get user data from localStorage first (most up-to-date after form submission)
    const localStorageData = localStorage.getItem("user_data");
    if (localStorageData) {
      try {
        const parsed = JSON.parse(localStorageData);
        setUserData(parsed);
        console.log("Loaded user data from localStorage:", parsed);
        return;
      } catch (e) {
        console.error("Failed to parse user data from localStorage:", e);
      }
    }
    
    // Fallback to cookie and sync to localStorage
    const cookies = document.cookie.split("; ");
    const userDataCookie = cookies.find((c) => c.startsWith("user_data="));
    
    if (userDataCookie) {
      try {
        const userDataStr = decodeURIComponent(userDataCookie.split("=")[1]);
        const parsed = JSON.parse(userDataStr);
        setUserData(parsed);
        
        // Sync cookie data to localStorage for future access
        localStorage.setItem("user_data", JSON.stringify(parsed));
        console.log("Loaded user data from cookie and synced to localStorage:", parsed);
      } catch (e) {
        console.error("Failed to parse user data from cookie:", e);
      }
    }
  };

  useEffect(() => {
    loadUserData();
    setLoading(false);
    
    // Cleanup: When component unmounts (user navigates away), pending images are automatically cleared
    // This ensures unsaved images are not persisted
    return () => {
      // Component unmounting - pending images cleared automatically
    };
  }, []);

  const handleImageUpdate = (file: File, previewUrl: string) => {
    // Store the pending image file and preview IN MEMORY ONLY (not saved to backend yet)
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
    // Image is now SAVED to backend and localStorage - will persist across all pages
    setUserData(updatedData);
    
    // Clear pending images since they're now permanently saved
    setPendingImageFile(null);
    setPendingImagePreview(null);
    setImageRemoved(false);
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

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
    <div className="w-full">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-gray-600 mt-3 text-lg font-medium">Update your personal information</p>
        </div>

        {/* Profile Picture Section */}
        <ProfilePictureSection
          fullName={userData.fullName}
          email={userData.email}
          profilePicture={userData.profilePicture || userData.profileImage}
          pendingImagePreview={pendingImagePreview}
          onImageUpdate={handleImageUpdate}
          onImageRemove={handleImageRemove}
        />

        {/* Form Section */}
        <div className="flex justify-center">
          <div className="w-full max-w-xl">
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
