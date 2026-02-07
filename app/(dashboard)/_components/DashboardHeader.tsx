"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { handleLogout } from "@/lib/actions/auth-action";
import { useState, useEffect } from "react";
import { Menu, X, LogOut, User, BarChart3, Plus, Home, Clock } from "lucide-react";

interface DashboardHeaderProps {
  userRole?: string;
  userName?: string;
  profilePicture?: string;
}

export default function DashboardHeader({ userRole, userName, profilePicture }: DashboardHeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentProfilePicture, setCurrentProfilePicture] = useState(profilePicture);
  const isAdmin = userRole === "admin";
  const roleLabel = userRole === "admin" ? "Admin" : userRole;
  const dashboardHref = userRole === "admin"
    ? "/admin/dashboard"
    : userRole === "owner"
      ? "/owner/dashboard"
      : "/renter/dashboard";

  // Listen for profile picture updates from localStorage
  useEffect(() => {
    const updateProfilePicture = () => {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          if (parsed.profilePicture) {
            setCurrentProfilePicture(parsed.profilePicture);
          }
        } catch (e) {
          // Failed to parse user data
        }
      }
    };

    // Initial load
    updateProfilePicture();

    // Listen for storage events (updates from other tabs)
    window.addEventListener('storage', updateProfilePicture);

    // Listen for custom event (updates from same tab)
    window.addEventListener('profilePictureUpdated', updateProfilePicture);

    return () => {
      window.removeEventListener('storage', updateProfilePicture);
      window.removeEventListener('profilePictureUpdated', updateProfilePicture);
    };
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getProfileImageUrl = () => {
    if (!currentProfilePicture) return null;
    let imageUrl = currentProfilePicture;
    
    // Ensure /public/ prefix exists for static file serving
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
    { label: "Dashboard", href: dashboardHref, roles: ["renter", "owner", "admin"] },
    { label: "Create User", href: "/admin/users/create", roles: ["admin"] },
    { label: "Add Room", href: "/add-room", roles: ["owner"] },
    { label: "My Listings", href: "/my-listings", roles: ["owner"] },
    { label: "Appointments", href: "/appointments", roles: ["owner"] },
    { label: "Profile", href: "/user/profile", roles: ["renter", "owner"] },
  ];

  const isActive = (href: string) => pathname?.startsWith(href);

  return (
    <>
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white shadow-md border-b border-gray-100">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Link href={dashboardHref} className="flex items-center gap-2 group">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-sm shadow-md group-hover:shadow-lg transition-shadow">
                  R
                </span>
                <span className="font-bold text-gray-900 hidden sm:inline bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">RentEasy</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                // Only show items for current user role
                if (!item.roles.includes(userRole || '')) {
                  return null;
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive(item.href)
                        ? "text-blue-600 bg-blue-50 border border-blue-100"
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* User Menu & Mobile Toggle */}
            <div className="flex items-center gap-4">
              {/* User Dropdown (Desktop) */}
              <div className="hidden sm:flex items-center gap-3">
                {/* Profile Picture Circle */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-2 border-blue-700 shadow-md overflow-hidden">
                  {getProfileImageUrl() ? (
                    <img
                      src={getProfileImageUrl()}
                      alt={userName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-white">
                      {getInitials(userName)}
                    </span>
                  )}
                </div>
                
                <div className="flex flex-col text-right">
                  <span className="text-sm font-semibold text-gray-900">{userName}</span>
                  <span className="text-xs text-gray-500 capitalize font-medium">{roleLabel}</span>
                </div>
              </div>

              {/* Logout Button (Desktop) */}
              <button
                onClick={() => handleLogout()}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-all text-sm font-medium border border-transparent hover:border-red-200"
              >
                <LogOut size={16} />
                Logout
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100 py-2 pb-4 bg-gray-50">
              <div className="space-y-1">
                {navItems.map((item) => {
                  // Only show items for current user role
                  if (!item.roles.includes(userRole || '')) {
                    return null;
                  }
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive(item.href)
                          ? "text-blue-600 bg-blue-50 border border-blue-100"
                          : "text-gray-700 hover:text-blue-600 hover:bg-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              {/* Mobile User Info & Logout */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="px-4 py-2 mb-2 flex items-center gap-3">
                  {/* Profile Picture Circle */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-2 border-blue-700 shadow-md overflow-hidden flex-shrink-0">
                    {getProfileImageUrl() ? (
                      <img
                        src={getProfileImageUrl()}
                        alt={userName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold text-white">
                        {getInitials(userName)}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-600 capitalize font-medium">{roleLabel}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleLogout()}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-all text-sm font-medium border border-transparent hover:border-red-200"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </nav>
      </header>
    </>
  );
}

