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
    <form onSubmit={handleSubmit} className="card card-border bg-base-100">
      <div className="card-body gap-5">
        <div className="grid grid-cols-2 gap-4">
          <fieldset className="fieldset p-0">
            <legend className="fieldset-legend">Check-in</legend>
            <input
              type="date"
              min={today}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="input w-full"
            />
            {errors.checkIn && <p className="label text-error">{errors.checkIn}</p>}
          </fieldset>

          <fieldset className="fieldset p-0">
            <legend className="fieldset-legend">Check-out</legend>
            <input
              type="date"
              min={checkIn || today}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="input w-full"
            />
            {errors.checkOut && <p className="label text-error">{errors.checkOut}</p>}
          </fieldset>
        </div>

        <fieldset className="fieldset p-0">
          <legend className="fieldset-legend">Notes (optional)</legend>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="textarea w-full"
          />
        </fieldset>

        {nights > 0 && (
          <div role="alert" className="alert alert-info text-sm">
            <span className="font-medium">{nights}</span> night{nights !== 1 ? "s" : ""} ×{" "}
            {room.pricePerNight.toFixed(2)} = <span className="font-semibold">${totalPrice.toFixed(2)}</span>
          </div>
        )}

        <div className="card-actions">
          <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
            {isSubmitting ? "Booking…" : "Confirm booking"}
          </button>
        </div>
      </div>
    </form>
  );
}
