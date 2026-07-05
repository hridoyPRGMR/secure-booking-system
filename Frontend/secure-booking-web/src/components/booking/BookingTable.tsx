import type { Booking } from "../../types/Booking";
import { BookingStatus } from "../../types/Booking";

interface BookingTableProps {
  bookings: Booking[];
  isLoading?: boolean;
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

export default function BookingTable({
  bookings,
  isLoading,
  onView,
  onCancel,
}: BookingTableProps) {
  if (isLoading) {
    return <p className="p-6 text-sm text-gray-500">Loading bookings…</p>;
  }

  if (bookings.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center text-sm text-gray-500">
        No bookings found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Guest</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Room</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Check-in</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Check-out</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
            <th className="px-4 py-3 text-right font-medium text-gray-500">Total</th>
            <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {bookings.map((booking) => {
            const canCancel =
              booking.status !== BookingStatus.Cancelled &&
              booking.status !== BookingStatus.CheckedOut;

            return (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{booking.guestName}</p>
                  <p className="text-xs text-gray-500">{booking.guestEmail}</p>
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {booking.room?.name ?? "—"}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {dateFormatter.format(new Date(booking.checkInDate))}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {dateFormatter.format(new Date(booking.checkOutDate))}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[booking.status]}`}
                  >
                    {booking.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  {currencyFormatter.format(booking.totalPrice)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onView?.(booking)}
                      className="rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-100"
                    >
                      View
                    </button>
                    {canCancel && (
                      <button
                        type="button"
                        onClick={() => onCancel?.(booking)}
                        className="rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-600 hover:bg-red-100"
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