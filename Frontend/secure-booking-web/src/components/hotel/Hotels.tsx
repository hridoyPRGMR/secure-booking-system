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
        className="input w-full max-w-md"
      />

      {isLoading && (
        <div className="card card-border bg-base-100">
          <div className="card-body items-center py-10 text-center text-sm text-base-content/60">
            Loading hotels…
          </div>
        </div>
      )}

      {error && (
        <div role="alert" className="alert alert-error text-sm">
          Failed to load hotels.
        </div>
      )}

      {!isLoading && !error && filteredHotels.length === 0 && (
        <div className="card card-border bg-base-100">
          <div className="card-body items-center py-10 text-center text-sm text-base-content/60">
            No hotels found.
          </div>
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
