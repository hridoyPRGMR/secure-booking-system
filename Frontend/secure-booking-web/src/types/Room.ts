export enum RoomType {
  Standard = "Standard",
  Deluxe = "Deluxe",
  Suite = "Suite",
  Family = "Family",
}

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  description?: string;
  capacity: number;
  pricePerNight: number;
  imageUrl?: string;
  isActive: boolean;
  hotelId: string;
  hotelName: string;
  bookingCount: number;
  createdAt: string;
}
