import Link from "next/link";

export default function DashboardPage() {
  return (
    <section className="min-h-screen bg-white px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-black">Dashboard</h1>
            <p className="text-sm text-gray-600">
              Welcome to Room Rental dashboard
            </p>
          </div>

          <Link
            href="/"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-black hover:bg-gray-100">
            Go to Home
          </Link>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">
              Total Listings
            </h3>
            <p className="mt-2 text-2xl font-semibold text-black">0</p>
            <p className="mt-1 text-xs text-gray-500">
              Rooms you have posted
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">
              Active Bookings
            </h3>
            <p className="mt-2 text-2xl font-semibold text-black">0</p>
            <p className="mt-1 text-xs text-gray-500">
              Current rental bookings
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">
              Account Status
            </h3>
            <p className="mt-2 text-2xl font-semibold text-green-600">
              Active
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Profile verified
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-black">
            Quick Actions
          </h2>

          <div className="flex flex-wrap gap-4">
            <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              Add New Room
            </button>

            <button className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-black hover:bg-gray-100">
              View Listings
            </button>

            <button className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-black hover:bg-gray-100">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
