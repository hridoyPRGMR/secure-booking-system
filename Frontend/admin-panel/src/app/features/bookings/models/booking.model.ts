export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled';

export const BOOKING_STATUSES: BookingStatus[] = ['Pending', 'Confirmed', 'Cancelled'];

export interface Booking {
  id: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  roomId: string;
  roomName: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  notes: string | null;
  totalPrice: number;
  createdAt: string;
}

export interface BookingFormValue {
  userId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  notes: string | null;
}
