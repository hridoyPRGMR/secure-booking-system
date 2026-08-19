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
    <div className="card card-border bg-base-100 transition hover:shadow-lg">
      <figure className="relative h-40 w-full bg-base-200">
        {room.imageUrl ? (
          <img src={room.imageUrl} alt={room.name} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-base-content/50">
            No image available
          </div>
        )}

        <span className="badge badge-success absolute right-3 top-3">Available</span>
      </figure>

      <div className="card-body">
        {room.hotelName && (
          <button
            type="button"
            onClick={() => navigate(`/hotels/${room.hotelId}`)}
            className="btn btn-link btn-xs h-auto min-h-0 justify-start gap-1 p-0 text-xs font-medium"
          >
            <MapPin size={12} />
            {room.hotelName}
          </button>
        )}

        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="card-title text-lg">{room.name}</h2>
            <p className="mt-1 text-sm text-base-content/60">
              {ROOM_TYPE_LABEL[room.type]} · Capacity: {room.capacity}{" "}
              {room.capacity === 1 ? "person" : "people"}
            </p>
          </div>

          <p className="whitespace-nowrap text-lg font-semibold">
            {currencyFormatter.format(room.pricePerNight)}
            <span className="text-xs font-normal text-base-content/60">/night</span>
          </p>
        </div>

        <p className="line-clamp-3 text-sm text-base-content/70">
          {room.description || "No description available."}
        </p>

        <div className="card-actions mt-2 justify-end">
          <button type="button" onClick={handleViewDetails} className="btn btn-outline">
            Details
          </button>

          <button type="button" onClick={() => onBook?.(room)} className="btn btn-primary">
            Book
          </button>
        </div>
      </div>
    </div>
  );
}
