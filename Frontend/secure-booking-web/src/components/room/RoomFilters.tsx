import { Search } from "lucide-react";
import { RoomType } from "../../types/Room";

export interface RoomFilterState {
  search: string;
  type: RoomType | "All";
  city: string | "All";
  hotelId: string | "All";
  minCapacity: number | "";
  maxPrice: number | "";
  onlyAvailable: boolean;
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
  cities: string[];
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
  cities,
  hotels,
}: RoomFiltersProps) {
  function update<K extends keyof RoomFilterState>(key: K, value: RoomFilterState[K]) {
    if (key === "city") {
      onChange({ ...filters, city: value as RoomFilterState["city"], hotelId: "All" });
      return;
    }
    onChange({ ...filters, [key]: value });
  }

  const hasActiveFilters =
    filters.search !== "" ||
    filters.type !== "All" ||
    filters.city !== "All" ||
    filters.hotelId !== "All" ||
    filters.minCapacity !== "" ||
    filters.maxPrice !== "" ||
    filters.onlyAvailable;

  const hotelsInCity =
    filters.city === "All" ? hotels : hotels.filter((h) => h.city === filters.city);

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Filters</h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-medium text-indigo-600 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="mt-4 space-y-5">
        <div>
          <label className="text-sm font-medium text-gray-700">Search</label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => update("search", e.target.value)}
              placeholder="Room name…"
              className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">City</label>
          <select
            value={filters.city}
            onChange={(e) => update("city", e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Hotel</label>
          <select
            value={filters.hotelId}
            onChange={(e) => update("hotelId", e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All hotels</option>
            {hotelsInCity.map((hotel) => (
              <option key={hotel.id} value={hotel.id}>
                {hotel.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Room type</label>
          <select
            value={filters.type}
            onChange={(e) => update("type", e.target.value as RoomType | "All")}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {ROOM_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Min. capacity</label>
          <input
            type="number"
            min={0}
            value={filters.minCapacity}
            onChange={(e) =>
              update("minCapacity", e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="Any"
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Max. price/night</label>
          <input
            type="number"
            min={0}
            value={filters.maxPrice}
            onChange={(e) =>
              update("maxPrice", e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="Any"
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={filters.onlyAvailable}
            onChange={(e) => update("onlyAvailable", e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          Only show available rooms
        </label>
      </div>
    </div>
  );
}