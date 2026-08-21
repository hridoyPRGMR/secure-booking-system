import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { MapPin, Star, Users } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { roomApi } from "../api/roomApi";
import { hotelApi } from "../api/hotelApi";
import { bookingApi } from "../api/bookingApi";
import BookingForm from "../components/booking/BookingForm";
import type { CreateBookingRequest } from "../types/Booking";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const ROOM_TYPE_LABEL: Record<string, string> = {
  Standard: "Standard",
  Deluxe: "Deluxe",
  Suite: "Suite",
  Family: "Family",
};

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const hotelId = searchParams.get("hotelId");
  const roomId = searchParams.get("roomId");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    data: room,
    isLoading: roomLoading,
    error: roomError,
  } = useQuery({
    queryKey: ["rooms", roomId],
    queryFn: () => roomApi.getRoom(roomId!),
    enabled: !!roomId,
  });

  const {
    data: hotel,
    isLoading: hotelLoading,
    error: hotelError,
  } = useQuery({
    queryKey: ["hotels", hotelId],
    queryFn: () => hotelApi.getHotel(hotelId!),
    enabled: !!hotelId,
  });

  useEffect(() => {
    setSubmitError(null);
  }, [roomId, hotelId]);

  if (!hotelId || !roomId) {
    return (
      <div className="card bg-base-100 shadow">
        <div className="card-body items-center py-10 text-center text-sm text-base-content/60">
          Missing checkout details.{" "}
          <Link to="/hotels" className="link link-primary">
            Browse hotels
          </Link>{" "}
          to pick a room.
        </div>
      </div>
    );
  }

  if (roomLoading || hotelLoading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-24 w-1/2" />
        <div className="card">
          <div className="card-body">
            <div className="skeleton h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (roomError || hotelError || !room || !hotel) {
    return (
      <div className="card bg-base-100 shadow">
        <div className="card-body items-center py-10 text-center">
          <p className="text-error">
            {roomError || hotelError ? "Something went wrong while loading your selection." : "Selection not found."}
          </p>
          <div className="card-actions">
            <button type="button" onClick={() => navigate("/hotels")} className="btn btn-outline">
              Back to hotels
            </button>
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit(data: CreateBookingRequest) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await bookingApi.createMyBooking(data);
      await queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Booking confirmed — see you soon!");
      navigate("/bookings", { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const problem = err.response.data as { detail?: string; errors?: Record<string, string[]> };
        const firstFieldError = problem.errors && Object.values(problem.errors)[0]?.[0];
        setSubmitError(firstFieldError ?? problem.detail ?? "Couldn't create the booking.");
      } else {
        setSubmitError(err instanceof Error ? err.message : "Couldn't create the booking.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <Link to="/hotels">Hotels</Link>
          </li>
          <li>
            <Link to={`/hotels/${hotel.id}`}>{hotel.name}</Link>
          </li>
          <li>{room.name}</li>
          <li>Checkout</li>
        </ul>
      </div>

      <h1 className="text-2xl font-bold">Complete your booking</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Booking form */}
        <div className="min-w-0">
          <BookingForm room={room} onSubmit={handleSubmit} isSubmitting={isSubmitting} />

          {submitError && (
            <div role="alert" className="alert alert-error mt-4 text-sm">
              {submitError}
            </div>
          )}
        </div>

        {/* Order summary */}
        <div className="space-y-4">
          <div className="card card-border bg-base-100">
            <figure className="relative h-40 w-full bg-base-200">
              {room.imageUrl ? (
                <img src={room.imageUrl} alt={room.name} loading="lazy" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-base-content/50">
                  No image available
                </div>
              )}
            </figure>

            <div className="card-body gap-2">
              <div className="flex items-center justify-between gap-2">
                <h2 className="card-title">{room.name}</h2>
                <div className="flex items-center gap-1 text-sm font-medium text-amber-500">
                  <Star size={14} fill="currentColor" />
                  {hotel.starRating}
                </div>
              </div>

              <p className="flex items-center gap-1 text-sm text-base-content/60">
                <MapPin size={14} />
                {hotel.locationCity}, {hotel.locationCountry}
              </p>

              <p className="flex items-center gap-1 text-sm text-base-content/60">
                <Users size={14} />
                Sleeps up to {room.capacity} {room.capacity === 1 ? "person" : "people"}
              </p>

              <p className="text-sm text-base-content/60">Room type</p>
              <p className="text-sm font-medium">{ROOM_TYPE_LABEL[room.type] ?? room.type}</p>

              <div className="mt-2 flex items-baseline justify-between border-t border-base-300 pt-2">
                <span className="text-sm text-base-content/60">Price per night</span>
                <span className="text-xl font-semibold">{currencyFormatter.format(room.pricePerNight)}</span>
              </div>
            </div>
          </div>

          <Link to={`/hotels/${hotel.id}`} className="btn btn-outline btn-block">
            Back to {hotel.name}
          </Link>
        </div>
      </div>
    </div>
  );
}
