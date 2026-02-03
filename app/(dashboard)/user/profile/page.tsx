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
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
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
    
    // Fallback to cookie
    const cookies = document.cookie.split("; ");
    const userDataCookie = cookies.find((c) => c.startsWith("user_data="));
    
    if (userDataCookie) {
      try {
        const userDataStr = decodeURIComponent(userDataCookie.split("=")[1]);
        const parsed = JSON.parse(userDataStr);
        setUserData(parsed);
        console.log("Loaded user data from cookie:", parsed);
      } catch (e) {
        console.error("Failed to parse user data from cookie:", e);
      }
    }
  };

  useEffect(() => {
    loadUserData();
    setLoading(false);
  }, []);

  const handleImageUpdate = (imageUrl: string) => {
    // Store the pending image URL (don't save to localStorage yet)
    setPendingImageUrl(imageUrl);
  };

  const handleProfileUpdate = () => {
    // Reset pending image and reload user data after profile update
    setPendingImageUrl(null);
    loadUserData();
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
          profilePicture={pendingImageUrl || userData.profilePicture || userData.profileImage}
          onImageUpdate={handleImageUpdate}
        />

        {/* Form Section */}
        <div className="flex justify-center">
          <div className="w-full max-w-xl">
            <ProfileForm 
              initialData={userData} 
              updatedImageUrl={pendingImageUrl}
              onSubmitSuccess={handleProfileUpdate} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
