import Link from "next/link";
import { ChevronLeft, User } from "lucide-react";
import EditUserForm from "./_components/EditUserForm";

export const metadata = {
  title: "Edit User | Admin Dashboard",
  description: "Edit and manage user account information",
};

interface EditUserPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { id } = await params;
  
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Users
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit User Account</h1>
              <p className="text-gray-600 mt-0.5 text-sm">Update and manage user information</p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <EditUserForm userId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}
