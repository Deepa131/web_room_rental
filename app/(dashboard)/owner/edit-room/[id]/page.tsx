"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { roomApi, RoomType, Location } from "@/lib/api/room";
import { Home, X, Loader2, Image as ImageIcon, Video } from "lucide-react";
import { toast } from "react-hot-toast";
import LocationPicker from "../../_components/LocationPicker";

export default function EditRoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [fetchingRoom, setFetchingRoom] = useState(true);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideos, setUploadingVideos] = useState(false);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [userData, setUserData] = useState<{ role: string } | null>(null);

  const [formData, setFormData] = useState({
    ownerContactNumber: "",
    roomTitle: "",
    monthlyPrice: "",
    location: "",
    locationCoords: undefined as Location | undefined,
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
        const userDataStr = localStorage.getItem("user_data");
        const user = userDataStr ? JSON.parse(userDataStr) : null;
        setUserData(user);

        // Fetch room types
        const roomTypesResponse = await roomApi.getRoomTypes();
        if (roomTypesResponse.success) {
          const activeTypes = roomTypesResponse.data.filter((rt: RoomType) => rt.status === "active");
          setRoomTypes(activeTypes);
        }

        // Fetch room details
        const roomResponse = await roomApi.getRoomById(roomId);
        if (roomResponse.success) {
          const room = roomResponse.data;
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
          
          setFormData({
            ownerContactNumber: room.ownerContactNumber || "",
            roomTitle: room.roomTitle || "",
            monthlyPrice: room.monthlyPrice?.toString() || "",
            location: room.location || "",
            locationCoords: room.locationCoords
              ? { ...room.locationCoords, address: room.location }
              : undefined,
            roomType:
              typeof room.roomType === "string"
                ? room.roomType
                : room.roomType?._id || room.roomType?.id || "",
            description: room.description || "",
            images: room.images || [],
            videos: room.videos || [],
          });

          // Set preview images from existing data
          if (room.images && room.images.length > 0) {
            setPreviewImages(room.images.map((img: string) => ({
              preview: `${apiBaseUrl}/public/room_images/${img}`,
              isExisting: true,
            })));
          }

          // Set preview videos from existing data
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

  const handleLocationSelect = (location: Location, address: string) => {
    setFormData((prev) => ({
      ...prev,
      location: address,
      locationCoords: location,
    }));
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
      toast.error(error?.response?.data?.message || "Failed to upload images");
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
      toast.error(error?.response?.data?.message || "Failed to upload videos");
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
      toast.error("Phone number must start with 96, 97, or 98 and be 10 digits");
      return;
    }

    const priceValue = Number(formData.monthlyPrice);
    if (!Number.isFinite(priceValue)) {
      toast.error("Invalid monthly price");
      return;
    }
    if (priceValue < 1000) {
      toast.error("Monthly price must be at least NPR 1,000");
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
        locationCoords: formData.locationCoords,
        roomType: formData.roomType,
        description: formData.description,
        images: formData.images,
        videos: formData.videos,
      } as const);

      if (response.success) {
        toast.success("Room updated successfully!");
        window.location.href = "/owner/dashboard";
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
    <div className="min-h-screen bg-transparent text-gray-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Edit Room
          </h1>
          <p className="text-gray-700 mt-1">Update your property details</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
                  min={500}
                  max={1000000}
                  inputMode="numeric"
                  required
                  placeholder="e.g., 8000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <LocationPicker
                  onLocationSelect={handleLocationSelect}
                  title="Select Room Location"
                  userId={userData?._id}
                  defaultLocation={formData.locationCoords}
                  askForPermission={false}
                />
                {formData.location && (
                  <p className="text-xs text-gray-600 mt-2">
                    Current location: {formData.location}
                  </p>
                )}
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select room type</option>
                  {roomTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.typeName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Owner&apos;s Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="ownerContactNumber"
                  value={formData.ownerContactNumber}
                  onChange={handleInputChange}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  required
                  placeholder="e.g., 9841234567"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe your room, amenities, and any special features..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Images Upload */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Room Images</h2>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                id="images"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadingImages}
              />
              <label
                htmlFor="images"
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                {uploadingImages ? (
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-3" />
                ) : (
                  <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
                )}
                <p className="text-sm font-medium text-gray-800">
                  {uploadingImages ? "Uploading..." : "Click to upload more images"}
                </p>
                <p className="text-xs text-gray-600 mt-1">PNG, JPG, JPEG up to 10MB each</p>
              </label>
            </div>

            {previewImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {previewImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Videos Upload */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Room Videos (Optional)</h2>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                id="videos"
                accept="video/*"
                multiple
                onChange={handleVideoUpload}
                className="hidden"
                disabled={uploadingVideos}
              />
              <label
                htmlFor="videos"
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                {uploadingVideos ? (
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-3" />
                ) : (
                  <Video className="w-12 h-12 text-gray-400 mb-3" />
                )}
                <p className="text-sm font-medium text-gray-800">
                  {uploadingVideos ? "Uploading..." : "Click to upload more videos"}
                </p>
                <p className="text-xs text-gray-600 mt-1">MP4, MOV up to 50MB each</p>
              </label>
            </div>

            {previewVideos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {previewVideos.map((vid, index) => (
                  <div key={index} className="relative group">
                    <video
                      src={vid.preview}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeVideo(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:shadow-lg transition-all hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Updating Room...
                </>
              ) : (
                <>
                  <Home size={20} />
                  Update Room
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
