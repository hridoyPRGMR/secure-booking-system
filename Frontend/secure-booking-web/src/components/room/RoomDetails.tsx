import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { MapPin, Star } from "lucide-react";
import { Room } from "../../types/Room";
import { mockRooms } from "../../data/mockRooms";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

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

  const [room, setRoom] = useState<Room | null>(mockRooms[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   if (!id) {
  //     setError("No room id was provided.");
  //     setIsLoading(false);
  //     return;
  //   }

  //   const controller = new AbortController();

  //   async function fetchRoom() {
  //     setIsLoading(true);
  //     setError(null);

  //     try {
  //       const response = await fetch(`${API_BASE_URL}/api/rooms/${id}`, {
  //         signal: controller.signal,
  //       });

  //       if (response.status === 404) {
  //         setRoom(null);
  //         setError("Room not found.");
  //         return;
  //       }

  //       if (!response.ok) {
  //         throw new Error(`Request failed with status ${response.status}`);
  //       }

  //       const data: Room = await response.json();
  //       setRoom(data);
  //     } catch (err) {
  //       if (err instanceof DOMException && err.name === "AbortError") return;
  //       setError("Something went wrong while loading this room. Please try again.");
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   }

  //   fetchRoom();

  //   return () => controller.abort();
  // }, [id]);

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
        <p className="text-red-600">{error ?? "Room not found."}</p>
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
        {room.hotel && (
          <>
            <span>/</span>
            <Link to={`/hotels/${room.hotel.id}`} className="hover:underline">
              {room.hotel.name}
            </Link>
          </>
        )}
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
      {room.hotel && (
        <div className="mb-4 flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
          <div>
            <Link
              to={`/hotels/${room.hotel.id}`}
              className="font-medium text-indigo-600 hover:underline"
            >
              {room.hotel.name}
            </Link>
            {room.hotel.location && (
              <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500">
                <MapPin size={13} />
                {room.hotel.location.address}, {room.hotel.location.city},{" "}
                {room.hotel.location.country}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 text-sm font-medium text-amber-500">
            <Star size={14} fill="currentColor" />
            {room.hotel.starRating}
          </div>
        </div>
      )}

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
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          Book this room
        </button>
      </div>
    </div>
  );
}