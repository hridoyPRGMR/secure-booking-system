import type { Location } from "./Location";

export interface Hotel {
  id: string;
  name: string;
  description?: string;
  starRating: number;
  imageUrl?: string;
  isActive: boolean;
  locationId: string;
  location?: Location;
}