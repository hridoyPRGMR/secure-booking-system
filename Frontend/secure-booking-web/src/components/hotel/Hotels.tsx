import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { hotelApi } from "../../api/hotelApi";
import HotelCard from "./HotelCard";

export default function Hotels() {
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["hotels", "list"],
    queryFn: () => hotelApi.getHotels({ page: 1, pageSize: 100 }),
  });

  const hotels = data?.items ?? [];

  const filteredHotels = useMemo(() => {
    if (!search) return hotels;
    return hotels.filter(
      (hotel) =>
        hotel.name.toLowerCase().includes(search.toLowerCase()) ||
        hotel.locationCity.toLowerCase().includes(search.toLowerCase())
    );
  }, [hotels, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hotels</h1>
        <p className="mt-1 text-sm text-gray-500">Browse hotels by name or city.</p>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search hotels or cities…"
        className="w-full max-w-md rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {isLoading && (
        <div className="rounded-xl border bg-white p-10 text-center text-sm text-gray-500">
          Loading hotels…
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-600">
          Failed to load hotels.
        </div>
      )}

      {!isLoading && !error && filteredHotels.length === 0 && (
        <div className="rounded-xl border bg-white p-10 text-center text-sm text-gray-500">
          No hotels found.
        </div>
      )}

      {!isLoading && !error && filteredHotels.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredHotels.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} roomCount={hotel.roomCount} />
          ))}
        </div>
      )}
    </div>
  );
}
