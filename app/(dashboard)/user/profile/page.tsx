"use client";

import { useState, useEffect } from "react";
import ProfileForm from "./_components/ProfileForm";
import ProfilePictureSection from "./_components/ProfilePictureSection";
import {
  handleUserImageRemove,
  handleUserImageUpdate,
  handleUserProfileUpdate,
  loadUserProfileData,
  type DashboardUserData,
} from "@/lib/actions/user/profile_actions";

export default function ProfilePage() {
  const [userData, setUserData] = useState<DashboardUserData | null>(null);
  // Pending image state - stored in memory only, lost on navigation
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUserData = () => {
    const parsed = loadUserProfileData();
    setUserData(parsed);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUserData();
    setLoading(false);
    
    // Cleanup: When component unmounts (user navigates away), pending images are automatically cleared
    // This ensures unsaved images are not persisted
    return () => {
      // Component unmounting - pending images cleared automatically
    };
  }, []);

  const handleImageUpdate = (file: File, previewUrl: string) => {
    handleUserImageUpdate(file, previewUrl, setPendingImageFile, setPendingImagePreview);
  };

  const handleImageRemove = () => {
    handleUserImageRemove(setPendingImageFile, setPendingImagePreview, setImageRemoved);
  };

  const handleProfileUpdate = (updatedData: DashboardUserData) => {
    handleUserProfileUpdate(updatedData, setUserData, setPendingImageFile, setPendingImagePreview, setImageRemoved);
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
    <div className="w-full min-h-screen bg-transparent">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-gray-600 mt-1">Manage your personal information and settings</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Profile Picture Section */}
          <div className="bg-linear-to-br from-blue-50 to-indigo-50 px-6 py-8">
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
