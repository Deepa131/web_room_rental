"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { roomApi, Room } from "@/lib/api/room";
import { toast } from "react-hot-toast";
import { Trash2, Eye, Edit } from "lucide-react";
import { confirmToast } from "@/lib/ui/toast";

interface PaginatedResponse {
  success: boolean;
  data: Room[];
  total: number;
  pages: number;
  page: number;
  count: number;
}

export default function RoomsTable() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchText, setSearchText] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRooms();
  }, [page, limit, statusFilter, searchText]);

  const fetchRooms = async () => {
    try {
      if (!hasLoaded) {
        setLoading(true);
      }
      setError("");

      const filters: any = {};
      if (statusFilter !== "all") {
        filters.isAvailable = statusFilter === "available";
      }
      if (searchText) {
        filters.searchText = searchText;
      }

      const response = (await roomApi.adminGetAllRooms(
        page,
        limit,
        filters
      )) as PaginatedResponse;

      if (response.success) {
        setRooms(response.data);
        setTotal(response.total);
        setTotalPages(response.pages);
      } else {
        setError("Failed to fetch rooms");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch rooms");
    } finally {
      if (!hasLoaded) {
        setLoading(false);
        setHasLoaded(true);
      }
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    const confirmed = await confirmToast({
      title: "Permanently delete this room?",
      description: "This action cannot be undone.",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!confirmed) return;

    try {
      setProcessingId(roomId);
      const response = await roomApi.adminDeleteRoom(roomId);

      if (response.success) {
        toast.success("Room deleted successfully");
        fetchRooms();
      } else {
        toast.error(response.message || "Failed to delete room");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete room");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadgeColor = (isAvailable: boolean) => {
    return isAvailable ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800";
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "/placeholder-room.jpg";
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
    if (!imagePath.startsWith("/public/") && !imagePath.startsWith("http")) {
      return `${apiBaseUrl}/public/room_images/${imagePath}`;
    }
    if (!imagePath.startsWith("http")) {
      return `${apiBaseUrl}${imagePath}`;
    }
    return imagePath;
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 mt-2">Loading rooms...</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Filters */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="rented">Rented</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by Title or Location
            </label>
            <input
              type="text"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setPage(1);
              }}
              placeholder="Search rooms..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}

      {rooms.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-600 mb-2">No rooms found</p>
          <p className="text-sm text-gray-500">
            Try adjusting your filters
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr
                    key={room.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getImageUrl(
                            room.images?.[0] || "/placeholder-room.jpg"
                          )}
                          alt={room.roomTitle}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{room.roomTitle}</p>
                          <p className="text-xs text-gray-500">
                            {room.roomType &&
                              typeof room.roomType === "object"
                              ? room.roomType.typeName
                              : room.roomType}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {room.ownerId && typeof room.ownerId === "object"
                            ? (room.ownerId as any).fullName
                            : room.ownerId}
                        </p>
                        <p className="text-sm text-gray-500">
                          {room.ownerContactNumber}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        ₨{room.monthlyPrice}/mo
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{room.location}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                          room.isAvailable
                        )}`}
                      >
                        {room.isAvailable ? "Available" : "Rented"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/admin/rooms/${room.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link
                          href={`/admin/rooms/${room.id}/edit`}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDeleteRoom(room.id)}
                          disabled={processingId === room.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(parseInt(e.target.value));
                  setPage(1);
                }}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
              </select>
              <p className="text-sm text-gray-600">
                Showing {rooms.length} of {total} rooms
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border-2 border-blue-600 rounded-lg text-sm font-semibold text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                ← Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${
                        page === p
                          ? "bg-blue-600 text-white shadow-md"
                          : "border border-gray-300 hover:bg-blue-100"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border-2 border-blue-600 rounded-lg text-sm font-semibold text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
