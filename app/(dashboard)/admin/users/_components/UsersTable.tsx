"use client";
import Link from "next/link";
import { Trash2, Edit2, Search, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getAllUsers, deleteUser } from "@/lib/api/auth";
import { toast } from "react-hot-toast";
import { confirmToast } from "@/lib/ui/toast";

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
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAllUsers(page, limit);
      if (response.success) {
        setUsers(response.data);
        setTotal(response.meta?.total || 0);
        setTotalPages(response.meta?.totalPages || 1);
      } else {
        setError(response.message || "Failed to fetch users");
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : "Failed to fetch users";
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const handleDelete = async (userId: string, userName: string) => {
    const confirmed = await confirmToast({
      title: `Delete ${userName}?`,
      description: "This action cannot be undone.",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!confirmed) return;

    try {
      setDeletingId(userId);
      const response = await deleteUser(userId);
      if (response.success) {
        // Remove user from the list
        setUsers(users.filter(user => user._id !== userId));
        toast.success("User deleted successfully");
      } else {
        toast.error(response.message || "Failed to delete user");
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : "Failed to delete user";
      toast.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    
    // First, filter out admins
    const nonAdminUsers = users.filter((user) => user.role !== "admin");
    
    if (!query) return nonAdminUsers;

    return nonAdminUsers.filter((user) => {
      return (
        user.fullName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
      );
    });
  }, [users, search]);

  const counts = useMemo(() => {
    return filteredUsers.reduce(
      (acc, user) => {
        if (user.role === "owner") acc.owners += 1;
        else if (user.role === "renter") acc.renters += 1;
        else acc.admins += 1;
        return acc;
      },
      { owners: 0, renters: 0, admins: 0 }
    );
  }, [filteredUsers]);

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

  const startIndex = total === 0 ? 0 : (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);

  return (
    <div className="w-full overflow-hidden">
      <div className="border-b border-gray-100 bg-linear-to-r from-amber-50 via-white to-sky-50 px-4 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Users size={18} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500">Quick Insights</p>
              <p className="text-sm font-semibold text-gray-900">
                Total users: {counts.owners + counts.renters}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">Owners: {counts.owners}</span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">Renters: {counts.renters}</span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">Admins: {counts.admins}</span>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, role"
              className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>Rows</span>
            <select
              value={limit}
              onChange={(event) => {
                setLimit(Number(event.target.value));
                setPage(1);
              }}
              className="h-9 rounded-md border border-gray-200 bg-white px-2 text-sm text-gray-800"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="text-left py-3 px-4 font-bold text-gray-900 text-base">Name</th>
            <th className="text-left py-3 px-4 font-bold text-gray-900 text-base">Email</th>
            <th className="text-left py-3 px-4 font-bold text-gray-900 text-base">Role</th>
            <th className="text-left py-3 px-4 font-bold text-gray-900 text-base">Created</th>
            <th className="text-center py-3 px-4 font-bold text-gray-900 text-base">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
              <td className="py-3 px-4 text-gray-900 font-semibold">
                <Link href={`/admin/users/${user._id}`} className="hover:text-blue-600 line-clamp-1">
                  {user.fullName}
                </Link>
              </td>
              <td className="py-3 px-4 text-gray-600 text-base">
                <Link href={`/admin/users/${user._id}`} className="hover:text-blue-600 line-clamp-1">
                  {user.email}
                </Link>
              </td>
              <td className="py-1.5 px-2">
                <Link href={`/admin/users/${user._id}`}>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-sm font-semibold ${
                    user.role === 'owner' 
                      ? 'bg-blue-100 text-blue-800' 
                      : user.role === 'admin'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role === 'owner' ? 'Owner' : user.role === 'admin' ? 'Admin' : 'Renter'}
                  </span>
                </Link>
              </td>
              <td className="py-3 px-4 text-gray-600 text-base">
                <Link href={`/admin/users/${user._id}`} className="hover:text-blue-600">
                  {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                </Link>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-center gap-2">
                  <Link
                    href={`/admin/users/${user._id}/edit`}
                    className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Edit User"
                  >
                    <Edit2 size={18} />
                  </Link>
                  <button
                    onClick={() => handleDelete(user._id, user.fullName)}
                    disabled={deletingId === user._id}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete User"
                  >
                    {deletingId === user._id ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-solid border-red-600 border-r-transparent\"></div>
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No users found</p>
          <p className="text-gray-500 text-sm">Try clearing filters or adjusting the page</p>
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 text-sm text-gray-600 md:flex-row md:items-center md:justify-between">
        <div>
          Showing {startIndex}-{endIndex} of {total}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page <= 1}
            className="rounded-md border border-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm font-medium text-gray-800">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page >= totalPages}
            className="rounded-md border border-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
