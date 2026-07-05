import type { Booking } from "../../types/Booking";

interface CancelBookingDialogProps {
  booking: Booking | null;
  open: boolean;
  isSubmitting?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: (booking: Booking) => void;
}

export default function CancelBookingDialog({
  booking,
  open,
  isSubmitting,
  error,
  onClose,
  onConfirm,
}: CancelBookingDialogProps) {
  if (!open || !booking) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold">Cancel booking?</h2>
        <p className="mt-2 text-sm text-gray-600">
          This will cancel the booking for{" "}
          <span className="font-medium">{booking.room?.name ?? "this room"}</span> from{" "}
          {new Date(booking.checkInDate).toLocaleDateString()} to{" "}
          {new Date(booking.checkOutDate).toLocaleDateString()}. This can't be undone.
        </p>

        {error && (
          <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100 disabled:cursor-not-allowed"
          >
            Keep booking
          </button>
          <button
            type="button"
            onClick={() => onConfirm(booking)}
            disabled={isSubmitting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isSubmitting ? "Cancelling…" : "Yes, cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}