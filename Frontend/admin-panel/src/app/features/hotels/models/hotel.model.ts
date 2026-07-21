export interface Hotel {
  id: string;
  name: string;
  description: string | null;
  starRating: number;
  imageUrl: string | null;
  isActive: boolean;
  locationId: string;
  locationCity: string;
  locationCountry: string;
  roomCount: number;
  createdAt: string;
}

export interface HotelFormValue {
  name: string;
  description: string | null;
  starRating: number;
  imageUrl: string | null;
  isActive: boolean;
  locationId: string;
}
