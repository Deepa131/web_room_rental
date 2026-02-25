"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { appointmentApi, Appointment } from "@/lib/api/appointment";
import { Calendar, Clock, Edit, Trash2, MapPin } from "lucide-react";
import { toast } from "react-hot-toast";
import { confirmToast } from "@/lib/ui/toast";

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
        const userDataStr = document.cookie.split("; ").find((row) => row.startsWith("user_data="))?.split("=")[1];
        
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
      setError(err?.response?.data?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (appointmentId: string) => {
    const confirmed = await confirmToast({
      title: "Delete this appointment?",
      description: "This action cannot be undone.",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!confirmed) return;

    try {
      const response = await appointmentApi.cancelAppointment(appointmentId);
      if (response?.success) {
        setAppointments((prev) =>
          prev.filter((apt) => getAppointmentId(apt as Appointment & { _id?: string }) !== appointmentId)
        );
        toast.success("Appointment deleted successfully");
      } else {
        toast.error(response?.message || "Failed to delete appointment");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete appointment");
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
        toast.success("Appointment updated successfully");
      } else {
        toast.error(response?.message || "Failed to update appointment");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update appointment");
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
    <div className="min-h-screen bg-transparent">
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
          <div className="grid gap-3">
            {appointments.map((appointment) => (
              <div
                key={getAppointmentId(appointment as Appointment & { _id?: string })}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100"
              >
                <div className="flex gap-3 p-3">
                  {/* Room Image Thumbnail */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center shrink-0">
                    {appointment.room?.images?.[0] ? (
                      <img
                        src={getImageUrl(appointment.room.images[0])}
                        alt={appointment.room.roomTitle}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <MapPin className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Appointment Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="text-base font-semibold text-gray-900 truncate">
                        {appointment.room?.roomTitle || "Room Appointment"}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold text-white shrink-0 ${
                          statusColors[appointment.status as keyof typeof statusColors] || "bg-gray-500"
                        }`}
                      >
                        {capitalizeStatus(appointment.status)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2.5 text-xs text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(appointment.appointmentDate)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{appointment.appointmentTime}</span>
                      </div>
                    </div>

                    {appointment.message && (
                      <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                        {appointment.message}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      {appointment.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleEdit(appointment)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-xs transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(
                                getAppointmentId(appointment as Appointment & { _id?: string })
                              )
                            }
                            className="flex items-center gap-1 text-red-600 hover:text-red-700 font-medium text-xs transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
                          className="flex items-center gap-1 text-gray-600 hover:text-gray-700 font-medium text-xs transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
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
                    Message
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
