"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Room, roomApi } from "@/lib/api/room";
import { appointmentApi, Appointment } from "@/lib/api/appointment";
import { Calendar, Phone, ArrowLeft, Clock, User, Mail } from "lucide-react";
import { toast } from "react-hot-toast";

const getImageUrl = (imagePath: string) => {
  if (!imagePath) return "/placeholder-room.jpg";
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
  return `${apiBaseUrl}/public/room_images/${imagePath}`;
};

export default function BookAppointmentPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [existingAppointments, setExistingAppointments] = useState<Appointment[]>([]);

  const [formData, setFormData] = useState({
    renterName: "",
    renterEmail: "",
    renterPhone: "",
    appointmentDate: "",
    appointmentTime: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const getUserDataFromCookie = async () => {
      try {
        const userDataStr = document.cookie
          .split("; ")
          .find((row) => row.startsWith("user_data="))
          ?.split("=")[1];
        
        if (userDataStr) {
          const userData = JSON.parse(decodeURIComponent(userDataStr));
          setUserId(userData._id);
          // Pre-fill form with user data
          setFormData((prev) => ({
            ...prev,
            renterName: userData.fullName || "",
            renterEmail: userData.email || "",
          }));
          
          // Fetch existing appointments to check for duplicates
          const appointmentsResponse = await appointmentApi.getMyAppointments(userData._id);
          if (appointmentsResponse?.success) {
            setExistingAppointments(appointmentsResponse.data || []);
          }
          
        }
      } catch (err) {
        return err;
      }
    };

    getUserDataFromCookie();
    
    const fetchRoom = async () => {
      try {
        const response = await roomApi.getRoomById(roomId);
        if (response?.success) {
          setRoom(response.data);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [roomId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "renterPhone") {
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length > 10) return;
      setFormData((prev) => ({
        ...prev,
        [name]: digitsOnly,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.renterName.trim()) {
      newErrors.renterName = "Name is required";
    }
    if (!formData.renterEmail.trim()) {
      newErrors.renterEmail = "Email is required";
    } else if (!formData.renterEmail.includes("@")) {
      newErrors.renterEmail = "Please enter a valid email";
    }
    if (!formData.renterPhone.trim()) {
      newErrors.renterPhone = "Phone number is required";
    } else if (!/^(96|97|98)\d{8}$/.test(formData.renterPhone)) {
      newErrors.renterPhone = "Invalid phone number format.";
    }
    if (!formData.appointmentDate) {
      newErrors.appointmentDate = "Date is required";
    }
    if (!formData.appointmentTime) {
      newErrors.appointmentTime = "Time is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    // Check if user already has an appointment for this room
    const hasExistingAppointment = existingAppointments.some(
      (apt) => 
        apt.roomId === roomId && 
        (apt.status === "pending"
          || apt.status === "confirmed"
          || apt.status === "approved")
    );

    if (hasExistingAppointment) {
      toast.error(
        "You already have an appointment for this room."
      );
      return;
    }

    setSubmitting(true);
    try {
      const response = await appointmentApi.bookAppointment({
        roomId,
        ownerId: room?.ownerId || "",
        renterId: userId,
        renterName: formData.renterName,
        renterEmail: formData.renterEmail,
        renterPhone: formData.renterPhone,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        message: formData.message,
        status: "pending",
      });

      if (response?.success) {
        toast.success("Appointment booked successfully!");
        router.push("/renter/appointments");
      } else {
        toast.error(response?.message || "Failed to book appointment");
      }
    } catch (error: unknown) {
      const errorMessage = error?.toString() || "Error booking appointment";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-600">Loading room details...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-700 font-medium">Room not found.</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-transparent">
      {/* Decorative background patterns */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute top-60 -left-40 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="group inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-blue-300 group-hover:bg-blue-50 transition-all">
              <ArrowLeft size={16} />
            </div>
            <span>Back</span>
          </button>
          <div className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-blue-500 to-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/30">
            <Calendar size={14} />
            Book Appointment
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Room Card */}
          <div className="rounded-3xl bg-linear-to-br from-white to-blue-50/30 backdrop-blur-sm border border-gray-200/50 shadow-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Room Details</h2>
            
            <div className="rounded-2xl overflow-hidden mb-4 bg-gray-200">
              <img
                src={getImageUrl(room.images?.[0] || "")}
                alt={room.roomTitle}
                className="w-full h-48 object-cover"
              />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">{room.roomTitle}</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Phone size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Owner Contact</p>
                  <p className="font-semibold text-gray-900">{room.ownerContactNumber}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Calendar size={16} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Price</p>
                  <p className="font-semibold text-gray-900">NPR {room.monthlyPrice?.toLocaleString()}/month</p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="rounded-3xl bg-white border border-gray-200/50 shadow-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Your Information</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="renterName"
                    value={formData.renterName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      errors.renterName ? "border-red-500" : "border-gray-300"
                    } bg-white text-gray-900 placeholder:text-gray-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                  />
                </div>
                {errors.renterName && (
                  <p className="text-red-500 text-xs mt-1">{errors.renterName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="email"
                    name="renterEmail"
                    value={formData.renterEmail}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      errors.renterEmail ? "border-red-500" : "border-gray-300"
                    } bg-white text-gray-900 placeholder:text-gray-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                  />
                </div>
                {errors.renterEmail && (
                  <p className="text-red-500 text-xs mt-1">{errors.renterEmail}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="tel"
                    name="renterPhone"
                    value={formData.renterPhone}
                    onChange={handleChange}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    placeholder="98xxxxxxxx"
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      errors.renterPhone ? "border-red-500" : "border-gray-300"
                    } bg-white text-gray-900 placeholder:text-gray-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                  />
                </div>
                {errors.renterPhone && (
                  <p className="text-red-500 text-xs mt-1">{errors.renterPhone}</p>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Appointment Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="date"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      errors.appointmentDate ? "border-red-500" : "border-gray-300"
                    } bg-white text-gray-900 placeholder:text-gray-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                  />
                </div>
                {errors.appointmentDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.appointmentDate}</p>
                )}
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Appointment Time *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="time"
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      errors.appointmentTime ? "border-red-500" : "border-gray-300"
                    } bg-white text-gray-900 placeholder:text-gray-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                  />
                </div>
                {errors.appointmentTime && (
                  <p className="text-red-500 text-xs mt-1">{errors.appointmentTime}</p>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Message 
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Add any special requests..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl font-bold text-white bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                {submitting ? "Booking..." : "Confirm Appointment"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
