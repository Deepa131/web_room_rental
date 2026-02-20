"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { roomApi, RoomType, Location } from "@/lib/api/room";
import { Home, Upload, X, Loader2, Image as ImageIcon, Video } from "lucide-react";
import { toast } from "react-hot-toast";
import LocationPicker from "../_components/LocationPicker";

export default function AddRoomPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideos, setUploadingVideos] = useState(false);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [userData, setUserData] = useState<any>(null);

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

  const [previewImages, setPreviewImages] = useState<{ file: File; preview: string }[]>([]);
  const [previewVideos, setPreviewVideos] = useState<{ file: File; preview: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user data from localStorage (client-side)
        const userDataStr = localStorage.getItem('user_data');
        const user = userDataStr ? JSON.parse(userDataStr) : null;
        setUserData(user);

        console.log("Fetching room types from API...");
        const roomTypesResponse = await roomApi.getRoomTypes();
        console.log("Room types response:", roomTypesResponse);
        
        if (roomTypesResponse.success && roomTypesResponse.data) {
          const activeTypes = roomTypesResponse.data.filter((rt: RoomType) => rt.status === "active");
          console.log("Active room types:", activeTypes);
          setRoomTypes(activeTypes);
          if (activeTypes.length === 0) {
            toast.error("No room types available. Please contact admin to add room types.");
          }
        } else {
          console.error("Failed to load room types:", roomTypesResponse);
          toast.error("Failed to load room types");
        }
      } catch (error: any) {
        console.error("Error fetching room types:", error);
        console.error("Error details:", error.response?.data || error.message);
        toast.error(`Failed to load room types: ${error.response?.data?.message || error.message}`);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
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
    const previews: { file: File; preview: string }[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const response = await roomApi.uploadImage(file);
        if (response.success) {
          uploadedImages.push(response.data);
          previews.push({
            file,
            preview: URL.createObjectURL(file),
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
    const previews: { file: File; preview: string }[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const response = await roomApi.uploadVideo(file);
        if (response.success) {
          uploadedVideos.push(response.data);
          previews.push({
            file,
            preview: URL.createObjectURL(file),
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

    if (!formData.locationCoords) {
      toast.error("Please select a location on the map");
      return;
    }

    setLoading(true);
    try {
      const response = await roomApi.createRoom({
        ...formData,
        monthlyPrice: Number(formData.monthlyPrice),
      });

      if (response.success) {
        toast.success("Room added successfully!");
        // Force a full page reload to refresh the dashboard data
        window.location.href = "/owner/dashboard";
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Add New Room
          </h1>
          <p className="text-gray-700 mt-1">Fill in the details to list your property</p>
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
                />
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
                  {roomTypes.length > 0 ? (
                    roomTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.typeName}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Loading room types...</option>
                  )}
                </select>
                {roomTypes.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">No room types available. Please contact admin.</p>
                )}
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
                  {uploadingImages ? "Uploading..." : "Click to upload images"}
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
                  {uploadingVideos ? "Uploading..." : "Click to upload videos"}
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
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:shadow-lg transition-all hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Adding Room...
                </>
              ) : (
                <>
                  <Home size={20} />
                  Add Room
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
