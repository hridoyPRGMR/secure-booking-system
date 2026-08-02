export enum BookingStatus {
  Pending = "Pending",
  Confirmed = "Confirmed",
  CheckedIn = "CheckedIn",
  CheckedOut = "CheckedOut",
  Cancelled = "Cancelled",
}

export interface Booking {
  id: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  roomId: string;
  roomName: string;
  hotelName: string;
  checkIn: string; // ISO date string
  checkOut: string; // ISO date string
  status: BookingStatus;
  notes?: string;
  totalPrice: number;
  createdAt: string;
}

export interface CreateBookingRequest {
  roomId: string;
  checkIn: string;
  checkOut: string;
  notes?: string;
}
