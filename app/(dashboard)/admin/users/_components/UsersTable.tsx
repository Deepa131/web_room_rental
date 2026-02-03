"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllUsers } from "@/lib/api/auth";
import { Trash2, Edit2, Plus } from "lucide-react";

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        if (response.success) {
          setUsers(response.data);
        } else {
          setError(response.message || "Failed to fetch users");
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-foreground/60">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 dark:bg-red-950 p-4">
        <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-black/10 dark:border-white/10">
          <tr>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Name</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Email</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Role</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Created</th>
            <th className="text-right py-3 px-4 font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="border-b border-black/5 dark:border-white/5 hover:bg-foreground/5 transition-colors">
              <td className="py-3 px-4 text-foreground">{user.fullName}</td>
              <td className="py-3 px-4 text-foreground/70">{user.email}</td>
              <td className="py-3 px-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'owner' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200'}`}>
                  {user.role === 'owner' ? 'Admin' : user.role}
                </span>
              </td>
              <td className="py-3 px-4 text-foreground/60 text-sm">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/users/${user._id}`}
                    className="p-2 text-foreground/70 hover:text-foreground/90 hover:bg-foreground/5 rounded-md transition-colors"
                  >
                    <Edit2 size={16} />
                  </Link>
                  <button
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-foreground/60 mb-4">No users found</p>
        </div>
      )}
    </div>
  );
}
