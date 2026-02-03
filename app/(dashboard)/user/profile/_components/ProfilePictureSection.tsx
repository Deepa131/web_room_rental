"use client";

import { useState, useRef } from "react";
import { Pencil } from "lucide-react";
import { updateProfilePicture } from "@/lib/api/auth";

interface ProfilePictureSectionProps {
  fullName: string;
  email: string;
  profilePicture?: string;
  onImageUpdate?: (imageUrl: string) => void;
}

export default function ProfilePictureSection({
  fullName,
  email,
  profilePicture,
  onImageUpdate,
}: ProfilePictureSectionProps) {
  const [image, setImage] = useState<string | null>(() => {
    if (profilePicture) {
      // Convert relative path to absolute URL if needed
      let imageUrl = profilePicture;
      
      // Remove /public/ from the path if it exists
      if (imageUrl.includes('/public/')) {
        imageUrl = imageUrl.replace('/public/', '/');
      }
      
      if (!imageUrl.startsWith('http')) {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050';
        imageUrl = `${apiBaseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
      }
      // Add cache buster for fresh loads
      return `${imageUrl}?t=${Date.now()}`;
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to validate URL
  function isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
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
    
    // Clear the current image to force re-render
    setImage(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("profilePicture", file);

      // Update profile picture on server
      const response = await updateProfilePicture(formData);

      // Handle response - the actual user data is in response.data or response directly
      let profilePictureUrl = null;
      
      // Check if profilePicture is directly in response.data
      if (response.data?.profilePicture) {
        profilePictureUrl = response.data.profilePicture;
      } 
      // Check if response itself has profilePicture (in case data is unwrapped)
      else if (response.profilePicture) {
        profilePictureUrl = response.profilePicture;
      }
      // Check nested structure
      else if (response.data?.data?.profilePicture) {
        profilePictureUrl = response.data.data.profilePicture;
      }
      
      if (profilePictureUrl) {
        // Remove /public/ from the path if it exists (backend saves to public folder but serves without it)
        if (profilePictureUrl.includes('/public/')) {
          profilePictureUrl = profilePictureUrl.replace('/public/', '/');
        }
        
        // If the URL is relative, make it absolute using the backend base URL
        if (!profilePictureUrl.startsWith('http')) {
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050';
          profilePictureUrl = `${apiBaseUrl}${profilePictureUrl.startsWith('/') ? '' : '/'}${profilePictureUrl}`;
        }
        
        // Add a cache-busting query parameter to force fresh image load
        const cacheBustUrl = `${profilePictureUrl}?t=${Date.now()}`;
        setImage(cacheBustUrl);
        
        // Just call the callback to pass the image URL to parent
        // Don't save to localStorage yet - wait for Update Profile button click
        onImageUpdate?.(profilePictureUrl); // Pass without cache buster
      } else {
        alert("Image uploaded but URL not returned from server");
      }
    } catch (error) {
      alert("Failed to upload image. Please try again.");
    } finally {
      setLoading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col items-center">
        {/* Profile Picture Circle */}
        <div className="relative mb-6 group cursor-pointer" onClick={handleImageClick}>
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-3 border-gray-700 shadow-lg overflow-hidden">
            {image ? (
              <img
                key={image}
                src={image}
                alt={fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl font-bold text-white">
                {getInitials(fullName)}
              </span>
            )}
          </div>

          {/* Edit Icon Overlay */}
          <div className="absolute top-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-md group-hover:bg-blue-700 transition-colors border-2 border-white">
            <Pencil size={16} className="text-white" />
          </div>

          {loading && (
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
              <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
            </div>
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
