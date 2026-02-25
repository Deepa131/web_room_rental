"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, ArrowLeft, Play, User, Phone,MapPin,CheckCircle2,BadgeCheck,Home } from "lucide-react";
import { roomApi } from "@/lib/api/room";

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

export default function AdminRoomDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState<any>(null);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

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
    <div className="w-full min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="group inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
            <div className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center group-hover:border-blue-400 group-hover:bg-blue-50 transition-all">
              <ArrowLeft size={16} />
            </div>
            <span>Back to Rooms</span>
          </button>
          <div className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md">
            <Home size={14} />
            Room Details
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-4">
            <div className="rounded-lg bg-white border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
              <div className="relative">
                <div className="h-72 sm:h-110 bg-linear-to-br from-gray-200 to-gray-300">
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
                        <div className="w-full h-full flex items-center justify-center bg-gray-900">
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

                <div className="absolute top-5 right-5 flex flex-col gap-2">
                  <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-linear-to-r from-green-500 to-emerald-500 text-white shadow-lg backdrop-blur-sm flex items-center gap-1">
                    <CheckCircle2 size={14} />
                    Available
                  </span>
                </div>

                {mediaItems.length > 0 && (
                  <div className="absolute bottom-5 left-5 rounded-2xl bg-black/60 backdrop-blur-md px-4 py-2 text-xs font-semibold text-white">
                    {mediaIndex + 1} / {mediaItems.length}
                  </div>
                )}
              </div>
            </div>

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
                    className={`relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
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

          <div className="space-y-5 lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-3xl bg-linear-to-br from-white to-blue-50/30 backdrop-blur-sm border border-gray-200/50 shadow-xl p-6 space-y-5">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                    {room.roomTitle}
                  </h1>
                  <div className="inline-flex items-center gap-1 rounded-xl bg-linear-to-r from-blue-600 to-blue-700 px-2 py-1 text-blue-50">
                    <BadgeCheck size={14} />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <MapPin size={16} className="text-blue-500" />
                  <span>{room.location}</span>
                </div>

                <div className="inline-flex items-baseline gap-2 rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 px-5 py-3 shadow-lg shadow-blue-500/30">
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
                <span className="inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-amber-400 to-orange-400 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md">
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

            <div className="rounded-3xl bg-linear-to-br from-white to-slate-50 backdrop-blur-sm border border-gray-200/50 shadow-xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-5 bg-linear-to-b from-blue-600 to-blue-700 rounded-full" />
                <h2 className="text-sm font-bold text-gray-900">Contact Owner</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                    <User size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{ownerName}</p>
                    <p className="text-xs text-gray-600">Property Owner</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 rounded-2xl bg-green-50 border border-green-100 hover:bg-green-100 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-md">
                    <Phone size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{ownerPhone}</p>
                    <p className="text-xs text-gray-600">Available for inquiries</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
