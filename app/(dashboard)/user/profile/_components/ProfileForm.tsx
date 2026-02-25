"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/lib/api/auth";

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

interface ProfileFormProps {
  initialData: UserData;
  pendingImageFile?: File | null; // File object from image upload 
  imageRemoved?: boolean; // Track if user removed the image
  onSubmitSuccess?: (updatedData: UserData) => void;
}

export default function ProfileForm({ initialData, pendingImageFile, imageRemoved = false, onSubmitSuccess }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fullName, setFullName] = useState(initialData.fullName);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      
      // If there's a pending image file, include it in the update
      if (pendingImageFile) {
        formData.append("profilePicture", pendingImageFile);
      } else if (imageRemoved) {
        // Send null to indicate photo should be removed
        formData.append("profilePicture", "null");
      }

      const response = await updateProfile(initialData._id, formData);

      if (response.success && response.data) {
        setSuccess("Profile updated successfully");
        
        // CRITICAL: Check if profilePicture was actually updated
        if (pendingImageFile && !response.data.profilePicture) {
          setError("Image upload may have failed. Please try again.");
          setLoading(false);
          return;
        }
        
        if (pendingImageFile && response.data.profilePicture === initialData.profilePicture) {
          setError("Image upload failed. Please try again.");
          setLoading(false);
          return;
        }
        
        // Update localStorage with the latest user data from response
        if (typeof window !== 'undefined') {
          localStorage.setItem("user_data", JSON.stringify(response.data));
          
          // Also update the cookie so the navbar reflects the changes immediately
          document.cookie = `user_data=${encodeURIComponent(JSON.stringify(response.data))}; path=/; max-age=${60*60*24*30}`;
          
          // Dispatch custom event to notify navbar of profile changes
          window.dispatchEvent(new Event('profilePictureUpdated'));
        }
        
        // Call parent callback with updated data to reload
        onSubmitSuccess?.(response.data);
        
        setTimeout(() => {
          router.refresh();
        }, 1000);
      } else {
        setError(response.message || "Failed to update profile");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-3">
          <p className="text-sm font-medium text-green-700">{success}</p>
        </div>
      )}

      {/* Full Name Field */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Full Name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          placeholder="Enter your full name"
          required
        />
      </div>

      {/* Email Field */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Email Address</label>
        <input
          type="email"
          value={initialData.email}
          disabled
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
        />
        <p className="text-xs text-gray-500 mt-1.5">Email cannot be changed</p>
      </div>

      {/* Role Field */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Account Type</label>
        <input
          type="text"
          value={initialData.role}
          disabled
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed capitalize"
        />
        <p className="text-xs text-gray-500 mt-1.5">Account type cannot be changed</p>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Updating...
            </span>
          ) : (
            "Update Profile"
          )}
        </button>
      </div>
    </form>
  );
}
