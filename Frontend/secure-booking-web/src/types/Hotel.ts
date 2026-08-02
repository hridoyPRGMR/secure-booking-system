export interface Hotel {
  id: string;
  name: string;
  description?: string;
  starRating: number;
  imageUrl?: string;
  isActive: boolean;
  locationId: string;
  locationCity: string;
  locationCountry: string;
  roomCount: number;
  createdAt: string;
}
