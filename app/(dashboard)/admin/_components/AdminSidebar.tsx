"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { handleLogout } from "@/lib/actions/auth-action";
import { useState, useEffect } from "react";
import { Menu, X, LogOut, LayoutDashboard, Layers, Users, User } from "lucide-react";

interface AdminSidebarProps {
  userName?: string;
  profilePicture?: string;
}

export default function AdminSidebar({ userName, profilePicture }: AdminSidebarProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentProfilePicture, setCurrentProfilePicture] = useState(profilePicture);

  useEffect(() => {
    const updateProfilePicture = () => {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const parsed = JSON.parse(userData);
        if (parsed.profilePicture) {
          setCurrentProfilePicture(parsed.profilePicture);
        } 
      }
    };

    updateProfilePicture();
    window.addEventListener('storage', updateProfilePicture);
    window.addEventListener('profilePictureUpdated', updateProfilePicture);

    return () => {
      window.removeEventListener('storage', updateProfilePicture);
      window.removeEventListener('profilePictureUpdated', updateProfilePicture);
    };
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return "A";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  };

  const getProfileImageUrl = () => {
    if (!currentProfilePicture) return null;
    let imageUrl = currentProfilePicture;
    
    if (!imageUrl.startsWith('/public/') && !imageUrl.startsWith('http')) {
      imageUrl = `/public/${imageUrl.replace(/^\//, '')}`;
    }
    
    if (!imageUrl.startsWith('http')) {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050';
      imageUrl = `${apiBaseUrl}${imageUrl}`;
    }
    
    return imageUrl;
  };

  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Manage Rooms", href: "/admin/rooms", icon: Layers },
    { label: "Create User", href: "/admin/users/create", icon: Users },
    { label: "Profile", href: "/admin/profile", icon: User },
  ];

  const isActive = (href: string) => pathname?.startsWith(href);

  return (
    <>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-100"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 shadow-lg z-40 transition-transform duration-300 flex flex-col overflow-hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-100 shrink-0">
          <Link href="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-sm shadow-md group-hover:shadow-lg transition-shadow">
              R
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-900 bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text">
                RentEasy
              </span>
              <span className="text-xs text-gray-500 font-medium">Admin Panel</span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                  isActive(item.href)
                    ? "bg-blue-50 text-blue-600 border border-blue-200 shadow-sm"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                <Icon size={20} className="flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="border-t border-gray-100 shrink-0" />

        {/* User Profile Section */}
        <div className="p-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            {/* Profile Picture */}
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center border-2 border-blue-700 shadow-md overflow-hidden flex-shrink-0">
              {(() => {
                const profileImageUrl = getProfileImageUrl();
                return profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-bold text-white">
                    {getInitials(userName)}
                  </span>
                );
              })()}
            </div>
            
            {/* User Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{userName || "Admin User"}</p>
              <p className="text-xs text-gray-500 font-medium">Administrator</p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-4 shrink-0">
          <button
            onClick={() => handleLogout()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-all font-medium border border-transparent hover:border-red-200">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
