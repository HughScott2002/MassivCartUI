"use client";

interface AddStoreModalProps {
  userLocation: { lat: number; lng: number } | null;
  onClose: () => void;
}

export function AddStoreModal({ onClose }: AddStoreModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add Store</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 hover:bg-gray-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <p className="mt-4 text-sm text-gray-600">
          Submit a new store for approval. This feature requires authentication.
        </p>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-gray-200 px-4 py-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
