"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Shield, Check, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { fetchAdminUserById, updateAdminUser } from "@/lib/actions/admin/users_actions";
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
        const response = await fetchAdminUserById(userId);
        if (response.success) {
          const userData = response.data;
          setUser(userData);
          setFullName(userData.fullName);
          setRole(userData.role);
          setImagePreview(null);
        } else {
          setError(response.message || "Failed to fetch user");
        }
      } catch (err: unknown) {
        const error = err instanceof Error ? err.message : "Failed to fetch user";
        setError(error);
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

      const response = await updateAdminUser(userId, formData);

      if (response.success) {
        const successMessage = "User updated successfully! Redirecting...";
        setSuccess(successMessage);
        toast.success(successMessage, { duration: 3000 });
        setProfileImage(null);
        setImagePreview(null);
        setImageRemoved(false);
        
        // Redirect after toast is visible
        setTimeout(() => {
          router.push("/admin/users");
        }, 2000);
      } else {
        const errorMessage = response.message || "Failed to update user";
        setError(errorMessage);
        toast.error(errorMessage, { duration: 4000 });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update user";
      setError(errorMessage);
      toast.error(errorMessage, { duration: 4000 });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12">
        <div className="flex flex-col items-center justify-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading user information...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-red-800">
            {error || "User not found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Alert Messages */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-3 flex items-start gap-2">
          <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-green-700">{success}</p>
        </div>
      )}

      {/* Profile Picture Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
        <ProfilePictureSection
          fullName={fullName}
          email={user.email}
          profilePicture={user.profilePicture || user.profileImage}
          pendingImagePreview={imagePreview}
          onImageUpdate={handleImageUpdate}
          onImageRemove={handleImageRemove}
        />
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
          
          {/* Full Name Field */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              placeholder="Enter full name"
              required
            />
          </div>

          {/* Email Field */}
          <div className="mb-4">
            <label className="flex text-sm font-semibold text-gray-900 mb-2 items-center gap-2">
              <Mail className="w-4 h-4 text-gray-600" />
              Email Address
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1 font-medium">Email address cannot be changed</p>
          </div>

          {/* Role Field */}
          <div>
            <label className="flex text-sm font-semibold text-gray-900 mb-2 items-center gap-2">
              <Shield className="w-4 h-4 text-gray-600" />
              Account Type
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            >
              <option value="renter">Renter</option>
              <option value="owner">Room Owner</option>
            </select>
            <p className="text-xs text-gray-500 mt-1 font-medium">Defines user access level and permissions</p>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="pt-4 border-t border-gray-200 flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-6 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 font-semibold hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
