import { useNavigate, useParams, Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Room } from "../../types/Room";
import { roomApi } from "../../api/roomApi";

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

export default function RoomDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: room, isLoading, error } = useQuery({
    queryKey: ["rooms", id],
    queryFn: () => roomApi.getRoom(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="rounded-xl bg-white p-8 shadow">
        <p className="text-gray-500">Loading room details…</p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="rounded-xl bg-white p-8 shadow">
        <p className="text-red-600">
          {error ? "Something went wrong while loading this room." : "Room not found."}
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-4 rounded-lg border px-4 py-2 hover:bg-gray-100"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-8 shadow">
      {/* Breadcrumb */}
      <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm text-gray-500">
        <Link to="/hotels" className="hover:underline">
          Hotels
        </Link>
        <span>/</span>
        <Link to={`/hotels/${room.hotelId}`} className="hover:underline">
          {room.hotelName}
        </Link>
        <span>/</span>
        <span className="text-gray-700">{room.name}</span>
      </nav>

      {room.imageUrl && (
        <img
          src={room.imageUrl}
          alt={room.name}
          className="mb-6 h-64 w-full rounded-lg object-cover"
        />
      )}

      {/* Hotel context */}
      <div className="mb-4 flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
        <Link
          to={`/hotels/${room.hotelId}`}
          className="flex items-center gap-1 font-medium text-indigo-600 hover:underline"
        >
          <MapPin size={13} />
          {room.hotelName}
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{room.name}</h1>
          <p className="mt-1 text-sm text-gray-500">{ROOM_TYPE_LABEL[room.type]}</p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            room.isActive
              ? "bg-green-100 text-green-700"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {room.isActive ? "Available" : "Unavailable"}
        </span>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <p className="text-sm text-gray-500">Capacity</p>
          <p className="text-lg font-medium">{room.capacity} People</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Price</p>
          <p className="text-lg font-medium">
            {currencyFormatter.format(room.pricePerNight)}
            <span className="text-sm font-normal text-gray-500"> / night</span>
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Description</p>
          <p className="mt-1 text-gray-700">{room.description || "No description."}</p>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-lg border px-4 py-2 hover:bg-gray-100"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!room.isActive}
          onClick={() => navigate("/rooms")}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          Book this room
        </button>
      </div>
    </div>
  );
}
