export interface Location {
  id: string;
  city: string;
  country: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  hotelCount: number;
  createdAt: string;
}

export interface LocationFormValue {
  city: string;
  country: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
}
