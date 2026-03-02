import Link from "next/link";
import { Plus, Home, Users } from "lucide-react";
import UsersTable from "../users/_components/UsersTable";

export const metadata = {
  title: "Admin Dashboard",
  description: "Welcome to your admin dashboard",
};

export default async function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1 text-sm">
            Manage users, rooms, and system settings
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Link
            href="/admin/rooms"
            className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Home size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Manage Rooms</h3>
                <p className="text-xs text-gray-600">
                  Update, delete & manage all rooms
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/users"
            className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <Users size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Manage Users</h3>
                <p className="text-xs text-gray-600">
                  Create, update & manage users
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Users Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">User Management</h2>
              <p className="text-gray-600 text-xs mt-0.5">Manage all user accounts</p>
            </div>
            <Link
              href="/admin/users/create"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              Add User
            </Link>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <UsersTable />
          </div>
        </div>
      </div>
    </div>
  );
}

