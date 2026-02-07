"use client";

import { useState, useRef, useEffect } from "react";

interface ProfilePictureSectionProps {
  fullName: string;
  email: string;
  profilePicture?: string;
  pendingImagePreview?: string | null;
  onImageUpdate?: (file: File, previewUrl: string) => void;
  onImageRemove?: () => void;
}

export default function ProfilePictureSection({
  fullName,
  email,
  profilePicture,
  pendingImagePreview,
  onImageUpdate,
  onImageRemove,
}: ProfilePictureSectionProps) {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Check if we have a valid image
  const isValidImage = (img: string | null | undefined): boolean => {
    if (!img) return false;
    if (typeof img !== 'string') return false;
    const trimmed = img.trim();
    if (trimmed === '') return false;
    if (trimmed === 'null' || trimmed === 'undefined') return false;
    // Treat default profile picture as "no image"
    if (trimmed === 'default-profile.png' || trimmed.includes('default')) return false;
    return true;
  };
  
  // Initialize image state - runs only on client
  useEffect(() => {
    // Debug: log what we're receiving
    console.log("ProfilePictureSection - pendingImagePreview:", pendingImagePreview);
    console.log("ProfilePictureSection - profilePicture:", profilePicture);
    
    if (isValidImage(pendingImagePreview)) {
      console.log("Setting image from pendingImagePreview");
      setImage(pendingImagePreview!);
    } else if (isValidImage(profilePicture)) {
      console.log("Setting image from profilePicture");
      let imageUrl = profilePicture!;
      if (!imageUrl.startsWith('/public/') && !imageUrl.startsWith('http')) {
        imageUrl = `/public/${imageUrl.replace(/^\//, '')}`;
      }
      if (!imageUrl.startsWith('http')) {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050';
        imageUrl = `${apiBaseUrl}${imageUrl}`;
      }
      setImage(imageUrl);
    } else {
      console.log("Setting image to null - no valid image");
      setImage(null);
    }
  }, [pendingImagePreview, profilePicture]);

  const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') return "U";
    const cleanName = name.trim();
    if (!cleanName) return "U";
    
    const parts = cleanName.split(/\s+/);
    
    // If only one word, return first letter
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    
    // Return first letter of FIRST word + first letter of LAST word only
    const first = parts[0].charAt(0).toUpperCase();
    const last = parts[parts.length - 1].charAt(0).toUpperCase();
    
    return first + last;
  };

  const handleChoosePhoto = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = () => {
    setImage(null);
    onImageRemove?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setLoading(true);

    try {
      // Create preview URL for local display only
      const reader = new FileReader();
      reader.onloadend = () => {
        const previewUrl = reader.result as string;
        setImage(previewUrl);
        
        // Pass the File object and preview URL to parent
        // This will NOT save to backend yet - only when Update Profile is clicked
        onImageUpdate?.(file, previewUrl);
        
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Failed to preview image:", error);
      alert("Failed to load image preview. Please try again.");
      setLoading(false);
    } finally {
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const hasValidImage = isValidImage(image);

  return (
    <div className="mb-8">
      <div className="flex flex-col items-center">
        {/* Profile Picture Circle */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-3 border-gray-700 shadow-lg overflow-hidden">
            {hasValidImage ? (
              <img
                key={image}
                src={image!}
                alt={fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-white">
                {getInitials(fullName)}
              </span>
            )}
          </div>

          {loading && (
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
              <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>

        {/* Photo Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            type="button"
            onClick={handleChoosePhoto}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Choose photo
          </button>
          {hasValidImage && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Remove photo
            </button>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={loading}
        />

        {/* User Info */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900">{fullName}</h3>
          <p className="text-gray-600 text-sm mt-1">{email}</p>
        </div>
      </div>
    </div>
  );
}
