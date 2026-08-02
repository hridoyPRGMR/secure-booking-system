import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Booking } from "../types/Booking";
import { BookingStatus } from "../types/Booking";
import BookingCard from "../components/booking/BookingCard";
import BookingTable from "../components/booking/BookingTable";
import CancelBookingDialog from "../components/booking/CancelBookingDialog";
import { bookingApi } from "../api/bookingApi";

type StatusFilter = "All" | BookingStatus;
type ViewMode = "grid" | "table";

const FILTER_TABS: StatusFilter[] = [
  "All",
  BookingStatus.Pending,
  BookingStatus.Confirmed,
  BookingStatus.CheckedIn,
  BookingStatus.CheckedOut,
  BookingStatus.Cancelled,
];

export default function MyBookings() {
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["bookings", "mine", "list"],
    queryFn: () => bookingApi.getMyBookings({ page: 1, pageSize: 100 }),
  });

  const bookings = data?.items ?? [];

  const filteredBookings = useMemo(() => {
    if (statusFilter === "All") return bookings;
    return bookings.filter((b) => b.status === statusFilter);
  }, [bookings, statusFilter]);

  async function handleConfirmCancel(booking: Booking) {
    setIsCancelling(true);
    setCancelError(null);

    try {
      await bookingApi.cancelMyBooking(booking.id);
      await queryClient.invalidateQueries({ queryKey: ["bookings", "mine"] });
      setBookingToCancel(null);
    } catch (err) {
      setCancelError(
        err instanceof Error ? err.message : "Couldn't cancel the booking. Please try again."
      );
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Bookings</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage your upcoming and past reservations.
          </p>
        </div>

        <div className="flex overflow-hidden rounded-lg border">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`px-3 py-1.5 text-sm ${
              viewMode === "grid" ? "bg-indigo-600 text-white" : "bg-white text-gray-600"
            }`}
          >
            Grid
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`px-3 py-1.5 text-sm ${
              viewMode === "table" ? "bg-indigo-600 text-white" : "bg-white text-gray-600"
            }`}
          >
            Table
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setStatusFilter(tab)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              statusFilter === tab
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {isLoading && <p className="text-sm text-gray-500">Loading your bookings…</p>}

        {!isLoading && error && (
          <p className="text-sm text-red-600">Couldn't load your bookings. Please try again.</p>
        )}

        {!isLoading && !error && filteredBookings.length === 0 && (
          <div className="rounded-xl border bg-white p-10 text-center text-sm text-gray-500">
            No bookings found for this filter.
          </div>
        )}

        {!isLoading && !error && filteredBookings.length > 0 && viewMode === "grid" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onView={(b) => console.log(b)}
                onCancel={setBookingToCancel}
              />
            ))}
          </div>
        )}

        {!isLoading && !error && filteredBookings.length > 0 && viewMode === "table" && (
          <BookingTable
            bookings={filteredBookings}
            onView={(b) => console.log(b)}
            onCancel={setBookingToCancel}
          />
        )}
      </div>

      <CancelBookingDialog
        booking={bookingToCancel}
        open={bookingToCancel !== null}
        isSubmitting={isCancelling}
        error={cancelError}
        onClose={() => {
          setBookingToCancel(null);
          setCancelError(null);
        }}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}
