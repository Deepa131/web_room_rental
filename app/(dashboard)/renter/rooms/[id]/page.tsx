"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft, 
  Play, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  CheckCircle2,
  BadgeCheck,
  Home,
  X
} from "lucide-react";
import { roomApi } from "@/lib/api/room";
import { appointmentApi, Appointment } from "@/lib/api/appointment";
import RouteDisplay from "@/app/(dashboard)/renter/_components/RouteDisplay";
import { getCachedUserLocation } from "@/lib/services/locationService";

const NavigationContainer = dynamic(
  () => import("@/app/(dashboard)/renter/_components/NavigationContainer"),
  { ssr: false }
);

const getImageUrl = (imagePath: string) => {
  if (!imagePath) return "/placeholder-room.jpg";
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
  return `${apiBaseUrl}/public/room_images/${imagePath}`;
};

const getVideoUrl = (videoPath: string) => {
  if (!videoPath) return "";
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
  return `${apiBaseUrl}/public/room_videos/${videoPath}`;
};

export default function RenterRoomDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState<any>(null);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [existingAppointments, setExistingAppointments] = useState<Appointment[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [showNavigation, setShowNavigation] = useState(false);

  useEffect(() => {
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

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const userDataStr = document.cookie
          .split("; ")
          .find((row) => row.startsWith("user_data="))
          ?.split("=")[1];

        if (!userDataStr) return;

        const parsedUserData = JSON.parse(decodeURIComponent(userDataStr));
        setUserData(parsedUserData);
        const appointmentsResponse = await appointmentApi.getMyAppointments(parsedUserData._id);
        if (appointmentsResponse?.success) {
          setExistingAppointments(appointmentsResponse.data || []);
        }
      } catch (err) {
        console.error("Error fetching appointments:", err);
      }
    };

    fetchAppointments();
  }, [roomId]);

  const mediaItems = useMemo(() => {
    if (!room) return [] as { type: "image" | "video"; src: string }[];
    const images = (room.images || []).map((img: string) => ({
      type: "image" as const,
      src: getImageUrl(img),
    }));
    const videos = (room.videos || []).map((vid: string) => ({
      type: "video" as const,
      src: getVideoUrl(vid),
    }));
    return [...images, ...videos];
  }, [room]);

  const currentMedia = mediaItems[mediaIndex];

  const ownerName = room?.ownerId?.fullName || room?.ownerName || "Owner";
  const ownerPhone = room?.ownerContactNumber || "N/A";
  const roomType =
    typeof room?.roomType === "string"
      ? room.roomType
      : room?.roomType?.typeName || "N/A";

  const hasExistingAppointment = useMemo(() => {
    return existingAppointments.some(
      (apt) =>
        apt.roomId === roomId &&
        (apt.status === "pending"
          || apt.status === "confirmed"
          || apt.status === "approved"
          || apt.status === "completed")
    );
  }, [existingAppointments, roomId]);

  const handlePrev = () => {
    if (!mediaItems.length) return;
    setIsPlaying(false);
    setMediaIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
  };

  const handleNext = () => {
    if (!mediaItems.length) return;
    setIsPlaying(false);
    setMediaIndex((prev) => (prev + 1) % mediaItems.length);
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
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-amber-50/40">
      {/* Decorative background patterns */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute top-60 -left-40 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
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
            <span>Back to Listings</span>
          </button>
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/30">
            <Home size={14} />
            Room Details
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          {/* Main Content Section - Media Gallery */}
          <div className="space-y-4">
            {/* Media Gallery */}
            <div className="group rounded-3xl bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="relative">
                <div className="h-72 sm:h-[440px] bg-gradient-to-br from-gray-100 to-gray-200">
                  {currentMedia?.type === "video" ? (
                    <div className="relative h-full">
                      {isPlaying ? (
                        <video
                          className="w-full h-full object-cover"
                          src={currentMedia.src}
                          controls
                          autoPlay
                          onEnded={() => setIsPlaying(false)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                          <button
                            type="button"
                            onClick={() => setIsPlaying(true)}
                            className="group inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white text-gray-900 font-semibold shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                          >
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white group-hover:bg-blue-700 transition-colors">
                              <Play size={18} fill="currentColor" />
                            </div>
                            <span>Play Video</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <img
                      src={currentMedia?.src || "/placeholder-room.jpg"}
                      alt={room.roomTitle}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>

                {/* Navigation buttons */}
                {mediaItems.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/95 backdrop-blur-sm text-gray-700 flex items-center justify-center shadow-xl hover:bg-white hover:scale-110 transition-all"
                      aria-label="Previous media"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/95 backdrop-blur-sm text-gray-700 flex items-center justify-center shadow-xl hover:bg-white hover:scale-110 transition-all"
                      aria-label="Next media"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}

                {/* Status badge */}
                <div className="absolute top-5 right-5 flex flex-col gap-2">
                  <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg backdrop-blur-sm flex items-center gap-1">
                    <CheckCircle2 size={14} />
                    Available
                  </span>
                </div>

                {/* Media counter */}
                {mediaItems.length > 0 && (
                  <div className="absolute bottom-5 left-5 rounded-2xl bg-black/60 backdrop-blur-md px-4 py-2 text-xs font-semibold text-white">
                    {mediaIndex + 1} / {mediaItems.length}
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail strip */}
            {mediaItems.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {mediaItems.map((media, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setMediaIndex(idx);
                      setIsPlaying(false);
                    }}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      idx === mediaIndex
                        ? "border-blue-500 shadow-lg scale-105"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {media.type === "video" ? (
                      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                        <Play size={16} className="text-white" fill="currentColor" />
                      </div>
                    ) : (
                      <img src={media.src} alt="" className="w-full h-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-5 lg:sticky lg:top-8 lg:self-start">
            {/* Main info card */}
            <div className="rounded-3xl bg-gradient-to-br from-white to-blue-50/30 backdrop-blur-sm border border-gray-200/50 shadow-xl p-6 space-y-5">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                    {room.roomTitle}
                  </h1>
                  <div className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-2 py-1 text-blue-50">
                    <BadgeCheck size={14} />
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} className="text-blue-500 flex-shrink-0" />
                    <span>{room.location}</span>
                  </div>
                  
                  {/* Location distance inline */}
                  {room.locationCoords && (
                    <div className="pl-6">
                      <RouteDisplay
                        roomLocation={room.locationCoords}
                        roomAddress={room.location}
                        userId={userData?._id}
                        onShowNavigation={() => setShowNavigation(true)}
                      />
                    </div>
                  )}
                </div>

                <div className="inline-flex items-baseline gap-2 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 px-5 py-3 shadow-lg shadow-blue-500/30">
                  <span className="text-2xl font-bold text-white">
                    NPR {room.monthlyPrice?.toLocaleString()}
                  </span>
                  <span className="text-blue-100 text-sm font-medium">/month</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700">
                  <Home size={14} />
                  {roomType}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md">
                  <BadgeCheck size={14} />
                  Verified
                </span>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <h2 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <div className="w-1 h-4 bg-blue-600 rounded-full" />
                  About This Room
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {room.description || "No description provided."}
                </p>
              </div>
            </div>

            {/* Owner card */}
            <div className="rounded-3xl bg-gradient-to-br from-white to-slate-50 backdrop-blur-sm border border-gray-200/50 shadow-xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-5 bg-gradient-to-b from-blue-600 to-blue-700 rounded-full" />
                <h2 className="text-sm font-bold text-gray-900">Contact Owner</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                    <User size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{ownerName}</p>
                    <p className="text-xs text-gray-600">Property Owner</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-green-50 border border-green-100 hover:bg-green-100 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-md">
                    <Phone size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{ownerPhone}</p>
                    <p className="text-xs text-gray-600">Available for inquiries</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action button */}
            <button
              type="button"
              onClick={() => {
                if (hasExistingAppointment) {
                  alert("You already have an appointment for this room.");
                  return;
                }
                router.push(`/renter/rooms/${roomId}/book-appointment`);
              }}
              disabled={hasExistingAppointment}
              className={`group w-full py-4 rounded-2xl font-bold text-white transition-all shadow-xl shadow-blue-500/40 flex items-center justify-center gap-2 ${
                hasExistingAppointment
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 hover:from-blue-700 hover:via-blue-800 hover:to-blue-700 hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-[1.02]"
              }`}
            >
              <Calendar size={20} />
              <span>
                {hasExistingAppointment ? "Appointment Already Booked" : "Book Appointment"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Modal Overlay */}
      {showNavigation && room.locationCoords && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Background overlay with opacity */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowNavigation(false)}
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-xl">
                  <MapPin size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Navigation</h3>
                  <p className="text-sm text-gray-600">{room.location}</p>
                </div>
              </div>
              <button
                onClick={() => setShowNavigation(false)}
                className="p-2 hover:bg-white/80 rounded-xl transition-colors"
                aria-label="Close navigation"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Navigation Container */}
            <div className="overflow-auto max-h-[calc(90vh-80px)]">
              {(() => {
                const userLocation = getCachedUserLocation();
                return userLocation ? (
                  <NavigationContainer
                    userLocation={userLocation}
                    roomLocation={room.locationCoords}
                    roomAddress={room.location}
                  />
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-gray-600 font-medium">Please enable location to use navigation</p>
                    <p className="text-sm text-gray-500 mt-2">Click &ldquo;Show distance &amp; route&rdquo; in the details panel to enable location</p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
