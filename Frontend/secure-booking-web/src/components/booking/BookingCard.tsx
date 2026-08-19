import type { Booking } from "../../types/Booking";
import { BookingStatus } from "../../types/Booking";

interface BookingCardProps {
  booking: Booking;
  onView?: (booking: Booking) => void;
  onCancel?: (booking: Booking) => void;
}

const STATUS_BADGE: Record<BookingStatus, string> = {
  [BookingStatus.Pending]: "badge-warning",
  [BookingStatus.Confirmed]: "badge-success",
  [BookingStatus.CheckedIn]: "badge-info",
  [BookingStatus.CheckedOut]: "badge-neutral",
  [BookingStatus.Cancelled]: "badge-error",
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
  const nights = nightsBetween(booking.checkIn, booking.checkOut);
  const canCancel =
    booking.status !== BookingStatus.Cancelled &&
    booking.status !== BookingStatus.CheckedOut;

  return (
    <div className="card card-border bg-base-100 transition hover:shadow-lg">
      <div className="card-body">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="card-title text-base">{booking.roomName}</h3>
            <p className="mt-1 text-sm text-base-content/60">{booking.hotelName}</p>
          </div>

          <span className={`badge ${STATUS_BADGE[booking.status]}`}>{booking.status}</span>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-base-content/60">Check-in</p>
            <p className="font-medium">{dateFormatter.format(new Date(booking.checkIn))}</p>
          </div>
          <div>
            <p className="text-base-content/60">Check-out</p>
            <p className="font-medium">{dateFormatter.format(new Date(booking.checkOut))}</p>
          </div>
          <div>
            <p className="text-base-content/60">Nights</p>
            <p className="font-medium">{nights}</p>
          </div>
        </div>

        <div className="card-actions mt-2 items-center justify-between border-t pt-4">
          <p className="text-lg font-semibold">{currencyFormatter.format(booking.totalPrice)}</p>

          <div className="flex gap-3">
            <button type="button" onClick={() => onView?.(booking)} className="btn btn-outline btn-sm">
              View
            </button>

            {canCancel && (
              <button
                type="button"
                onClick={() => onCancel?.(booking)}
                className="btn btn-error btn-soft btn-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
