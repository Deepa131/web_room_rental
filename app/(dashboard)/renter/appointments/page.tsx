"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { appointmentApi, Appointment } from "@/lib/api/appointment";
import { Calendar, Clock, Edit, Trash2, MapPin } from "lucide-react";
import { getUserData } from "@/lib/cookie";

const getImageUrl = (imagePath: string) => {
  if (!imagePath) return "/placeholder-room.jpg";
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
  return `${apiBaseUrl}/public/room_images/${imagePath}`;
};

const statusColors = {
  pending: "bg-amber-500",
  confirmed: "bg-green-500",
  approved: "bg-lime-500",
  rejected: "bg-red-500",
  completed: "bg-blue-500",
  cancelled: "bg-red-500",
};

const statusTextColors = {
  pending: "text-amber-900",
  confirmed: "text-green-900",
  approved: "text-lime-900",
  completed: "text-blue-900",
  cancelled: "text-red-900",
};

const getAppointmentId = (appointment: Appointment & { _id?: string }) =>
  appointment.id || appointment._id || "";

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string>("");
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [editFormData, setEditFormData] = useState({
    appointmentDate: "",
    appointmentTime: "",
    message: "",
  });

  useEffect(() => {
    // Get user data from cookie
    const fetchUserAndAppointments = async () => {
      try {
        // Get user data from cookie by calling server action or parsing from client
        const userDataStr = document.cookie
          .split("; ")
          .find((row) => row.startsWith("user_data="))
          ?.split("=")[1];
        
        if (userDataStr) {
          const userData = JSON.parse(decodeURIComponent(userDataStr));
          setUserId(userData._id);
          fetchAppointments(userData._id);
        } else {
          setError("User not authenticated");
          setLoading(false);
        }
      } catch (err) {
        console.error("Error getting user data:", err);
        setError("Failed to get user information");
        setLoading(false);
      }
    };

    fetchUserAndAppointments();
  }, []);

  const fetchAppointments = async (renterId: string) => {
    try {
      setLoading(true);
      const response = await appointmentApi.getMyAppointments(renterId);
      if (response?.success) {
        setAppointments(response.data || []);
      } else {
        setError(response?.message || "Failed to load appointments");
      }
    } catch (err: any) {
      console.error("Error fetching appointments:", err);
      setError(err?.response?.data?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to delete this appointment?")) {
      return;
    }

    try {
      const response = await appointmentApi.cancelAppointment(appointmentId);
      if (response?.success) {
        setAppointments((prev) =>
          prev.filter((apt) => getAppointmentId(apt as Appointment & { _id?: string }) !== appointmentId)
        );
        alert("Appointment deleted successfully");
      } else {
        alert(response?.message || "Failed to delete appointment");
      }
    } catch (err: any) {
      console.error("Error deleting appointment:", err);
      alert(err?.response?.data?.message || "Failed to delete appointment");
    }
  };

  const handleEdit = (appointment: Appointment) => {
    // Format date for input field (YYYY-MM-DD)
    const formattedDate = new Date(appointment.appointmentDate).toISOString().split("T")[0];
    
    setEditingAppointment(appointment);
    setEditFormData({
      appointmentDate: formattedDate,
      appointmentTime: appointment.appointmentTime,
      message: appointment.message || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingAppointment(null);
    setEditFormData({
      appointmentDate: "",
      appointmentTime: "",
      message: "",
    });
  };

  const handleSaveEdit = async () => {
    const appointmentId = editingAppointment
      ? getAppointmentId(editingAppointment as Appointment & { _id?: string })
      : "";

    if (!appointmentId) return;

    try {
      const response = await appointmentApi.updateAppointment(appointmentId, editFormData);
      
      if (response?.success) {
        // Update the appointments list with the updated data
        setAppointments((prev) =>
          prev.map((apt) =>
            getAppointmentId(apt as Appointment & { _id?: string }) === appointmentId
              ? { ...apt, ...editFormData, appointmentDate: editFormData.appointmentDate }
              : apt
          )
        );
        handleCancelEdit();
        alert("Appointment updated successfully");
      } else {
        alert(response?.message || "Failed to update appointment");
      }
    } catch (err: any) {
      console.error("Error updating appointment:", err);
      alert(err?.response?.data?.message || "Failed to update appointment");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const capitalizeStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
          <p className="text-gray-600">Track your room viewing schedules</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Appointments List */}
        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg shadow-sm">
            <Calendar className="w-20 h-20 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No appointments yet</h3>
            <p className="text-gray-500 mb-6">Book your first appointment to see it here</p>
            <button
              onClick={() => router.push("/renter/dashboard")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Browse Rooms
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {appointments.map((appointment) => (
              <div
                key={getAppointmentId(appointment as Appointment & { _id?: string })}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
              >
                <div className="relative flex flex-col sm:flex-row">
                  {/* Room Image */}
                  <div className="w-full sm:w-32 h-40 sm:h-auto bg-gray-200 flex items-center justify-center shrink-0">
                    {appointment.room?.images?.[0] ? (
                      <img
                        src={getImageUrl(appointment.room.images[0])}
                        alt={appointment.room.roomTitle}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <MapPin className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Status Badge - Positioned at top right */}
                  <div className="absolute top-3 right-3 z-10">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold text-white ${
                        statusColors[appointment.status as keyof typeof statusColors] || "bg-gray-500"
                      }`}
                    >
                      {capitalizeStatus(appointment.status)}
                    </span>
                  </div>

                  {/* Appointment Details */}
                  <div className="flex-1 p-4 sm:p-5">
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {appointment.room?.roomTitle || "Room Appointment"}
                      </h3>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(appointment.appointmentDate)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>{appointment.appointmentTime}</span>
                        </div>
                      </div>
                    </div>

                    {appointment.message && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {appointment.message}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-2">
                      {appointment.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleEdit(appointment)}
                            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(
                                getAppointmentId(appointment as Appointment & { _id?: string })
                              )
                            }
                            className="flex items-center gap-1.5 text-red-600 hover:text-red-700 font-medium text-sm transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Cancel</span>
                          </button>
                        </>
                      )}

                      {(appointment.status === "approved" || appointment.status === "rejected") && (
                        <button
                          onClick={() =>
                            handleDelete(
                              getAppointmentId(appointment as Appointment & { _id?: string })
                            )
                          }
                          className="flex items-center gap-1.5 text-gray-600 hover:text-gray-700 font-medium text-sm transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {editingAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Appointment</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={editFormData.appointmentDate}
                    onChange={(e) =>
                      setEditFormData((prev) => ({ ...prev, appointmentDate: e.target.value }))
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={editFormData.appointmentTime}
                    onChange={(e) =>
                      setEditFormData((prev) => ({ ...prev, appointmentTime: e.target.value }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    value={editFormData.message}
                    onChange={(e) =>
                      setEditFormData((prev) => ({ ...prev, message: e.target.value }))
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Any special requirements..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
