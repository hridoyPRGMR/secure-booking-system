import { Search } from "lucide-react";
import { RoomType } from "../../types/Room";
import type { LocationOption } from "../../types/Location";
import LocationSearchSelect from "./LocationSearchSelect";

export interface RoomFilterState {
  search: string;
  type: RoomType | "All";
  location: LocationOption | null;
  hotelId: string | "All";
  minCapacity: number | "";
  maxPrice: number | "";
  onlyAvailable: boolean;
  checkIn: string;
  checkOut: string;
}

interface HotelOption {
  id: string;
  name: string;
  city: string;
}

interface RoomFiltersProps {
  filters: RoomFilterState;
  onChange: (filters: RoomFilterState) => void;
  onReset: () => void;
  hotels: HotelOption[];
}

const ROOM_TYPES: (RoomType | "All")[] = [
  "All",
  RoomType.Standard,
  RoomType.Deluxe,
  RoomType.Suite,
  RoomType.Family,
];

export default function RoomFilters({
  filters,
  onChange,
  onReset,
  hotels,
}: RoomFiltersProps) {
  function update<K extends keyof RoomFilterState>(key: K, value: RoomFilterState[K]) {
    if (key === "checkIn") {
      const checkIn = value as string;
      const checkOut = filters.checkOut && filters.checkOut > checkIn ? filters.checkOut : "";
      onChange({ ...filters, checkIn, checkOut });
      return;
    }
    onChange({ ...filters, [key]: value });
  }

  function handleLocationChange(location: LocationOption | null) {
    onChange({ ...filters, location, hotelId: "All" });
  }

  const hasActiveFilters =
    filters.search !== "" ||
    filters.type !== "All" ||
    filters.location !== null ||
    filters.hotelId !== "All" ||
    filters.minCapacity !== "" ||
    filters.maxPrice !== "" ||
    filters.onlyAvailable ||
    filters.checkIn !== "" ||
    filters.checkOut !== "";

  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <div className="card card-border bg-base-100">
      <div className="card-body gap-5">
        <div className="flex items-center justify-between">
          <h2 className="card-title text-base">Filters</h2>
          {hasActiveFilters && (
            <button type="button" onClick={onReset} className="btn btn-link btn-xs p-0">
              Clear all
            </button>
          )}
        </div>

        <fieldset className="fieldset p-0">
          <legend className="fieldset-legend">Search</legend>
          <label className="input w-full">
            <Search size={16} className="opacity-50" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => update("search", e.target.value)}
              placeholder="Room name…"
            />
          </label>
        </fieldset>

        <div className="grid grid-cols-1 gap-3">
          <fieldset className="fieldset p-0">
            <legend className="fieldset-legend">
              Check-in <span className="text-error">*</span>
            </legend>
            <input
              type="date"
              required
              min={todayIso}
              value={filters.checkIn}
              onChange={(e) => update("checkIn", e.target.value)}
              className="input w-full"
            />
          </fieldset>
          <fieldset className="fieldset p-0">
            <legend className="fieldset-legend">
              Check-out <span className="text-error">*</span>
            </legend>
            <input
              type="date"
              required
              min={filters.checkIn || todayIso}
              value={filters.checkOut}
              disabled={!filters.checkIn}
              onChange={(e) => update("checkOut", e.target.value)}
              className="input w-full"
            />
          </fieldset>
        </div>
        {!(filters.checkIn && filters.checkOut) && (
          <p className="-mt-3 text-xs text-warning">
            Select check-in and check-out dates to search rooms.
          </p>
        )}

        <fieldset className="fieldset p-0">
          <legend className="fieldset-legend">Location</legend>
          <LocationSearchSelect value={filters.location} onChange={handleLocationChange} />
        </fieldset>

        <fieldset className="fieldset p-0">
          <legend className="fieldset-legend">Hotel</legend>
          <select
            value={filters.hotelId}
            onChange={(e) => update("hotelId", e.target.value)}
            className="select w-full"
          >
            <option value="All">All hotels</option>
            {hotels.map((hotel) => (
              <option key={hotel.id} value={hotel.id}>
                {hotel.name}
              </option>
            ))}
          </select>
        </fieldset>

        <fieldset className="fieldset p-0">
          <legend className="fieldset-legend">Room type</legend>
          <select
            value={filters.type}
            onChange={(e) => update("type", e.target.value as RoomType | "All")}
            className="select w-full"
          >
            {ROOM_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </fieldset>

        <fieldset className="fieldset p-0">
          <legend className="fieldset-legend">Min. capacity</legend>
          <input
            type="number"
            min={0}
            value={filters.minCapacity}
            onChange={(e) =>
              update("minCapacity", e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="Any"
            className="input w-full"
          />
        </fieldset>

        <fieldset className="fieldset p-0">
          <legend className="fieldset-legend">Max. price/night</legend>
          <input
            type="number"
            min={0}
            value={filters.maxPrice}
            onChange={(e) =>
              update("maxPrice", e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="Any"
            className="input w-full"
          />
        </fieldset>

        <label className="label gap-2">
          <input
            type="checkbox"
            checked={filters.onlyAvailable}
            onChange={(e) => update("onlyAvailable", e.target.checked)}
            className="checkbox checkbox-sm"
          />
          Only show available rooms
        </label>
      </div>
    </div>
  );
}
