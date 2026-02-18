import Link from "next/link";
import { Plus, Home, Users } from "lucide-react";
import UsersTable from "../users/_components/UsersTable";

export const metadata = {
  title: "Admin Dashboard",
  description: "Welcome to your admin dashboard",
};

export default async function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2 font-medium">
            Manage users, rooms, and system settings
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 mb-12">
          <Link
            href="/admin/rooms"
            className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-md hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Home size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Manage Rooms</h3>
                <p className="text-sm text-gray-600">
                  Approve, reject & manage all rooms
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/users"
            className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-md hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <Users size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Manage Users</h3>
                <p className="text-sm text-gray-600">
                  Create, update & manage users
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Users Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <p className="text-gray-600 text-sm mt-1">Manage all user accounts</p>
            </div>
            <Link
              href="/admin/users/create"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:opacity-90 transition-opacity"
            >
              <Plus size={18} />
              Add User
            </Link>
          </div>

          <div className="bg-white rounded-lg border border-gray-100 shadow-md">
            <UsersTable />
          </div>
        </div>
      </div>
    </div>
  );
}

