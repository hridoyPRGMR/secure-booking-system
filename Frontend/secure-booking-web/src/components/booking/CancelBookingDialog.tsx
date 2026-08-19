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
        className="w-full max-w-sm rounded-xl bg-base-100 p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold">Cancel booking?</h2>
        <p className="mt-2 text-sm text-base-content/70">
          This will cancel the booking for{" "}
          <span className="font-medium">{booking.roomName}</span> from{" "}
          {new Date(booking.checkIn).toLocaleDateString()} to{" "}
          {new Date(booking.checkOut).toLocaleDateString()}. This can't be undone.
        </p>

        {error && (
          <div role="alert" className="alert alert-error mt-3 text-sm">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="btn btn-outline btn-sm">
            Keep booking
          </button>
          <button
            type="button"
            onClick={() => onConfirm(booking)}
            disabled={isSubmitting}
            className="btn btn-error btn-sm"
          >
            {isSubmitting ? "Cancelling…" : "Yes, cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}