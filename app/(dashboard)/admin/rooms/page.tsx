"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import RoomsTable from "./_components/RoomsTable";

export default function AdminRoomsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Rooms</h1>
            <p className="mt-2 text-gray-600">
              View, approve, reject, and manage all property listings
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 shadow-md">
          <RoomsTable />
        </div>
      </div>
    </div>
  );
}
