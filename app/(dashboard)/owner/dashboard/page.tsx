"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Home, Clock, CheckCircle, Plus, Edit, Trash2 } from "lucide-react";
import { roomApi, Room } from "@/lib/api/room";
import { appointmentApi, Appointment } from "@/lib/api/appointment";
import { toast } from "react-hot-toast";
import { confirmToast } from "@/lib/ui/toast";

export default function OwnerDashboardPage() {
  const router = useRouter();
  const getRoomId = (room: Room & { _id?: string }) => room.id || room._id || "";
  const [userData, setUserData] = useState<any>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [updatingRoomId, setUpdatingRoomId] = useState<string | null>(null);

  const fetchData = async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      // Get user data from localStorage (client-side)
      const userDataStr = localStorage.getItem('user_data');
      const user = userDataStr ? JSON.parse(userDataStr) : null;
      setUserData(user);

      const ownerId = user?._id || user?.id;

      if (ownerId) {
        const [roomsResponse, appointmentsResponse] = await Promise.all([
          roomApi.getRoomsByOwner(ownerId),
          appointmentApi.getOwnerAppointments(ownerId),
        ]);

        if (roomsResponse?.success) {
          setRooms(roomsResponse.data || []);
        }

        if (appointmentsResponse?.success) {
          setAppointments(appointmentsResponse.data || []);
        }
      }
    } finally {
      if (showLoading) {
        setLoading(false);
        setHasLoaded(true);
      }
    }
  };

  useEffect(() => {
    fetchData(true);

    const handleFocus = () => {
      if (hasLoaded) {
        fetchData(false);
      }
    };

    const intervalId = setInterval(() => {
      if (hasLoaded) {
        fetchData(false);
      }
    }, 60000);

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(intervalId);
    };
  }, [hasLoaded]);

  const toggleRoomAvailability = async (roomId: string, currentStatus: boolean) => {
    setUpdatingRoomId(roomId);
    try {
      const response = await roomApi.updateRoom(roomId, {
        isAvailable: !currentStatus,
      });

      if (response.success) {
        setRooms((prev) =>
          prev.map((room) =>
            room.id === roomId ? { ...room, isAvailable: !currentStatus } : room
          )
        );
        toast.success(!currentStatus ? "Room marked as available" : "Room marked as rented");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update room status");
    } finally {
      setUpdatingRoomId(null);
    }
  };

  const deleteRoom = async (roomId: string) => {
    const confirmed = await confirmToast({
      title: "Delete this room?",
      description: "This action cannot be undone.",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!confirmed) return;

    try {
      const response = await roomApi.deleteRoom(roomId);
      if (response.success) {
        setRooms((prev) => prev.filter((room) => room.id !== roomId));
        toast.success("Room deleted successfully");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete room");
    }
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "/placeholder-room.jpg";
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
    return `${apiBaseUrl}/public/room_images/${imagePath}`;
  };

  const pendingRooms = rooms.filter((room) => room.approvalStatus === "pending");
  const approvedRooms = rooms.filter((room) => room.approvalStatus === "approved");
  const availableRooms = rooms.filter((room) => room.isAvailable);
  const pendingRequests = appointments.filter((apt) => apt.status === "pending");
  const approvedRequests = appointments.filter((apt) => apt.status === "approved");

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Welcome, {userData?.fullName}!
          </h1>
          <p className="text-gray-600 mt-2 font-medium">Manage your properties and bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <div className="rounded-xl bg-white p-6 shadow-md hover:shadow-lg transition-all border border-gray-100 hover:border-blue-200 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Total Listings</p>
                <p className="text-3xl font-bold text-gray-900">{rooms.length}</p>
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
                <p className="text-3xl font-bold text-gray-900">{pendingRequests.length}</p>
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
                <p className="text-3xl font-bold text-gray-900">{approvedRequests.length}</p>
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
                <p className="text-3xl font-bold text-gray-900">{availableRooms.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Home className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>

         {/* My Listings Section  */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Listings</h2>
              <p className="text-gray-600 text-sm mt-1">Manage and view all your property listings</p>
            </div>
            <Link
              href="/owner/add-room"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-linear-to-r from-blue-600 to-blue-700 text-white font-medium hover:shadow-lg transition-all hover:from-blue-700 hover:to-blue-800"
            >
              <Plus size={18} />
              Add Room
            </Link>
          </div>

          {/* Rooms Grid or Empty State */}
          {loading ? (
            <div className="rounded-xl bg-white border border-gray-100 p-8 shadow-md text-center">
              <p className="text-gray-600">Loading rooms...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="rounded-xl bg-white border border-gray-100 p-8 shadow-md text-center hover:shadow-lg transition-shadow">
              <div className="bg-linear-to-r from-blue-50 to-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Home className="text-blue-600" size={32} />
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-2">No rooms available</p>
              <p className="text-sm text-gray-600 mb-4">
                Start by adding your first room listing to get started.
              </p>
              <Link
                href="/owner/add-room"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-linear-to-r from-blue-600 to-blue-700 text-white font-medium hover:shadow-lg transition-all hover:from-blue-700 hover:to-blue-800"
              >
                <Plus size={18} />
                Add Your First Room
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => {
                const roomId = getRoomId(room as Room & { _id?: string });
                return (
                <div
                  key={roomId}
                  className="rounded-xl bg-white border border-gray-100 shadow-md hover:shadow-xl transition-all overflow-hidden"
                >
                  {/* Room Image */}
                  <div className="relative h-48">
                    <img
                      src={getImageUrl(room.images[0])}
                      alt={room.roomTitle}
                      className="w-full h-full object-cover"
                    />
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          room.isAvailable
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {room.isAvailable ? "Available" : "Rented"}
                      </span>
                    </div>
                  </div>

                  {/* Room Details */}
                  <div className="p-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      {room.roomTitle}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">
                      {room.location}
                    </p>

                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-bold text-gray-900">
                        NPR {room.monthlyPrice.toLocaleString()}/month
                      </p>
                    </div>

                    <div className="flex items-center gap-4 mb-3">
                      <button
                        onClick={() => router.push(`/owner/edit-room/${roomId}`)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => deleteRoom(roomId)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => toggleRoomAvailability(roomId, room.isAvailable)}
                      disabled={updatingRoomId === roomId}
                      className={`w-full py-2 rounded-lg font-medium text-white text-sm transition-all ${
                        room.isAvailable
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-blue-500 hover:bg-blue-600"
                      } disabled:opacity-50`}
                    >
                      {updatingRoomId === room.id
                        ? "Updating..."
                        : room.isAvailable
                        ? "Mark as Rented"
                        : "Mark as Available"}
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-white py-6 mt-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 text-sm font-medium">© 2025 RentEasy. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
