"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserById, updateUser } from "@/lib/api/auth";
import ProfilePictureSection from "@/app/(dashboard)/user/profile/_components/ProfilePictureSection";

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

interface EditUserFormProps {
  userId: string;
}

export default function EditUserForm({ userId }: EditUserFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState<UserData | null>(null);
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUserById(userId);
        if (response.success) {
          const userData = response.data;
          setUser(userData);
          setFullName(userData.fullName);
          setRole(userData.role);
          setImagePreview(null);
        } else {
          setError(response.message || "Failed to fetch user");
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch user");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleImageUpdate = (file: File, previewUrl: string) => {
    setProfileImage(file);
    setImagePreview(previewUrl);
  };

  const handleImageRemove = () => {
    setProfileImage(null);
    setImagePreview(null);
    setImageRemoved(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("role", role);
      
      if (profileImage) {
        formData.append("profilePicture", profileImage);
      } else if (imageRemoved) {
        // Send null to indicate photo should be removed
        formData.append("profilePicture", "null");
      }

      const response = await updateUser(userId, formData);

      if (response.success) {
        setSuccess("User updated successfully");
        setProfileImage(null);
        setImagePreview(null);
        setImageRemoved(false);
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 1500);
      } else {
        setError(response.message || "Failed to update user");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update user");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading user...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm font-medium text-red-800">
          {error || "User not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white border border-gray-100 p-8 shadow-md">
      {/* Profile Picture Section */}
      <div className="mb-8 pb-8 border-b border-gray-200">
        <ProfilePictureSection
          fullName={fullName}
          email={user.email}
          profilePicture={user.profilePicture || user.profileImage}
          pendingImagePreview={imagePreview}
          onImageUpdate={handleImageUpdate}
          onImageRemove={handleImageRemove}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm font-semibold text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-4">
            <p className="text-sm font-semibold text-green-700">{success}</p>
          </div>
        )}

        {/* Full Name Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            placeholder="Enter full name"
            required
          />
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">Email Address</label>
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-2 font-medium">Email cannot be changed</p>
        </div>

        {/* Role Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">Account Type</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          >
            <option value="renter">Renter</option>
            <option value="owner">Owner</option>
          </select>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Updating User...
              </span>
            ) : (
              "Update User"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
