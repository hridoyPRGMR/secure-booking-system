import type { Booking } from "../../types/Booking";
import { BookingStatus } from "../../types/Booking";

interface BookingCardProps {
  booking: Booking;
  onView?: (booking: Booking) => void;
  onCancel?: (booking: Booking) => void;
}

const STATUS_STYLES: Record<BookingStatus, string> = {
  [BookingStatus.Pending]: "bg-yellow-100 text-yellow-700",
  [BookingStatus.Confirmed]: "bg-green-100 text-green-700",
  [BookingStatus.CheckedIn]: "bg-blue-100 text-blue-700",
  [BookingStatus.CheckedOut]: "bg-gray-200 text-gray-600",
  [BookingStatus.Cancelled]: "bg-red-100 text-red-700",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function nightsBetween(checkIn: string, checkOut: string): number {
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export default function BookingCard({ booking, onView, onCancel }: BookingCardProps) {
  const nights = nightsBetween(booking.checkInDate, booking.checkOutDate);
  const canCancel =
    booking.status !== BookingStatus.Cancelled &&
    booking.status !== BookingStatus.CheckedOut;

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold">{booking.guestName}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {booking.room?.name ?? "Room details unavailable"}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[booking.status]}`}
        >
          {booking.status}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Check-in</p>
          <p className="font-medium">{dateFormatter.format(new Date(booking.checkInDate))}</p>
        </div>
        <div>
          <p className="text-gray-500">Check-out</p>
          <p className="font-medium">{dateFormatter.format(new Date(booking.checkOutDate))}</p>
        </div>
        <div>
          <p className="text-gray-500">Guests</p>
          <p className="font-medium">{booking.numberOfGuests}</p>
        </div>
        <div>
          <p className="text-gray-500">Nights</p>
          <p className="font-medium">{nights}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t pt-4">
        <p className="text-lg font-semibold text-indigo-600">
          {currencyFormatter.format(booking.totalPrice)}
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onView?.(booking)}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
          >
            View
          </button>

          {canCancel && (
            <button
              type="button"
              onClick={() => onCancel?.(booking)}
              className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 hover:bg-red-100"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}