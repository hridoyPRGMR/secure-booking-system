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
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <p className="text-base-content/60">Loading room details…</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <p className="text-error">
            {error ? "Something went wrong while loading this room." : "Room not found."}
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
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        {/* Breadcrumb */}
        <div className="breadcrumbs text-sm">
          <ul>
            <li>
              <Link to="/hotels">Hotels</Link>
            </li>
            <li>
              <Link to={`/hotels/${room.hotelId}`}>{room.hotelName}</Link>
            </li>
            <li>{room.name}</li>
          </ul>
        </div>

        {room.imageUrl && (
          <img
            src={room.imageUrl}
            alt={room.name}
            className="mb-2 h-64 w-full rounded-lg object-cover"
          />
        )}

        {/* Hotel context */}
        <div className="flex items-center justify-between rounded-lg bg-base-200 px-4 py-3">
          <Link to={`/hotels/${room.hotelId}`} className="link link-primary flex items-center gap-1 font-medium">
            <MapPin size={13} />
            {room.hotelName}
          </Link>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{room.name}</h1>
            <p className="mt-1 text-sm text-base-content/60">{ROOM_TYPE_LABEL[room.type]}</p>
          </div>

          <span className={`badge ${room.isActive ? "badge-success" : "badge-neutral"}`}>
            {room.isActive ? "Available" : "Unavailable"}
          </span>
        </div>

        <div className="mt-2 space-y-4">
          <div>
            <p className="text-sm text-base-content/60">Capacity</p>
            <p className="text-lg font-medium">{room.capacity} People</p>
          </div>

          <div>
            <p className="text-sm text-base-content/60">Price</p>
            <p className="text-lg font-medium">
              {currencyFormatter.format(room.pricePerNight)}
              <span className="text-sm font-normal text-base-content/60"> / night</span>
            </p>
          </div>

          <div>
            <p className="text-sm text-base-content/60">Description</p>
            <p className="mt-1">{room.description || "No description."}</p>
          </div>
        </div>

        <div className="card-actions mt-4">
          <button type="button" onClick={() => navigate(-1)} className="btn btn-outline">
            Back
          </button>
          <button
            type="button"
            disabled={!room.isActive}
            onClick={() => navigate("/rooms")}
            className="btn btn-primary"
          >
            Book this room
          </button>
        </div>
      </div>
    </div>
  );
}
