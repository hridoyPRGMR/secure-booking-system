export interface Location {
  id: string;
  city: string;
  country: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

export interface LocationOption {
  city: string;
  country: string;
  label: string;
}