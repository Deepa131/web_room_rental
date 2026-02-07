import { getUserData } from "@/lib/cookie";
import Link from "next/link";
import { Home, Clock, CheckCircle, Plus } from "lucide-react";

export const metadata = {
  title: "Owner Dashboard",
  description: "Welcome to your owner dashboard",
};

export default async function OwnerDashboardPage() {
  const userData = await getUserData();

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Welcome, {userData?.fullName}!
          </h1>
          <p className="text-gray-600 mt-2 font-medium">Manage your properties and bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4 mb-14">
          <div className="rounded-xl bg-white p-6 shadow-md hover:shadow-lg transition-all border border-gray-100 hover:border-blue-200 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Total Listings</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Home className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-md hover:shadow-lg transition-all border border-gray-100 hover:border-yellow-200 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Pending Requests</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                <Clock className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-md hover:shadow-lg transition-all border border-gray-100 hover:border-green-200 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Approved Requests</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-md hover:shadow-lg transition-all border border-gray-100 hover:border-purple-200 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Available Rooms</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Home className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* My Listings Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Listings</h2>
              <p className="text-gray-600 text-sm mt-1">Manage and view all your property listings</p>
            </div>
            <Link
              href="/add-room"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:shadow-lg transition-all hover:from-blue-700 hover:to-blue-800"
            >
              <Plus size={18} />
              Add Room
            </Link>
          </div>

          {/* No Rooms Available Message */}
          <div className="rounded-xl bg-white border border-gray-100 p-14 shadow-md text-center hover:shadow-lg transition-shadow">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5">
              <Home className="text-blue-600" size={32} />
            </div>
            <p className="text-lg font-semibold text-gray-900 mb-2">No rooms available</p>
            <p className="text-sm text-gray-600 mb-8">
              Start by adding your first room listing to get started.
            </p>
            <Link
              href="/add-room"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:shadow-lg transition-all hover:from-blue-700 hover:to-blue-800"
            >
              <Plus size={18} />
              Add Your First Room
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-white py-10 mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 text-sm font-medium">© 2025 RentEasy. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
