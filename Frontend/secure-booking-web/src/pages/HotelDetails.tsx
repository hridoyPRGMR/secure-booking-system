import { useNavigate, useParams, Link } from "react-router-dom";
import { MapPin, Star, Users, BedDouble } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { hotelApi } from "../api/hotelApi";
import { roomApi } from "../api/roomApi";
import type { Room } from "../types/Room";

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

export default function HotelDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: hotel,
    isLoading: hotelLoading,
    error: hotelError,
  } = useQuery({
    queryKey: ["hotels", id, "detail"],
    queryFn: () => hotelApi.getHotel(id!),
    enabled: !!id,
  });

  const {
    data: roomsData,
    isLoading: roomsLoading,
    error: roomsError,
  } = useQuery({
    queryKey: ["rooms", "hotel", id],
    queryFn: () => roomApi.getRooms({ hotelId: id, page: 1, pageSize: 100 }),
    enabled: !!id,
  });

  const rooms = roomsData?.items ?? [];

  const isLoading = hotelLoading || roomsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-72 w-full rounded-xl" />
        <div className="skeleton h-24 w-2/3" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="skeleton h-64" />
          <div className="skeleton h-64" />
          <div className="skeleton h-64" />
        </div>
      </div>
    );
  }

  if (hotelError || roomsError || !hotel) {
    return (
      <div className="card bg-base-100 shadow">
        <div className="card-body items-center py-10 text-center">
          <p className="text-error">
            {hotelError || roomsError ? "Something went wrong while loading this hotel." : "Hotel not found."}
          </p>
          <div className="card-actions">
            <button type="button" onClick={() => navigate(-1)} className="btn btn-outline">
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <Link to="/hotels">Hotels</Link>
          </li>
          <li>{hotel.name}</li>
        </ul>
      </div>

      {/* Hero / gallery */}
      <div className="relative overflow-hidden rounded-xl bg-base-200">
        {hotel.imageUrl ? (
          <img
            src={hotel.imageUrl}
            alt={hotel.name}
            loading="lazy"
            className="h-72 w-full object-cover"
          />
        ) : (
          <div className="flex h-72 w-full items-center justify-center text-sm text-base-content/50">
            No image available
          </div>
        )}

        {!hotel.isActive && (
          <span className="badge badge-neutral absolute right-4 top-4">Currently closed</span>
        )}
      </div>

      {/* Header / property info */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{hotel.name}</h1>
            <div className="flex items-center gap-1 rounded-full bg-base-200 px-2 py-1 text-sm font-medium text-amber-500">
              <Star size={14} fill="currentColor" />
              {hotel.starRating}
            </div>
          </div>

          <p className="mt-2 flex items-center gap-1 text-base-content/60">
            <MapPin size={16} />
            {hotel.locationCity}, {hotel.locationCountry}
          </p>
        </div>

        <div className="card w-full bg-base-100 shadow-sm lg:w-64">
          <div className="card-body gap-2 p-4">
            <p className="text-sm text-base-content/60">{hotel.roomCount} room{hotel.roomCount !== 1 ? "s" : ""}</p>
            <div className="flex items-center gap-2 text-sm text-base-content/70">
              <BedDouble size={14} />
              {rooms.length} available now
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <h2 className="text-xl font-semibold">About this property</h2>
        <p className="mt-2 text-base-content/70">{hotel.description || "No description available."}</p>
      </div>

      {/* Rooms & availability */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Rooms &amp; availability</h2>
        </div>

        {rooms.length === 0 ? (
          <div className="card card-dash bg-base-200">
            <div className="card-body items-center py-10 text-center text-sm text-base-content/60">
              No rooms are currently available at this property.
            </div>
          </div>
        ) : (
          <div className="mt-4 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onBook={() => navigate(`/checkout?hotelId=${hotel.id}&roomId=${room.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface RoomCardProps {
  room: Room;
  onBook: (room: Room) => void;
}

function RoomCard({ room, onBook }: RoomCardProps) {
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

        <span className={`badge absolute right-3 top-3 ${room.isActive ? "badge-success" : "badge-neutral"}`}>
          {room.isActive ? "Available" : "Unavailable"}
        </span>
      </figure>

      <div className="card-body">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="card-title text-lg">{room.name}</h3>
            <p className="mt-1 text-sm text-base-content/60">{ROOM_TYPE_LABEL[room.type]}</p>
          </div>

          <p className="whitespace-nowrap text-lg font-semibold">
            {currencyFormatter.format(room.pricePerNight)}
            <span className="text-xs font-normal text-base-content/60">/night</span>
          </p>
        </div>

        <p className="flex items-center gap-1 text-sm text-base-content/60">
          <Users size={14} />
          Sleeps up to {room.capacity} {room.capacity === 1 ? "person" : "people"}
        </p>

        <p className="line-clamp-3 text-sm text-base-content/70">
          {room.description || "No description available."}
        </p>

        <div className="card-actions mt-2 justify-end">
          <button
            type="button"
            disabled={!room.isActive}
            onClick={() => onBook(room)}
            className="btn btn-primary"
          >
            Book this room
          </button>
        </div>
      </div>
    </div>
  );
}
