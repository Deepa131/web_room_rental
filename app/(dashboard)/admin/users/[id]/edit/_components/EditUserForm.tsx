"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserById, updateUser } from "@/lib/api/auth";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface UserData {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  profileImage?: string;
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
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUserById(userId);
        if (response.success) {
          setUser(response.data);
          setFullName(response.data.fullName);
          setRole(response.data.role);
          setImagePreview(response.data.profileImage || "");
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
      }

      const response = await updateUser(userId, formData);

      if (response.success) {
        setSuccess("User updated successfully");
        setTimeout(() => {
          router.push(`/admin/users/${userId}`);
        }, 1000);
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
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-foreground/60">Loading user...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
          >
            <ChevronLeft size={18} />
            Back to Users
          </Link>
          <div className="rounded-md bg-red-50 dark:bg-red-950 p-4">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              {error || "User not found"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href={`/admin/users/${userId}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ChevronLeft size={18} />
          Back to User Details
        </Link>

        <div className="bg-white dark:bg-gray-900 rounded-lg border border-black/10 dark:border-white/10 p-8">
          <h1 className="text-3xl font-bold text-foreground mb-8">Edit User</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-950 p-4">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {success && (
              <div className="rounded-md bg-green-50 dark:bg-green-950 p-4">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">{success}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-black/10 dark:border-white/15 bg-white dark:bg-gray-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-2 rounded-md border border-black/10 dark:border-white/15 bg-gray-100 dark:bg-gray-800 text-foreground/60 cursor-not-allowed"
              />
              <p className="text-xs text-foreground/60 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-black/10 dark:border-white/15 bg-white dark:bg-gray-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="renter">Renter</option>
                <option value="owner">Owner (Admin)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Profile Image</label>
              {imagePreview && (
                <div className="mb-4">
                  <img
                    src={imagePreview}
                    alt="Profile preview"
                    className="h-32 w-32 rounded-md object-cover"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 rounded-md border border-black/10 dark:border-white/15 bg-white dark:bg-gray-900"
              />
              <p className="text-xs text-foreground/60 mt-1">Leave empty to keep current image</p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 rounded-md bg-blue-600 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Updating..." : "Update User"}
              </button>
              <Link
                href={`/admin/users/${userId}`}
                className="px-6 py-2 rounded-md border border-black/10 dark:border-white/15 text-foreground hover:bg-foreground/5 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
