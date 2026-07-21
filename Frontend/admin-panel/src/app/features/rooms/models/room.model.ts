export type RoomType = 'Standard' | 'Deluxe' | 'Suite' | 'Family';

export const ROOM_TYPES: RoomType[] = ['Standard', 'Deluxe', 'Suite', 'Family'];

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  description: string | null;
  capacity: number;
  pricePerNight: number;
  imageUrl: string | null;
  isActive: boolean;
  hotelId: string;
  hotelName: string;
  bookingCount: number;
  createdAt: string;
}

export interface RoomFormValue {
  name: string;
  type: RoomType;
  description: string | null;
  capacity: number;
  pricePerNight: number;
  imageUrl: string | null;
  isActive: boolean;
  hotelId: string;
}
