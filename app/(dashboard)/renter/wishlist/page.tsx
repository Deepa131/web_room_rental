"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { roomApi, Room } from "@/lib/api/room";

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

export default function WishlistPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIdsState] = useState<string[]>([]);

  useEffect(() => {
    setWishlistIdsState(getWishlistIds());
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const roomsRes = await roomApi.getAvailableRooms();
        if (roomsRes?.success) {
          setRooms(roomsRes.data || []);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  useEffect(() => {
    if (!rooms.length) return;
    const availableIds = new Set(rooms.map((r) => getRoomId(r as Room & { _id?: string })));
    const nextWishlist = wishlistIds.filter((id) => availableIds.has(id));
    if (nextWishlist.length !== wishlistIds.length) {
      setWishlistIdsState(nextWishlist);
      setWishlistIds(nextWishlist);
    }
  }, [rooms]);

  const wishlistRooms = useMemo(() => {
    const wishlistSet = new Set(wishlistIds);
    return rooms.filter((room) => wishlistSet.has(getRoomId(room as Room & { _id?: string })));
  }, [rooms, wishlistIds]);

  const toggleWishlist = (roomId: string) => {
    const next = wishlistIds.includes(roomId)
      ? wishlistIds.filter((id) => id !== roomId)
      : [...wishlistIds, roomId];
    setWishlistIdsState(next);
    setWishlistIds(next);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-7">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            Saved
          </div>
          <h1 className="mt-3 text-4xl font-bold text-gray-900">
            Wishlist
          </h1>
          <p className="text-gray-600 mt-2 font-medium">
            Rooms you saved for later
          </p>
        </div>

        {loading ? (
          <div className="rounded-xl bg-white border border-gray-100 p-8 shadow-md text-center">
            <p className="text-gray-600">Loading wishlist...</p>
          </div>
        ) : wishlistRooms.length === 0 ? (
          <div className="rounded-xl bg-white border border-gray-100 p-8 shadow-md text-center">
            <p className="text-gray-700 font-medium">Your wishlist is empty.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {wishlistRooms.map((room) => {
              const roomId = getRoomId(room as Room & { _id?: string });
              const isWishlisted = wishlistIds.includes(roomId);
              return (
                <div
                  key={roomId}
                  className="rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden"
                >
                  <div className="relative h-48">
                    <img
                      src={getImageUrl(room.images[0])}
                      alt={room.roomTitle}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500 text-white">
                        Available
                      </span>
                    </div>
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
                      className="w-full py-2 rounded-lg font-medium text-white text-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg transition-all inline-flex items-center justify-center"
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
