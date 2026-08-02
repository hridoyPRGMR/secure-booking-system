import { useState } from "react";
import type { Room } from "../../types/Room";
import type { CreateBookingRequest } from "../../types/Booking";

interface BookingFormProps {
  room: Room;
  onSubmit: (data: CreateBookingRequest) => void | Promise<void>;
  isSubmitting?: boolean;
}

interface FormErrors {
  checkIn?: string;
  checkOut?: string;
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

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const totalPrice = nights > 0 ? nights * room.pricePerNight : 0;

  function validate(): FormErrors {
    const newErrors: FormErrors = {};

    if (!checkIn) newErrors.checkIn = "Check-in date is required.";
    if (!checkOut) {
      newErrors.checkOut = "Check-out date is required.";
    } else if (checkIn && new Date(checkOut) <= new Date(checkIn)) {
      newErrors.checkOut = "Check-out must be after check-in.";
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
      checkIn,
      checkOut,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border bg-white p-6 shadow-sm">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Check-in</label>
          <input
            type="date"
            min={today}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.checkIn && <p className="mt-1 text-xs text-red-600">{errors.checkIn}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Check-out</label>
          <input
            type="date"
            min={checkIn || today}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.checkOut && <p className="mt-1 text-xs text-red-600">{errors.checkOut}</p>}
        </div>
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
