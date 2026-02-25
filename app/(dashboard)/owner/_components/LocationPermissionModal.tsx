"use client";

interface LocationPermissionModalProps {
  isOpen: boolean;
  loading: boolean;
  onJustThisTime: () => void;
  onAlways: () => void;
  onCancel: () => void;
}

export default function LocationPermissionModal({
  isOpen,
  loading,
  onJustThisTime,
  onAlways,
  onCancel,
}: LocationPermissionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/20 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full">
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Allow Room Rental to access your location?</h2>
          <p className="text-sm text-gray-600">We need your location to show nearby rooms and calculate distances.</p>
        </div>

        <div className="border-t border-gray-200 p-4 space-y-2 flex flex-col gap-2">
          <button
            onClick={onAlways}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 font-medium"
          >
            Allow always
          </button>
          <button
            onClick={onJustThisTime}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60 font-medium"
          >
            Just this time
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="w-full px-4 py-2 text-gray-700 text-sm rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-60 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
