import { useNavigate } from "react-router-dom";
import { MapPin, Star } from "lucide-react";
import type { Hotel } from "../../types/Hotel";

interface HotelCardProps {
  hotel: Hotel;
  roomCount?: number;
}

export default function HotelCard({ hotel, roomCount }: HotelCardProps) {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-lg">
      <div className="relative h-44 w-full bg-gray-100">
        {hotel.imageUrl ? (
          <img
            src={hotel.imageUrl}
            alt={hotel.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
            No image available
          </div>
        )}

        {!hotel.isActive && (
          <span className="absolute right-3 top-3 rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-600">
            Currently closed
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-semibold">{hotel.name}</h2>
          <div className="flex items-center gap-1 text-sm font-medium text-amber-500">
            <Star size={14} fill="currentColor" />
            {hotel.starRating}
          </div>
        </div>

        {hotel.location && (
          <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
            <MapPin size={14} />
            {hotel.location.city}, {hotel.location.country}
          </p>
        )}

        <p className="mt-3 line-clamp-2 text-sm text-gray-600">
          {hotel.description || "No description available."}
        </p>

        <div className="mt-5 flex items-center justify-between">
          {roomCount !== undefined && (
            <span className="text-xs text-gray-500">
              {roomCount} room{roomCount !== 1 ? "s" : ""} available
            </span>
          )}

          <button
            type="button"
            onClick={() => navigate(`/hotels/${hotel.id}`)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
          >
            View rooms
          </button>
        </div>
      </div>
    </div>
  );
}