import type { Room } from "./Room";

export enum BookingStatus {
  Pending = "Pending",
  Confirmed = "Confirmed",
  CheckedIn = "CheckedIn",
  CheckedOut = "CheckedOut",
  Cancelled = "Cancelled",
}

export interface Booking {
  id: string;
  roomId: string;
  room?: Room; // populated when the API includes the related room
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  checkInDate: string; // ISO date string
  checkOutDate: string; // ISO date string
  numberOfGuests: number;
  status: BookingStatus;
  totalPrice: number;
  notes?: string;
  createdAt: string;
}

export interface CreateBookingRequest {
  roomId: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  notes?: string;
}