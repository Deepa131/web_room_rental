"use client";

import { useEffect, useMemo, useState } from "react";
import { appointmentApi, Appointment } from "@/lib/api/appointment";
import { Calendar, Clock, Eye, CheckCircle, XCircle, Trash2, MapPin } from "lucide-react";

const getImageUrl = (imagePath: string) => {
  if (!imagePath) return "/placeholder-room.jpg";
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
  return `${apiBaseUrl}/public/room_images/${imagePath}`;
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-500",
  approved: "bg-lime-500",
  rejected: "bg-red-500",
  completed: "bg-blue-500",
};

const getAppointmentId = (appointment: Appointment & { _id?: string }) =>
  appointment.id || appointment._id || "";

export default function OwnerRequestsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Appointment | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const userDataStr = localStorage.getItem("user_data");
      const user = userDataStr ? JSON.parse(userDataStr) : null;
      if (!user?._id) {
        setError("User not authenticated");
        return;
      }

      const response = await appointmentApi.getOwnerAppointments(user._id);
      if (response?.success) {
        setAppointments(response.data || []);
        setError("");
      } else {
        setError(response?.message || "Failed to load requests");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusUpdate = async (id: string, status: "approved" | "rejected") => {
    try {
      const response = await appointmentApi.updateAppointmentStatus(id, status);
      if (response?.success) {
        setAppointments((prev) =>
          prev.map((apt) =>
            getAppointmentId(apt as Appointment & { _id?: string }) === id
              ? { ...apt, status }
              : apt
          )
        );
      } else {
        alert(response?.message || "Failed to update appointment");
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update appointment");
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Remove this request?")) return;
    try {
      const response = await appointmentApi.cancelAppointment(id);
      if (response?.success) {
        setAppointments((prev) =>
          prev.filter(
            (apt) => getAppointmentId(apt as Appointment & { _id?: string }) !== id
          )
        );
      } else {
        alert(response?.message || "Failed to remove request");
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to remove request");
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

  const isDecisionMade = (status: string) =>
    status === "approved" || status === "rejected";

  const getStatusLabel = (status?: string) => {
    if (!status) return "pending";
    return status;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointment Requests</h1>
              <p className="text-gray-600">Manage viewing appointments</p>
            </div>
            <button
              type="button"
              onClick={fetchAppointments}
              className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg shadow-sm">
            <Calendar className="w-20 h-20 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Not booked yet</h3>
            <p className="text-gray-500">Requests will appear here once renters book</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {appointments.map((appointment) => (
              <div
                key={getAppointmentId(appointment as Appointment & { _id?: string })}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
              >
                <div className="relative flex flex-col sm:flex-row">
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

                  <div className="absolute top-3 right-3 z-10">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold text-white ${
                        statusColors[getStatusLabel(appointment.status)] || "bg-gray-500"
                      }`}
                    >
                      {getStatusLabel(appointment.status).charAt(0).toUpperCase() +
                        getStatusLabel(appointment.status).slice(1)}
                    </span>
                  </div>

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

                    <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
                      <span className="font-medium">{appointment.renterName}</span>
                      <span>•</span>
                      <span>{appointment.renterEmail}</span>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        onClick={() => setSelected(appointment)}
                        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>

                      {appointment.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleStatusUpdate(
                                getAppointmentId(appointment as Appointment & { _id?: string }),
                                "approved"
                              )
                            }
                            className="inline-flex items-center gap-1.5 text-green-600 hover:text-green-700 font-medium text-sm"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(
                                getAppointmentId(appointment as Appointment & { _id?: string }),
                                "rejected"
                              )
                            }
                            className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-700 font-medium text-sm"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </>
                      )}

                      {isDecisionMade(appointment.status) && (
                        <button
                          onClick={() =>
                            handleRemove(
                              getAppointmentId(appointment as Appointment & { _id?: string })
                            )
                          }
                          className="inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-700 font-medium text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Appointment Details</h2>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex justify-between">
                <span className="font-medium">Renter</span>
                <span>{selected.renterName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Email</span>
                <span>{selected.renterEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Phone</span>
                <span>{selected.renterPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Date</span>
                <span>{formatDate(selected.appointmentDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Time</span>
                <span>{selected.appointmentTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Status</span>
                <span>{selected.status}</span>
              </div>
              <div>
                <div className="font-medium">Message</div>
                <div className="text-gray-600 mt-1">
                  {selected.message || "-"}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelected(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
