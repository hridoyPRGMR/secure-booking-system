import { useMemo, useState } from "react";
import { mockHotels } from "../../data/mockHotels";
import { mockRooms } from "../../data/mockRooms";
import HotelCard from "./HotelCard";


export default function Hotels() {
  const [search, setSearch] = useState("");

  const filteredHotels = useMemo(() => {
    if (!search) return mockHotels;
    return mockHotels.filter(
      (hotel) =>
        hotel.name.toLowerCase().includes(search.toLowerCase()) ||
        hotel.location?.city.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  function roomCountFor(hotelId: string) {
    return mockRooms.filter((r) => r.hotelId === hotelId && r.isActive).length;
  }

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

      {filteredHotels.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center text-sm text-gray-500">
          No hotels found.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredHotels.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} roomCount={roomCountFor(hotel.id)} />
          ))}
        </div>
      )}
    </div>
  );
}