import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import RoomGrid from "../components/room/RoomGrid";
import BookRoomModal from "../components/room/BookRoomModal";
import RoomFilters, { type RoomFilterState } from "../components/room/RoomFilters";
import Pagination from "../components/common/Pagination";
import type { Room } from "../types/Room";
import type { CreateBookingRequest } from "../types/Booking";
import { mockRooms } from "../data/mockRooms";
import { mockHotels } from "../data/mockHotels";

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
  const [rooms] = useState<Room[]>(mockRooms);
  const [filters, setFilters] = useState<RoomFilterState>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const cities = useMemo(
    () => Array.from(new Set(mockHotels.map((h) => h.location?.city).filter(Boolean))) as string[],
    []
  );

  const hotelOptions = useMemo(
    () =>
      mockHotels.map((h) => ({
        id: h.id,
        name: h.name,
        city: h.location?.city ?? "",
      })),
    []
  );

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      if (filters.search && !room.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.type !== "All" && room.type !== filters.type) return false;
      if (filters.city !== "All" && room.hotel?.location?.city !== filters.city) return false;
      if (filters.hotelId !== "All" && room.hotelId !== filters.hotelId) return false;
      if (filters.minCapacity !== "" && room.capacity < filters.minCapacity) return false;
      if (filters.maxPrice !== "" && room.pricePerNight > filters.maxPrice) return false;
      if (filters.onlyAvailable && !room.isActive) return false;
      return true;
    });
  }, [rooms, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredRooms.length / PAGE_SIZE));

  const paginatedRooms = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRooms.slice(start, start + PAGE_SIZE);
  }, [filteredRooms, currentPage]);

  async function handleBookingSubmit(data: CreateBookingRequest) {
    setIsBooking(true);
    setBookingError(null);
    try {
      // POST to /api/bookings — same as before
      setSelectedRoom(null);
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "Couldn't create the booking.");
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
            {filteredRooms.length} room{filteredRooms.length !== 1 ? "s" : ""} found
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

        <RoomGrid rooms={paginatedRooms} onView={(room) => console.log(room)} onBook={setSelectedRoom} />

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
              Show {filteredRooms.length} results
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