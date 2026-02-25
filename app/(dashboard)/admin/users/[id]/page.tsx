"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Edit2, Mail, Calendar, Shield } from "lucide-react";
import { getUserById } from "@/lib/api/auth";
import { useParams } from "next/navigation";

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

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUserById(userId);
        if (response.success) {
          setUser(response.data);
        } else {
          setError(response.message || "Failed to fetch user");
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch user");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') return "U";
    const cleanName = name.trim();
    if (!cleanName) return "U";
    
    const parts = cleanName.split(/\s+/);
    
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    
    const first = parts[0].charAt(0).toUpperCase();
    const last = parts[parts.length - 1].charAt(0).toUpperCase();
    
    return first + last;
  };

  const isValidImage = (img: string | null | undefined): boolean => {
    if (!img) return false;
    if (typeof img !== 'string') return false;
    const trimmed = img.trim();
    if (trimmed === '') return false;
    if (trimmed === 'null' || trimmed === 'undefined') return false;
    if (trimmed === 'default-profile.png' || trimmed.includes('default')) return false;
    return true;
  };

  const getProfileImageUrl = (profilePic: string | undefined) => {
    if (!isValidImage(profilePic)) return null;
    
    let imageUrl = profilePic!;
    if (!imageUrl.startsWith('/public/') && !imageUrl.startsWith('http')) {
      imageUrl = `/public/${imageUrl.replace(/^\//, '')}`;
    }
    if (!imageUrl.startsWith('http')) {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050';
      imageUrl = `${apiBaseUrl}${imageUrl}`;
    }
    return imageUrl;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-blue-100 text-blue-800';
      case 'renter':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-linear-to-br from-gray-50 to-gray-100 overflow-hidden flex flex-col">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-4 flex-1 flex flex-col">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium text-sm"
          >
            <ChevronLeft size={16} />
            Back to Dashboard
          </Link>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600 text-sm">Loading user details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="h-screen bg-linear-to-br from-gray-50 to-gray-100 overflow-hidden flex flex-col">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-4 flex-1 flex flex-col">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium text-sm"
          >
            <ChevronLeft size={16} />
            Back to Dashboard
          </Link>
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">
              {error || "User not found"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const profileImageUrl = getProfileImageUrl(user.profilePicture || user.profileImage);
  const initials = getInitials(user.fullName);

  return (
    <div className="h-screen bg-linear-to-br from-gray-50 to-gray-100 overflow-hidden">
      <div className="mx-auto max-w-3xl px-8 py-3 h-full flex flex-col">
        {/* Back Button */}
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium w-fit"
        >
          <ChevronLeft size={18} />
          Back to Dashboard
        </Link>

        {/* User Card */}
        <div className="rounded-xl bg-white border border-gray-100 shadow-md flex flex-col overflow-hidden">
          {/* Header with Edit Button */}
          <div className="flex items-center justify-between px-8 py-2 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
            <Link
              href={`/admin/users/${user._id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit2 size={16} />
              Edit
            </Link>
          </div>

          {/* Content */}
          <div className="px-8 py-2 flex flex-col overflow-hidden">
            {/* Profile Picture and Name Section */}
            <div className="flex flex-col items-center pb-3 border-b border-gray-200">
              {/* Profile Picture */}
              <div className="w-24 h-24 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center border-4 border-gray-200 shadow-lg overflow-hidden mb-4">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={user.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {initials}
                  </span>
                )}
              </div>

              {/* Name */}
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                {user.fullName}
              </h2>

              {/* Role Badge */}
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getRoleBadgeColor(user.role)}`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>

            {/* User Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 overflow-hidden">
              {/* Email */}
              <div className="flex gap-3">
                <div className="shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-500">Email</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">{user.email}</p>
                </div>
              </div>

              {/* Account Type */}
              <div className="flex gap-3">
                <div className="shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-indigo-100">
                    <Shield className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Account Type</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{user.role}</p>
                </div>
              </div>

              {/* Created Date */}
              <div className="flex gap-3">
                <div className="shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-green-100">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-500">Member Since</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Updated Date */}
              <div className="flex gap-3">
                <div className="shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-orange-100">
                    <Calendar className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-500">Last Updated</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {new Date(user.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
