"use client";

import RoomsTable from "./_components/RoomsTable";

export default function AdminRoomsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Rooms</h1>
          <p className="mt-2 text-gray-600">
            View, update, delete, and manage all property listings
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <RoomsTable />
        </div>
      </div>
    </div>
  );
}
