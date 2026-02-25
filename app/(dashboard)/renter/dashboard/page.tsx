"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bookmark, Search } from "lucide-react";
import { roomApi, Room, RoomType } from "@/lib/api/room";
import { toast } from "react-hot-toast";

const WISHLIST_KEY = "wishlist_rooms";

const getRoomId = (room: Room & { _id?: string }) => room.id || room._id || "";

const getImageUrl = (imagePath: string) => {
  if (!imagePath) return "/placeholder-room.jpg";
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
  return `${apiBaseUrl}/public/room_images/${imagePath}`;
};

const getWishlistIds = () => {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
};

const setWishlistIds = (ids: string[]) => {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
};

export default function RenterDashboardPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [wishlistIds, setWishlistIdsState] = useState<string[]>([]);

  useEffect(() => {
    setWishlistIdsState(getWishlistIds());
  }, []);

  const fetchData = async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const [roomsRes, typesRes] = await Promise.all([
        roomApi.getAvailableRooms(),
        roomApi.getRoomTypes(),
      ]);

      if (roomsRes?.success) {
        setRooms(roomsRes.data || []);
      }
      if (typesRes?.success) {
        const activeTypes = typesRes.data.filter((rt: RoomType) => rt.status === "active");
        setRoomTypes(activeTypes);
      }
    } finally {
      if (showLoading) {
        setLoading(false);
        setHasLoaded(true);
      }
    }
  };

  useEffect(() => {
    fetchData(true);

    const handleFocus = () => {
      if (hasLoaded) {
        fetchData(false);
      }
    };

    const intervalId = setInterval(() => {
      if (hasLoaded) {
        fetchData(false);
      }
    }, 60000);

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(intervalId);
    };
  }, [hasLoaded]);

  useEffect(() => {
    if (!rooms.length) return;
    const availableIds = new Set(rooms.map((r) => getRoomId(r as Room & { _id?: string })));
    const nextWishlist = wishlistIds.filter((id) => availableIds.has(id));
    if (nextWishlist.length !== wishlistIds.length) {
      setWishlistIdsState(nextWishlist);
      setWishlistIds(nextWishlist);
    }
  }, [rooms, wishlistIds]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const term = searchTerm.trim().toLowerCase();
      const matchTerm = !term || room.roomTitle.toLowerCase().includes(term);

      const matchType = typeFilter === "all"
        || (typeof room.roomType === "string"
          ? room.roomType === typeFilter
          : room.roomType?.id === typeFilter || room.roomType?._id === typeFilter);

      const price = room.monthlyPrice || 0;
      const matchPrice = priceFilter === "all"
        || (priceFilter === "lt-5000" && price < 5000)
        || (priceFilter === "5000-10000" && price >= 5000 && price <= 10000)
        || (priceFilter === "gt-10000" && price > 10000);

      return matchTerm && matchType && matchPrice;
    });
  }, [rooms, searchTerm, typeFilter, priceFilter]);

  const toggleWishlist = (roomId: string) => {
    try {
      const wasWishlisted = wishlistIds.includes(roomId);
      const next = wasWishlisted
        ? wishlistIds.filter((id) => id !== roomId)
        : [...wishlistIds, roomId];
      setWishlistIdsState(next);
      setWishlistIds(next);
      toast.success(wasWishlisted ? "Removed from wishlist" : "Added to wishlist");
    } catch (error) {
      console.error("Wishlist update failed:", error);
      toast.error("Could not update wishlist. Please try again.");
    }
  };

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Explore Rooms
          </h1>
          <p className="text-gray-600 mt-2 font-medium">
            Find your perfect space from available listings
          </p>
        </div>

        <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 mb-6">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search rooms in Nepal..."
                className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Prices</option>
              <option value="lt-5000">Below 5,000</option>
              <option value="5000-10000">5,000 - 10,000</option>
              <option value="gt-10000">Above 10,000</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              {roomTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.typeName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-3">
          <h2 className="text-2xl font-bold text-gray-900">Available Rooms</h2>
        </div>

        {loading ? (
          <div className="rounded-xl bg-white border border-gray-100 p-8 shadow-md text-center">
            <p className="text-gray-600">Loading rooms...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="rounded-xl bg-white border border-gray-100 p-8 shadow-md text-center">
            <p className="text-gray-700 font-medium">No available rooms found.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRooms.map((room) => {
              const roomId = getRoomId(room as Room & { _id?: string });
              const isWishlisted = wishlistIds.includes(roomId);
              return (
                <div
                  key={roomId}
                  className="rounded-xl bg-white border border-gray-100 shadow-md hover:shadow-xl transition-all overflow-hidden"
                >
                  <div className="relative h-48">
                    <img
                      src={getImageUrl(room.images[0])}
                      alt={room.roomTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">
                          {room.roomTitle}
                        </h3>
                        <p className="text-xs text-gray-500 mb-2">
                          {room.location}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleWishlist(roomId)}
                        className="mt-1"
                        aria-label="Toggle wishlist"
                      >
                        <Bookmark
                          size={22}
                          className={isWishlisted ? "text-yellow-500" : "text-gray-400"}
                          fill={isWishlisted ? "#f59e0b" : "none"}
                        />
                      </button>
                    </div>

                    <p className="text-sm font-bold text-gray-900 mb-3">
                      NPR {room.monthlyPrice.toLocaleString()}/month
                    </p>

                    <Link
                      href={`/renter/rooms/${roomId}`}
                      className="w-full py-2 rounded-lg font-medium text-white text-sm bg-linear-to-r from-blue-600 to-blue-700 hover:shadow-lg transition-all inline-flex items-center justify-center"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
