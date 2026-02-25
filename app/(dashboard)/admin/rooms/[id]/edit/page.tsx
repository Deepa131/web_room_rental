"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { roomApi, RoomType } from "@/lib/api/room";
import { X, Loader2, Image as ImageIcon, Video } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminEditRoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [fetchingRoom, setFetchingRoom] = useState(true);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideos, setUploadingVideos] = useState(false);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);

  const [formData, setFormData] = useState({
    ownerContactNumber: "",
    roomTitle: "",
    monthlyPrice: "",
    location: "",
    roomType: "",
    description: "",
    images: [] as string[],
    videos: [] as string[],
  });

  const [previewImages, setPreviewImages] = useState<{ file?: File; preview: string; isExisting?: boolean }[]>([]);
  const [previewVideos, setPreviewVideos] = useState<{ file?: File; preview: string; isExisting?: boolean }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const roomTypesResponse = await roomApi.getRoomTypes();
        if (roomTypesResponse.success) {
          const activeTypes = roomTypesResponse.data.filter((rt: RoomType) => rt.status === "active");
          setRoomTypes(activeTypes);
        }

        const roomResponse = await roomApi.getRoomById(roomId);
        if (roomResponse.success) {
          const room = roomResponse.data;
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
          
          setFormData({
            ownerContactNumber: room.ownerContactNumber || "",
            roomTitle: room.roomTitle || "",
            monthlyPrice: room.monthlyPrice?.toString() || "",
            location: room.location || "",
            roomType:
              typeof room.roomType === "string"
                ? room.roomType
                : room.roomType?._id || room.roomType?.id || "",
            description: room.description || "",
            images: room.images || [],
            videos: room.videos || [],
          });

          if (room.images && room.images.length > 0) {
            setPreviewImages(room.images.map((img: string) => ({
              preview: `${apiBaseUrl}/public/room_images/${img}`,
              isExisting: true,
            })));
          }

          if (room.videos && room.videos.length > 0) {
            setPreviewVideos(room.videos.map((vid: string) => ({
              preview: `${apiBaseUrl}/public/room_videos/${vid}`,
              isExisting: true,
            })));
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load room details");
      } finally {
        setFetchingRoom(false);
      }
    };
    fetchData();
  }, [roomId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "ownerContactNumber") {
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length > 10) return;
      setFormData((prev) => ({ ...prev, [name]: digitsOnly }));
      return;
    }
    if (name === "monthlyPrice") {
      const normalized = value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({ ...prev, [name]: normalized }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploadingImages(true);
    const uploadedImages: string[] = [];
    const previews: { file: File; preview: string; isExisting: boolean }[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const response = await roomApi.uploadImage(file);
        if (response.success) {
          uploadedImages.push(response.data);
          previews.push({
            file,
            preview: URL.createObjectURL(file),
            isExisting: false,
          });
        }
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedImages],
      }));
      setPreviewImages((prev) => [...prev, ...previews]);
      toast.success(`${uploadedImages.length} image(s) uploaded successfully`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to upload image");
    } finally {
      setUploadingImages(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploadingVideos(true);
    const uploadedVideos: string[] = [];
    const previews: { file: File; preview: string; isExisting: boolean }[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const response = await roomApi.uploadVideo(file);
        if (response.success) {
          uploadedVideos.push(response.data);
          previews.push({
            file,
            preview: URL.createObjectURL(file),
            isExisting: false,
          });
        }
      }

      setFormData((prev) => ({
        ...prev,
        videos: [...prev.videos, ...uploadedVideos],
      }));
      setPreviewVideos((prev) => [...prev, ...previews]);
      toast.success(`${uploadedVideos.length} video(s) uploaded successfully`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to upload video");
    } finally {
      setUploadingVideos(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index),
    }));
    setPreviewVideos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.roomTitle || !formData.monthlyPrice || !formData.location || !formData.roomType) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.ownerContactNumber.trim()) {
      toast.error("Contact number is required");
      return;
    } else if (!/^(96|97|98)\d{8}$/.test(formData.ownerContactNumber)) {
      toast.error("Invalid phone number format.");
      return;
    }

    const priceValue = Number(formData.monthlyPrice);
    if (!Number.isFinite(priceValue)) {
      toast.error("Invalid monthly price");
      return;
    }
    if (priceValue < 500) {
      toast.error("Monthly price must be at least NPR 500");
      return;
    }
    if (priceValue > 1000000) {
      toast.error("Monthly price must be NPR 1,000,000 or less");
      return;
    }

    setLoading(true);
    try {
      const response = await roomApi.updateRoom(roomId, {
        ownerContactNumber: formData.ownerContactNumber,
        roomTitle: formData.roomTitle,
        monthlyPrice: priceValue,
        location: formData.location,
        roomType: formData.roomType,
        description: formData.description,
        images: formData.images,
        videos: formData.videos,
      } as const);

      if (response.success) {
        toast.success("Room updated successfully!");
        window.location.href = "/admin/rooms";
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update room");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingRoom) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600 mt-4">Loading room details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Edit Room
          </h1>
          <p className="text-gray-600 mt-2">Update room details</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Room Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="roomTitle"
                  value={formData.roomTitle}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 1BHK room in Kapan"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Monthly Price (NPR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="monthlyPrice"
                  value={formData.monthlyPrice}
                  onChange={handleInputChange}
                  min={1000}
                  max={1000000}
                  inputMode="numeric"
                  required
                  placeholder="e.g., 15000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Kathmandu"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Room Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="roomType"
                  value={formData.roomType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select Room Type</option>
                  {roomTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.typeName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Owner Contact Number
                </label>
                <input
                  type="tel"
                  name="ownerContactNumber"
                  value={formData.ownerContactNumber}
                  onChange={handleInputChange}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  placeholder="e.g., 98XXXXXXXX"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe the room, amenities, and rules"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Room Images</h2>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                <ImageIcon className="w-4 h-4" />
                Upload Images
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              {uploadingImages && <span className="text-sm text-gray-600">Uploading...</span>}
            </div>

            {previewImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {previewImages.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img src={img.preview} alt="Room preview" className="w-full h-32 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 bg-white/90 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove image">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Video className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Room Videos</h2>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                <Video className="w-4 h-4" />
                Upload Videos
                <input type="file" multiple accept="video/*" onChange={handleVideoUpload} className="hidden" />
              </label>
              {uploadingVideos && <span className="text-sm text-gray-600">Uploading...</span>}
            </div>

            {previewVideos.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {previewVideos.map((vid, idx) => (
                  <div key={idx} className="relative group">
                    <video src={vid.preview} controls className="w-full h-48 rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removeVideo(idx)}
                      className="absolute top-2 right-2 bg-white/90 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove video">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60">
              {loading ? "Updating..." : "Update Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
