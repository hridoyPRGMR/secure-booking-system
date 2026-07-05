import type { Room } from "../types/Room";
import { RoomType } from "../types/Room";
import { mockHotels } from "./mockHotels";

const [grandDhaka, oceanPearl, teaGardenInn] = mockHotels;

export const mockRooms: Room[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Conference Room A",
    type: RoomType.Suite,
    description: "A spacious room with a large table, ideal for team meetings.",
    capacity: 10,
    pricePerNight: 150,
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
    isActive: true,
    hotelId: grandDhaka.id,
    hotel: grandDhaka,
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Meeting Room B",
    type: RoomType.Standard,
    description: "A compact room ideal for small discussions.",
    capacity: 6,
    pricePerNight: 80,
    imageUrl: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800",
    isActive: true,
    hotelId: grandDhaka.id,
    hotel: grandDhaka,
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "Executive Suite",
    type: RoomType.Deluxe,
    description: "A premium space with sea views.",
    capacity: 4,
    pricePerNight: 220,
    imageUrl: "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=800",
    isActive: true,
    hotelId: oceanPearl.id,
    hotel: oceanPearl,
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    name: "Garden Room",
    type: RoomType.Family,
    description: "A bright room overlooking the tea garden.",
    capacity: 14,
    pricePerNight: 180,
    imageUrl: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800",
    isActive: false,
    hotelId: teaGardenInn.id,
    hotel: teaGardenInn,
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    name: "Quiet Study Room",
    type: RoomType.Standard,
    description: undefined,
    capacity: 2,
    pricePerNight: 40,
    imageUrl: undefined,
    isActive: true,
    hotelId: grandDhaka.id,
    hotel: grandDhaka,
  },
];