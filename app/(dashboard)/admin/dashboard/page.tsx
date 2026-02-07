import Link from "next/link";
import { Plus } from "lucide-react";
import UsersTable from "../users/_components/UsersTable";

export const metadata = {
  title: "Admin Dashboard",
  description: "Welcome to your admin dashboard",
};

export default async function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2 font-medium">
              Manage user records and review admin routes
            </p>
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
  );
}

