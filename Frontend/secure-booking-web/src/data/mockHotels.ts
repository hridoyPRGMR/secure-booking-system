import type { Hotel } from "../types/Hotel";
import { mockLocations } from "./mockLocations";

const [dhaka, coxsBazar, sylhet] = mockLocations;

export const mockHotels: Hotel[] = [
  {
    id: "hotel-11111111-1111-1111-1111-111111111111",
    name: "The Grand Dhaka",
    description: "A modern business hotel in the heart of Gulshan.",
    starRating: 5,
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    isActive: true,
    locationId: dhaka.id,
    location: dhaka,
  },
  {
    id: "hotel-22222222-2222-2222-2222-222222222222",
    name: "Ocean Pearl Resort",
    description: "Beachfront resort with panoramic sea views.",
    starRating: 4,
    imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
    isActive: true,
    locationId: coxsBazar.id,
    location: coxsBazar,
  },
  {
    id: "hotel-33333333-3333-3333-3333-333333333333",
    name: "Sylhet Tea Garden Inn",
    description: "A quiet retreat surrounded by tea estates.",
    starRating: 3,
    imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
    isActive: true,
    locationId: sylhet.id,
    location: sylhet,
  },
];