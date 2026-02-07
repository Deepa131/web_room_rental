import { getUserData } from "@/lib/cookie";
import Link from "next/link";

export const metadata = {
  title: "Dashboard Home",
  description: "Welcome to your dashboard",
};

export default async function DashboardPage() {
  const userData = await getUserData();

  const isAdmin = userData?.role === "admin";

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground">
            Welcome, {userData?.fullName}!
          </h1>
          <p className="mt-2 text-lg text-foreground/60">
            {isAdmin ? "You have admin access to manage users" : "You're logged in as a user"}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Card */}
          <div className="rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">My Profile</h2>
            <p className="text-foreground/60 mb-4">
              View and update your profile information
            </p>
            <Link
              href="/user/profile"
              className="inline-flex px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:opacity-90 transition-opacity"
            >
              Go to Profile
            </Link>
          </div>

          {/* Admin Section */}
          {isAdmin && (
            <div className="rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-gray-900 p-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">User Management</h2>
              <p className="text-foreground/60 mb-4">
                Create, view, and manage all users in the system
              </p>
              <Link
                href="/admin/users"
                className="inline-flex px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:opacity-90 transition-opacity"
              >
                Manage Users
              </Link>
            </div>
          )}
        </div>

        <div className="mt-12 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-gray-900 p-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Quick Stats</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-md bg-gray-50 dark:bg-gray-800 p-4">
              <p className="text-sm text-foreground/60">Role</p>
              <p className="text-2xl font-bold text-foreground capitalize">
                {userData?.role === "admin" ? "Admin" : userData?.role}
              </p>
            </div>
            <div className="rounded-md bg-gray-50 dark:bg-gray-800 p-4">
              <p className="text-sm text-foreground/60">Email</p>
              <p className="text-lg font-semibold text-foreground truncate">
                {userData?.email}
              </p>
            </div>
            <div className="rounded-md bg-gray-50 dark:bg-gray-800 p-4">
              <p className="text-sm text-foreground/60">Member Since</p>
              <p className="text-lg font-semibold text-foreground">
                {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
