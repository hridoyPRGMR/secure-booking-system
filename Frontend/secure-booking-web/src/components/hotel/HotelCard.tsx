import { useNavigate } from "react-router-dom";
import { MapPin, Star } from "lucide-react";
import type { Hotel } from "../../types/Hotel";

interface HotelCardProps {
  hotel: Hotel;
  roomCount?: number;
}

const currency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

function reviewBadgeColor(score: number): string {
  if (score >= 9) return "bg-emerald-600";
  if (score >= 8) return "bg-green-600";
  if (score >= 7) return "bg-lime-600";
  return "bg-amber-600";
}

export default function HotelCard({ hotel, roomCount }: HotelCardProps) {
  const navigate = useNavigate();

  return (
    <div className="card card-border bg-base-100 transition hover:shadow-lg">
      <figure className="relative h-44 w-full bg-base-200">
        {hotel.imageUrl ? (
          <img src={hotel.imageUrl} alt={hotel.name} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-base-content/50">
            No image available
          </div>
        )}

        {hotel.reviewScore > 0 && (
          <span className={`badge absolute right-3 top-3 border-0 text-white ${reviewBadgeColor(hotel.reviewScore)}`}>
            {hotel.reviewScore.toFixed(1)}
          </span>
        )}
        {!hotel.isActive && (
          <span className="badge badge-neutral absolute right-3 top-3">Currently closed</span>
        )}
      </figure>

      <div className="card-body">
        <div className="flex items-start justify-between gap-2">
          <h2 className="card-title text-lg">{hotel.name}</h2>
          <div className="flex items-center gap-1 text-sm font-medium text-amber-500">
            <Star size={14} fill="currentColor" />
            {hotel.starRating}
          </div>
        </div>

        <p className="flex items-center gap-1 text-sm text-base-content/60">
          <MapPin size={14} />
          {hotel.locationCity}, {hotel.locationCountry}
        </p>

        <p className="line-clamp-2 text-sm text-base-content/70">
          {hotel.description || "No description available."}
        </p>

        {hotel.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {hotel.amenities.slice(0, 3).map((amenity) => (
              <span key={amenity} className="badge badge-ghost badge-sm font-normal">
                {amenity}
              </span>
            ))}
            {hotel.amenities.length > 3 && (
              <span className="badge badge-ghost badge-sm">+{hotel.amenities.length - 3}</span>
            )}
          </div>
        )}

        <div className="card-actions mt-2 items-center justify-between">
          <div className="flex flex-col">
            {hotel.minPricePerNight != null && (
              <span className="text-sm font-semibold">
                {currency(hotel.minPricePerNight)}
                <span className="text-xs font-normal text-base-content/60">/night</span>
              </span>
            )}
            {roomCount !== undefined && (
              <span className="text-xs text-base-content/60">
                {roomCount} room{roomCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <button type="button" onClick={() => navigate(`/hotels/${hotel.id}`)} className="btn btn-primary btn-sm">
            View details
          </button>
        </div>
      </div>
    </div>
  );
}
