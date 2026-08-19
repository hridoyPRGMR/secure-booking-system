import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { SlidersHorizontal } from "lucide-react";
import RoomGrid from "../components/room/RoomGrid";
import BookRoomModal from "../components/room/BookRoomModal";
import RoomFilters, { type RoomFilterState } from "../components/room/RoomFilters";
import Pagination from "../components/common/Pagination";
import type { Room } from "../types/Room";
import type { CreateBookingRequest } from "../types/Booking";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { roomApi } from "../api/roomApi";
import { hotelApi } from "../api/hotelApi";
import { bookingApi } from "../api/bookingApi";

const PAGE_SIZE = 6;

const DEFAULT_FILTERS: RoomFilterState = {
  search: "",
  type: "All",
  location: null,
  hotelId: "All",
  minCapacity: "",
  maxPrice: "",
  onlyAvailable: false,
  checkIn: "",
  checkOut: "",
};

export default function Rooms() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<RoomFilterState>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const { data: hotelsData } = useQuery({
    queryKey: ["hotels", "all", filters.location?.city ?? "All", filters.location?.country ?? "All"],
    queryFn: () =>
      hotelApi.getHotels({
        page: 1,
        pageSize: 100,
        city: filters.location?.city,
        country: filters.location?.country,
      }),
  });
  const hotels = hotelsData?.items ?? [];

  const hotelOptions = useMemo(
    () =>
      hotels.map((h) => ({
        id: h.id,
        name: h.name,
        city: h.locationCity,
      })),
    [hotels]
  );

  async function handleBookingSubmit(data: CreateBookingRequest) {
    setIsBooking(true);
    setBookingError(null);
    try {
      await bookingApi.createMyBooking(data);
      await queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setSelectedRoom(null);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const problem = err.response.data as { detail?: string; errors?: Record<string, string[]> };
        const firstFieldError = problem.errors && Object.values(problem.errors)[0]?.[0];
        setBookingError(firstFieldError ?? problem.detail ?? "Couldn't create the booking.");
      } else {
        setBookingError(err instanceof Error ? err.message : "Couldn't create the booking.");
      }
    } finally {
      setIsBooking(false);
    }
  }

  const activeFilterCount = [
    filters.search !== "",
    filters.type !== "All",
    filters.location !== null,
    filters.hotelId !== "All",
    filters.minCapacity !== "",
    filters.maxPrice !== "",
    filters.onlyAvailable,
    filters.checkIn !== "",
    filters.checkOut !== "",
  ].filter(Boolean).length;

  const hasDateRange = Boolean(filters.checkIn && filters.checkOut);

  const { data, isLoading, error } = useQuery({
    queryKey: ["rooms", filters, currentPage],
    queryFn: () =>
      roomApi.getRooms({
        page: currentPage,
        pageSize: PAGE_SIZE,
        search: filters.search || undefined,
        hotelId: filters.hotelId === "All" ? undefined : filters.hotelId,
        city: filters.location?.city,
        country: filters.location?.country,
        type: filters.type === "All" ? undefined : filters.type,
        minCapacity: filters.minCapacity || undefined,
        maxPrice: filters.maxPrice || undefined,
        onlyAvailable: filters.onlyAvailable,
        checkIn: filters.checkIn,
        checkOut: filters.checkOut,
      }),
    enabled: hasDateRange,
  });

  const rooms = data?.items ?? [];
  const totalPages = Math.max(
    1,
    Math.ceil((data?.totalCount ?? 0) / PAGE_SIZE)
  );

  if (hasDateRange && isLoading) {
    return <div>Loading rooms...</div>;
  }

  if (hasDateRange && error) {
    return (
      <div role="alert" className="alert alert-error">
        Failed to load rooms.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      {/* Desktop sidebar: kept outside the drawer entirely. daisyUI's drawer applies
          `will-change: transform` to its side panel whenever the toggle is unchecked
          (needed for the mobile slide animation) — and on desktop the toggle is never
          checked, since `lg:drawer-open` shows the panel via CSS alone. Chromium
          mis-positions native <select> popups under a `will-change: transform`
          ancestor, so the Hotel/Room type dropdowns must live outside it. */}
      <aside className="hidden w-72 shrink-0 lg:block">
        <div className="sticky top-10">
          <RoomFilters
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(DEFAULT_FILTERS)}
            hotels={hotelOptions}
          />
        </div>
      </aside>

      <div className="drawer min-w-0 flex-1 lg:contents">
        <input
          id="room-filters-drawer"
          type="checkbox"
          className="drawer-toggle"
          checked={mobileFiltersOpen}
          onChange={(e) => setMobileFiltersOpen(e.target.checked)}
        />

        {/* Main content */}
        <div className="drawer-content min-w-0 space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-base-content/60">
              {hasDateRange
                ? `${data?.totalCount ?? 0} room${(data?.totalCount ?? 0) !== 1 ? "s" : ""} found`
                : "Select check-in and check-out dates to search rooms"}
            </p>

            <label
              htmlFor="room-filters-drawer"
              className="btn btn-outline btn-sm drawer-button gap-2 lg:hidden"
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 && <span className="badge badge-sm">{activeFilterCount}</span>}
            </label>
          </div>

          {hasDateRange ? (
            <RoomGrid
              rooms={rooms}
              onView={(room) => console.log(room)}
              onBook={setSelectedRoom}
            />
          ) : (
            <div className="card card-dash bg-base-200">
              <div className="card-body items-center py-10 text-center text-sm text-base-content/60">
                Pick your check-in and check-out dates in the filters to see available rooms.
              </div>
            </div>
          )}

          {hasDateRange && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          )}
        </div>

        {/* Off-canvas filter drawer: mobile only */}
        <div className="drawer-side z-20 lg:hidden">
          <label
            htmlFor="room-filters-drawer"
            aria-label="Close filters"
            className="drawer-overlay"
          ></label>

          <div className="min-h-full w-80 max-w-[85vw] bg-base-200 p-4">
            <RoomFilters
              filters={filters}
              onChange={setFilters}
              onReset={() => setFilters(DEFAULT_FILTERS)}
              hotels={hotelOptions}
            />

            <label htmlFor="room-filters-drawer" className="btn btn-primary btn-block mt-4">
              Show {data?.totalCount ?? 0} results
            </label>
          </div>
        </div>
      </div>

      <BookRoomModal
        room={selectedRoom}
        open={selectedRoom !== null}
        isSubmitting={isBooking}
        error={bookingError}
        onClose={() => {
          setSelectedRoom(null);
          setBookingError(null);
        }}
        onSubmit={handleBookingSubmit}
      />
    </div>
  );
}