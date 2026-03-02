"use client";

import { useState } from "react";
import ProfileForm from "./_components/ProfileForm";
import ProfilePictureSection from "./_components/ProfilePictureSection";
import {
  handleImageRemove as clearPendingImage,
  handleImageUpdate,
  handleProfileUpdate,
  loadUserDataFromStorage,
  type DashboardUserData,
} from "@/lib/actions/admin/profile_actions";

export default function ProfilePage() {
  const [userData, setUserData] = useState<DashboardUserData | null>(() => loadUserDataFromStorage());
  // Pending image state - stored in memory only, lost on navigation
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);

  const handleImageRemove = () => {
    clearPendingImage(setPendingImageFile, setPendingImagePreview, setImageRemoved);
  };

  const handleImageUpdateWrapper = (file: File, previewUrl: string) => {
    handleImageUpdate(file, previewUrl, setPendingImageFile, setPendingImagePreview);
  };

  const handleProfileUpdateWrapper = (updatedData: DashboardUserData) => {
    handleProfileUpdate(updatedData, setUserData, setPendingImageFile, setPendingImagePreview, setImageRemoved);
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
              onImageUpdate={handleImageUpdateWrapper}
              onImageRemove={handleImageRemove}
            />
          </div>

          {/* Form Section */}
          <div className="p-6">
            <ProfileForm 
              initialData={userData} 
              pendingImageFile={pendingImageFile}
              imageRemoved={imageRemoved}
              onSubmitSuccess={handleProfileUpdateWrapper} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
