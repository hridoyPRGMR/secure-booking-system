import type { Room } from "../../types/Room";
import type { CreateBookingRequest } from "../../types/Booking";
import BookingForm from "../booking/BookingForm";

interface BookRoomModalProps {
  room: Room | null;
  open: boolean;
  isSubmitting?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (data: CreateBookingRequest) => void | Promise<void>;
}

export default function BookRoomModal({
  room,
  open,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: BookRoomModalProps) {
  if (!open || !room) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Book {room.name}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <BookingForm room={room} onSubmit={onSubmit} isSubmitting={isSubmitting} />
        </div>
      </div>
    </div>
  );
}