import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { SlidersHorizontal, X } from "lucide-react";
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
  city: "All",
  hotelId: "All",
  minCapacity: "",
  maxPrice: "",
  onlyAvailable: false,
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
    queryKey: ["hotels", "all"],
    queryFn: () => hotelApi.getHotels({ page: 1, pageSize: 100 }),
  });
  const hotels = hotelsData?.items ?? [];

  const cities = useMemo(
    () => Array.from(new Set(hotels.map((h) => h.locationCity).filter(Boolean))),
    [hotels]
  );

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
    filters.city !== "All",
    filters.hotelId !== "All",
    filters.minCapacity !== "",
    filters.maxPrice !== "",
    filters.onlyAvailable,
  ].filter(Boolean).length;

  const { data, isLoading, error } = useQuery({
    queryKey: ["rooms", filters, currentPage],
    queryFn: () =>
      roomApi.getRooms({
        page: currentPage,
        pageSize: PAGE_SIZE,
        search: filters.search || undefined,
        hotelId: filters.hotelId === "All" ? undefined : filters.hotelId,
        city: filters.city === "All" ? undefined : filters.city,
        type: filters.type === "All" ? undefined : filters.type,
        minCapacity: filters.minCapacity || undefined,
        maxPrice: filters.maxPrice || undefined,
        onlyAvailable: filters.onlyAvailable,
      }),
  });

  const rooms = data?.items ?? [];
  const totalPages = Math.max(
    1,
    Math.ceil((data?.totalCount ?? 0) / PAGE_SIZE)
  );

  if (isLoading) {
    return <div>Loading rooms...</div>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-4">
        Failed to load rooms.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 lg:block">
        <div className="sticky top-24">
          <RoomFilters
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(DEFAULT_FILTERS)}
            cities={cities}
            hotels={hotelOptions}
          />
        </div>
      </aside>

      {/* Main content */}
      <div className="min-w-0 flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {data?.totalCount ?? 0} room{(data?.totalCount ?? 0) !== 1 ? "s" : ""} found
          </p>

          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-100 lg:hidden"
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-indigo-600 px-1.5 py-0.5 text-xs text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <RoomGrid
          rooms={rooms}
          onView={(room) => console.log(room)}
          onBook={setSelectedRoom}
        />

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] overflow-y-auto bg-slate-100 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
                className="rounded-lg p-1 hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <RoomFilters
              filters={filters}
              onChange={setFilters}
              onReset={() => setFilters(DEFAULT_FILTERS)}
              cities={cities}
              hotels={hotelOptions}
            />

            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700"
            >
              Show {data?.totalCount ?? 0} results
            </button>
          </div>
        </div>
      )}

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