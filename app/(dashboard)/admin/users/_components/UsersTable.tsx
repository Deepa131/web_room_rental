"use client";
import Link from "next/link";
import { Trash2, Edit2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getAllUsers, deleteUser } from "@/lib/api/auth";

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
  profilePicture?: string;
}

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAllUsers();
      if (response.success) {
        // Filter out admin users, only show renters and owners
        const filteredUsers = response.data.filter((user: User) => user.role !== "admin");
        setUsers(filteredUsers);
      } else {
        setError(response.message || "Failed to fetch users");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(userId);
      const response = await deleteUser(userId);
      if (response.success) {
        // Remove user from the list
        setUsers(users.filter(user => user._id !== userId));
        alert("User deleted successfully");
      } else {
        alert(response.message || "Failed to delete user");
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden">
      <table className="w-full text-xs">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="text-left py-2 px-2 font-semibold text-gray-900">Name</th>
            <th className="text-left py-2 px-2 font-semibold text-gray-900">Email</th>
            <th className="text-left py-2 px-2 font-semibold text-gray-900">Role</th>
            <th className="text-left py-2 px-2 font-semibold text-gray-900">Created</th>
            <th className="text-center py-2 px-2 font-semibold text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
              <td className="py-1.5 px-2 text-gray-900">
                <Link href={`/admin/users/${user._id}`} className="hover:text-blue-600 line-clamp-1">
                  {user.fullName}
                </Link>
              </td>
              <td className="py-1.5 px-2 text-gray-600">
                <Link href={`/admin/users/${user._id}`} className="hover:text-blue-600 line-clamp-1">
                  {user.email}
                </Link>
              </td>
              <td className="py-1.5 px-2">
                <Link href={`/admin/users/${user._id}`}>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                    user.role === 'owner' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role === 'owner' ? 'Owner' : 'Renter'}
                  </span>
                </Link>
              </td>
              <td className="py-1.5 px-2 text-gray-600">
                <Link href={`/admin/users/${user._id}`} className="hover:text-blue-600">
                  {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                </Link>
              </td>
              <td className="py-1.5 px-2">
                <div className="flex items-center justify-center gap-0.5">
                  <Link
                    href={`/admin/users/${user._id}/edit`}
                    className="p-0.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                    title="Edit User"
                  >
                    <Edit2 size={12} />
                  </Link>
                  <button
                    onClick={() => handleDelete(user._id, user.fullName)}
                    disabled={deletingId === user._id}
                    className="p-0.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete User"
                  >
                    {deletingId === user._id ? (
                      <div className="h-3 w-3 animate-spin rounded-full border border-solid border-red-600 border-r-transparent"></div>
                    ) : (
                      <Trash2 size={12} />
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No users found</p>
          <p className="text-gray-500 text-sm">Users who sign up as Renter or Owner will appear here</p>
        </div>
      )}
    </div>
  );
}
