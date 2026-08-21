import type { HotelFilterState } from "../../lib/hotelFilters";
import LocationSearchInput from "./LocationSearchInput";
import DateRangePicker from "./DateRangePicker";
import GuestsRoomsSelect from "./GuestsRoomsSelect";

interface HotelSearchBarProps {
  filters: HotelFilterState;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onLocationSelect: (city: string, country: string) => void;
  onDatesChange: (checkIn: string, checkOut: string) => void;
  onGuestsChange: (adults: number, children: number, rooms: number) => void;
}

export default function HotelSearchBar({
  filters,
  searchInput,
  onSearchInputChange,
  onLocationSelect,
  onDatesChange,
  onGuestsChange,
}: HotelSearchBarProps) {
  return (
    <div className="card card-border bg-base-100">
      <div className="card-body p-4">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-1">
            <span className="text-xs text-base-content/60">Destination</span>
            <LocationSearchInput
              value={searchInput}
              onChange={onSearchInputChange}
              onSelect={onLocationSelect}
            />
          </div>

          <DateRangePicker
            checkIn={filters.checkIn}
            checkOut={filters.checkOut}
            onChange={onDatesChange}
          />

          <div className="space-y-1">
            <span className="text-xs text-base-content/60">Guests &amp; rooms</span>
            <GuestsRoomsSelect
              adults={filters.adults}
              children={filters.children}
              rooms={filters.rooms}
              onChange={onGuestsChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
