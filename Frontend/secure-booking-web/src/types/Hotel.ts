export enum PropertyType {
  Hotel = "Hotel",
  Resort = "Resort",
  Villa = "Villa",
  Apartment = "Apartment",
}

export interface Hotel {
  id: string;
  name: string;
  description?: string;
  starRating: number;
  reviewScore: number;
  propertyType: PropertyType;
  amenities: string[];
  imageUrl?: string;
  isActive: boolean;
  locationId: string;
  locationCity: string;
  locationCountry: string;
  roomCount: number;
  minPricePerNight?: number;
  createdAt: string;
}
