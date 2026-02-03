import { getUserData } from "@/lib/cookie";
import Link from "next/link";
import { Home, FileText, Bell } from "lucide-react";

export const metadata = {
  title: "Renter Dashboard",
  description: "Welcome to your renter dashboard",
};

export default async function RenterDashboardPage() {
  const userData = await getUserData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Welcome, {userData?.fullName}! 👋
          </h1>
          <p className="mt-2 text-gray-600 font-medium">
            Explore rooms and manage your bookings
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Profile Card */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-md hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">My Profile</h2>
                <p className="text-gray-600 text-sm mt-1">
                  View and update your information
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Home className="text-blue-600" size={20} />
              </div>
            </div>
            <Link
              href="/user/profile"
              className="inline-flex px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:shadow-lg transition-all text-sm"
            >
              Go to Profile
            </Link>
          </div>

          {/* Browse Rooms Card */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-md hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Browse Rooms</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Find your perfect room
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Home className="text-purple-600" size={20} />
              </div>
            </div>
            <button
              disabled
              className="inline-flex px-4 py-2 rounded-lg bg-gray-200 text-gray-600 font-medium cursor-not-allowed text-sm"
            >
              Coming Soon
            </button>
          </div>

          {/* My Bookings Card */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-md hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">My Bookings</h2>
                <p className="text-gray-600 text-sm mt-1">
                  View your reservations
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="text-green-600" size={20} />
              </div>
            </div>
            <button
              disabled
              className="inline-flex px-4 py-2 rounded-lg bg-gray-200 text-gray-600 font-medium cursor-not-allowed text-sm"
            >
              Coming Soon
            </button>
          </div>
        </div>

        {/* Account Info Section */}
        <div className="mt-12 rounded-xl border border-gray-100 bg-white p-8 shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Account Information</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-6 border border-blue-100">
              <p className="text-sm text-gray-600 font-medium mb-2">Account Type</p>
              <p className="text-2xl font-bold text-blue-600">Renter</p>
              <p className="text-xs text-gray-600 mt-2 font-medium">Standard Access</p>
            </div>
            <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-6 border border-green-100">
              <p className="text-sm text-gray-600 font-medium mb-2">Email</p>
              <p className="text-lg font-semibold text-gray-900 truncate">
                {userData?.email}
              </p>
            </div>
            <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-6 border border-purple-100">
              <p className="text-sm text-gray-600 font-medium mb-2">Member Since</p>
              <p className="text-lg font-semibold text-gray-900">
                {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="mt-8 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 p-8 shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-200 rounded-lg">
              <Bell className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Pro Tip</h3>
              <p className="text-gray-700 text-sm mt-1 font-medium">
                Complete your profile to get better room recommendations and faster booking approvals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
