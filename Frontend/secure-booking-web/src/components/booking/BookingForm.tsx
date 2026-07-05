import { useState } from "react";
import type { Room } from "../../types/Room";
import type { CreateBookingRequest } from "../../types/Booking";

interface BookingFormProps {
  room: Room;
  onSubmit: (data: CreateBookingRequest) => void | Promise<void>;
  isSubmitting?: boolean;
}

interface FormErrors {
  guestName?: string;
  guestEmail?: string;
  checkInDate?: string;
  checkOutDate?: string;
  numberOfGuests?: string;
}

function toDateInputValue(date: Date): string {
  return date.toISOString().split("T")[0];
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export default function BookingForm({ room, onSubmit, isSubmitting }: BookingFormProps) {
  const today = toDateInputValue(new Date());

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [checkInDate, setCheckInDate] = useState(today);
  const [checkOutDate, setCheckOutDate] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const nights = checkInDate && checkOutDate ? nightsBetween(checkInDate, checkOutDate) : 0;
  const totalPrice = nights > 0 ? nights * room.pricePerNight : 0;

  function validate(): FormErrors {
    const newErrors: FormErrors = {};

    if (!guestName.trim()) newErrors.guestName = "Name is required.";

    if (!guestEmail.trim()) {
      newErrors.guestEmail = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(guestEmail)) {
      newErrors.guestEmail = "Enter a valid email address.";
    }

    if (!checkInDate) newErrors.checkInDate = "Check-in date is required.";
    if (!checkOutDate) {
      newErrors.checkOutDate = "Check-out date is required.";
    } else if (checkInDate && new Date(checkOutDate) <= new Date(checkInDate)) {
      newErrors.checkOutDate = "Check-out must be after check-in.";
    }

    if (numberOfGuests < 1) {
      newErrors.numberOfGuests = "At least 1 guest is required.";
    } else if (numberOfGuests > room.capacity) {
      newErrors.numberOfGuests = `This room fits up to ${room.capacity} guests.`;
    }

    return newErrors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    await onSubmit({
      roomId: room.id,
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim(),
      guestPhone: guestPhone.trim() || undefined,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border bg-white p-6 shadow-sm">
      <div>
        <label className="text-sm font-medium text-gray-700">Guest name</label>
        <input
          type="text"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {errors.guestName && <p className="mt-1 text-xs text-red-600">{errors.guestName}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.guestEmail && <p className="mt-1 text-xs text-red-600">{errors.guestEmail}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Phone (optional)</label>
          <input
            type="tel"
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Check-in</label>
          <input
            type="date"
            min={today}
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.checkInDate && <p className="mt-1 text-xs text-red-600">{errors.checkInDate}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Check-out</label>
          <input
            type="date"
            min={checkInDate || today}
            value={checkOutDate}
            onChange={(e) => setCheckOutDate(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.checkOutDate && <p className="mt-1 text-xs text-red-600">{errors.checkOutDate}</p>}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">
          Number of guests (max {room.capacity})
        </label>
        <input
          type="number"
          min={1}
          max={room.capacity}
          value={numberOfGuests}
          onChange={(e) => setNumberOfGuests(Number(e.target.value))}
          className="mt-1 w-32 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {errors.numberOfGuests && (
          <p className="mt-1 text-xs text-red-600">{errors.numberOfGuests}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {nights > 0 && (
        <div className="rounded-lg bg-indigo-50 px-4 py-3 text-sm">
          <span className="font-medium">{nights}</span> night{nights !== 1 ? "s" : ""} ×{" "}
          {room.pricePerNight.toFixed(2)} ={" "}
          <span className="font-semibold text-indigo-700">${totalPrice.toFixed(2)}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {isSubmitting ? "Booking…" : "Confirm booking"}
      </button>
    </form>
  );
}