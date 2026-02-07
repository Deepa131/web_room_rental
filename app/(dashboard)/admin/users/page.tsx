import Link from "next/link";
import UsersTable from "./_components/UsersTable";
import { Plus } from "lucide-react";

export const metadata = {
  title: "Manage Users",
  description: "Manage all users in the system",
};

export default function UsersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
            <p className="mt-2 text-gray-600">View and manage all users in the system</p>
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
