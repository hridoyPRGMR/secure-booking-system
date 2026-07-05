import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import type { Room } from "../../types/Room";

interface RoomCardProps {
  room: Room;
  onView?: (room: Room) => void;
  onBook?: (room: Room) => void;
}

const ROOM_TYPE_LABEL: Record<Room["type"], string> = {
  Standard: "Standard",
  Deluxe: "Deluxe",
  Suite: "Suite",
  Family: "Family",
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function RoomCard({ room, onView, onBook }: RoomCardProps) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    onView?.(room);
    navigate(`/rooms/${room.id}`);
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-lg">
      <div className="relative h-40 w-full bg-gray-100">
        {room.imageUrl ? (
          <img
            src={room.imageUrl}
            alt={room.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
            No image available
          </div>
        )}

        <span
          className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-medium ${
            room.isActive
              ? "bg-green-100 text-green-700"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {room.isActive ? "Available" : "Unavailable"}
        </span>
      </div>

      <div className="p-5">
        {room.hotel && (
          <button
            type="button"
            onClick={() => navigate(`/hotels/${room.hotel!.id}`)}
            className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline"
          >
            <MapPin size={12} />
            {room.hotel.name}
            {room.hotel.location && ` · ${room.hotel.location.city}`}
          </button>
        )}

        <div className="mt-1 flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold">{room.name}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {ROOM_TYPE_LABEL[room.type]} · Capacity: {room.capacity}{" "}
              {room.capacity === 1 ? "person" : "people"}
            </p>
          </div>

          <p className="whitespace-nowrap text-lg font-semibold text-indigo-600">
            {currencyFormatter.format(room.pricePerNight)}
            <span className="text-xs font-normal text-gray-500">/night</span>
          </p>
        </div>

        <p className="mt-4 line-clamp-3 text-sm text-gray-600">
          {room.description || "No description available."}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleViewDetails}
            className="rounded-lg border px-4 py-2 hover:bg-gray-100"
          >
            Details
          </button>

          <button
            type="button"
            onClick={() => onBook?.(room)}
            disabled={!room.isActive}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Book
          </button>
        </div>
      </div>
    </div>
  );
}