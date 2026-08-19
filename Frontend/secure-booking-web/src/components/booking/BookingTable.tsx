import type { Booking } from "../../types/Booking";
import { BookingStatus } from "../../types/Booking";

interface BookingTableProps {
  bookings: Booking[];
  isLoading?: boolean;
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

export default function BookingTable({
  bookings,
  isLoading,
  onView,
  onCancel,
}: BookingTableProps) {
  if (isLoading) {
    return <p className="p-6 text-sm text-base-content/60">Loading bookings…</p>;
  }

  if (bookings.length === 0) {
    return (
      <div className="card card-border bg-base-100">
        <div className="card-body items-center py-10 text-center text-sm text-base-content/60">
          No bookings found.
        </div>
      </div>
    );
  }

  return (
    <div className="card card-border overflow-x-auto bg-base-100">
      <table className="table">
        <thead>
          <tr>
            <th>Room</th>
            <th>Hotel</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Status</th>
            <th className="text-right">Total</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {bookings.map((booking) => {
            const canCancel =
              booking.status !== BookingStatus.Cancelled &&
              booking.status !== BookingStatus.CheckedOut;

            return (
              <tr key={booking.id}>
                <td>{booking.roomName}</td>
                <td>{booking.hotelName}</td>
                <td>{dateFormatter.format(new Date(booking.checkIn))}</td>
                <td>{dateFormatter.format(new Date(booking.checkOut))}</td>
                <td>
                  <span className={`badge ${STATUS_BADGE[booking.status]}`}>{booking.status}</span>
                </td>
                <td className="text-right font-medium">
                  {currencyFormatter.format(booking.totalPrice)}
                </td>
                <td>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => onView?.(booking)} className="btn btn-outline btn-xs">
                      View
                    </button>
                    {canCancel && (
                      <button
                        type="button"
                        onClick={() => onCancel?.(booking)}
                        className="btn btn-error btn-soft btn-xs"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
