import { useNavigate } from "react-router-dom";
import { MapPin, Star } from "lucide-react";
import type { Hotel } from "../../types/Hotel";
import { hotelFallbackImage } from "../../lib/fallbackImages";

interface HotelCardProps {
  hotel: Hotel;
  roomCount?: number;
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  children?: number;
  rooms?: number;
}

const currency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

function reviewBadgeColor(score: number): string {
  if (score >= 9) return "bg-emerald-600";
  if (score >= 8) return "bg-green-600";
  if (score >= 7) return "bg-lime-600";
  return "bg-amber-600";
}

export default function HotelCard({
  hotel,
  roomCount,
  checkIn,
  checkOut,
  adults,
  children,
  rooms,
}: HotelCardProps) {
  const navigate = useNavigate();

  const detailsUrl = () => {
    const params = new URLSearchParams();
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (adults !== undefined) params.set("adults", String(adults));
    if (children !== undefined) params.set("children", String(children));
    if (rooms !== undefined) params.set("rooms", String(rooms));
    const qs = params.toString();
    return qs ? `/hotels/${hotel.id}?${qs}` : `/hotels/${hotel.id}`;
  };

  return (
    <div className="card card-border bg-base-100 transition hover:shadow-lg">
      <figure className="relative h-44 w-full bg-base-200">
        {hotel.imageUrl ? (
          <img src={hotel.imageUrl} alt={hotel.name} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <img
            src={hotelFallbackImage(hotel.id)}
            alt={hotel.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
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
            {hotel.availableRoomCount !== undefined && (
              <span className="text-xs text-base-content/60">
                {hotel.availableRoomCount} room{hotel.availableRoomCount !== 1 ? "s" : ""} available
              </span>
            )}
          </div>

          <button type="button" onClick={() => navigate(detailsUrl())} className="btn btn-primary btn-sm">
            View details
          </button>
        </div>
      </div>
    </div>
  );
}
