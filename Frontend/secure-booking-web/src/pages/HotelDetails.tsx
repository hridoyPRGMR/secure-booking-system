import { useState } from "react";
import { useNavigate, useParams, Link, useSearchParams } from "react-router-dom";
import { MapPin, Star, Users, BedDouble } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { hotelApi } from "../api/hotelApi";
import { roomApi } from "../api/roomApi";
import type { Room } from "../types/Room";
import DateRangePicker from "../components/hotel/DateRangePicker";
import GuestsRoomsSelect from "../components/hotel/GuestsRoomsSelect";
import { hotelFallbackImage, roomFallbackImage } from "../lib/fallbackImages";

interface AvailabilityFilters {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
}

const DEFAULT_AVAILABILITY: AvailabilityFilters = {
  checkIn: "",
  checkOut: "",
  adults: 2,
  children: 0,
  rooms: 1,
};

function parseAvailability(params: URLSearchParams): AvailabilityFilters {
  return {
    checkIn: params.get("checkIn") ?? DEFAULT_AVAILABILITY.checkIn,
    checkOut: params.get("checkOut") ?? DEFAULT_AVAILABILITY.checkOut,
    adults:
      parseInt(params.get("adults") ?? "", 10) || DEFAULT_AVAILABILITY.adults,
    children:
      parseInt(params.get("children") ?? "", 10) || DEFAULT_AVAILABILITY.children,
    rooms: parseInt(params.get("rooms") ?? "", 10) || DEFAULT_AVAILABILITY.rooms,
  };
}

function availabilityToUrl(a: AvailabilityFilters): Record<string, string> {
  const out: Record<string, string> = {};
  if (a.checkIn) out.checkIn = a.checkIn;
  if (a.checkOut) out.checkOut = a.checkOut;
  if (a.adults !== DEFAULT_AVAILABILITY.adults) out.adults = String(a.adults);
  if (a.children !== DEFAULT_AVAILABILITY.children) out.children = String(a.children);
  if (a.rooms !== DEFAULT_AVAILABILITY.rooms) out.rooms = String(a.rooms);
  return out;
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

export default function HotelDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [availability, setAvailability] = useState<AvailabilityFilters>(() =>
    parseAvailability(searchParams)
  );

  function updateAvailability(patch: Partial<AvailabilityFilters>) {
    const next = { ...availability, ...patch };
    if (next.checkIn && next.checkOut && next.checkOut <= next.checkIn) {
      next.checkOut = "";
    }
    setAvailability(next);
    setSearchParams(availabilityToUrl(next), { replace: true });
  }

  const hasDates = Boolean(availability.checkIn && availability.checkOut);
  const guests = availability.adults + availability.children;

  const nights = (() => {
    if (!hasDates) return 0;
    const diff =
      new Date(availability.checkOut).getTime() -
      new Date(availability.checkIn).getTime();
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
  })();

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
    queryKey: ["rooms", "hotel", id, availability],
    queryFn: () =>
      roomApi.getRooms({
        hotelId: id,
        page: 1,
        pageSize: 100,
        minCapacity: guests || undefined,
        onlyAvailable: hasDates || undefined,
        checkIn: availability.checkIn || undefined,
        checkOut: availability.checkOut || undefined,
      }),
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
          <img
            src={hotelFallbackImage(hotel.id)}
            alt={hotel.name}
            loading="lazy"
            className="h-72 w-full object-cover"
          />
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

        {/* Check availability filters */}
        <div className="card card-border bg-base-100 mt-4">
          <div className="card-body gap-4 p-4">
            <div className="grid items-start gap-4 sm:grid-cols-2">
              <DateRangePicker
                checkIn={availability.checkIn}
                checkOut={availability.checkOut}
                onChange={(checkIn, checkOut) => updateAvailability({ checkIn, checkOut })}
              />

              <div className="space-y-1">
                <span className="text-xs text-base-content/60">Guests &amp; rooms</span>
                <GuestsRoomsSelect
                  adults={availability.adults}
                  children={availability.children}
                  rooms={availability.rooms}
                  onChange={(adults, children, rooms) =>
                    updateAvailability({ adults, children, rooms })
                  }
                />
              </div>
            </div>

            <p className="text-sm text-base-content/60">
              {hasDates ? (
                <>
                  {nights} night{nights !== 1 ? "s" : ""}, {guests} guest{guests !== 1 ? "s" : ""},
                  {" "}
                  {availability.rooms} room{availability.rooms !== 1 ? "s" : ""} — showing rooms that
                  sleep {guests}+ and are free for your dates.
                </>
              ) : (
                <>Select your dates and guests to check availability.</>
              )}
            </p>
          </div>
        </div>

        {roomsLoading ? (
          <div className="mt-4 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <div className="skeleton h-64" />
            <div className="skeleton h-64" />
            <div className="skeleton h-64" />
          </div>
        ) : rooms.length === 0 ? (
          <div className="card card-dash bg-base-200">
            <div className="card-body items-center py-10 text-center text-sm text-base-content/60">
              {hasDates
                ? "No rooms are available for your selected dates and guests."
                : "No rooms are currently available at this property."}
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
          <img
            src={roomFallbackImage(room.id)}
            alt={room.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
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
