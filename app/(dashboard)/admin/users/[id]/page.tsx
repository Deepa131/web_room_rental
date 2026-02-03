"use client";

import { useEffect, useState } from "react";
import { getUserById } from "@/lib/api/auth";
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

interface UserDetailPageProps {
  params: {
    id: string;
  };
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUserById(params.id);
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

    fetchUser();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-foreground/60">Loading user...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
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
          href="/admin/users"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ChevronLeft size={18} />
          Back to Users
        </Link>

        <div className="bg-white dark:bg-gray-900 rounded-lg border border-black/10 dark:border-white/10 p-8">
          <div className="flex items-start gap-8">
            {user.profileImage && (
              <div className="flex-shrink-0">
                <img
                  src={user.profileImage}
                  alt={user.fullName}
                  className="h-32 w-32 rounded-lg object-cover"
                />
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground">{user.fullName}</h1>
              
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-sm text-foreground/60">Email</p>
                  <p className="text-foreground">{user.email}</p>
                </div>

                <div>
                  <p className="text-sm text-foreground/60">Role</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 ${user.role === 'owner' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200'}`}>
                    {user.role === 'owner' ? 'Admin' : user.role}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-foreground/60">Member Since</p>
                  <p className="text-foreground">{new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                <div className="pt-4">
                  <Link
                    href={`/admin/users/${user._id}/edit`}
                    className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:opacity-90 transition-opacity"
                  >
                    Edit User
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
