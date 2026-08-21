import type { GetHotelsRequest } from "../api/hotelApi";

export type SortValue = "recommended" | "price_asc" | "price_desc" | "rating";

export interface HotelFilterState {
  search: string;
  city: string;
  country: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
  minPrice: number | "";
  maxPrice: number | "";
  starRatings: number[];
  reviewLevels: number[];
  amenities: string[];
  propertyTypes: string[];
  sort: SortValue;
}

export interface LabeledOption {
  value: string;
  label: string;
  match: string;
}

export const AMENITY_OPTIONS: LabeledOption[] = [
  { value: "wifi", label: "Free WiFi", match: "Free WiFi" },
  { value: "pool", label: "Swimming Pool", match: "Swimming Pool" },
  { value: "breakfast", label: "Free Breakfast", match: "Free Breakfast" },
  { value: "parking", label: "Parking", match: "Parking" },
  { value: "spa", label: "Spa", match: "Spa" },
  { value: "shuttle", label: "Airport Shuttle", match: "Airport Shuttle" },
];

export const PROPERTY_TYPE_OPTIONS: LabeledOption[] = [
  { value: "hotel", label: "Hotel", match: "Hotel" },
  { value: "resort", label: "Resort", match: "Resort" },
  { value: "villa", label: "Villa", match: "Villa" },
  { value: "apartment", label: "Apartment", match: "Apartment" },
];

export const STAR_RATING_OPTIONS = [3, 4, 5];

export const REVIEW_LEVELS: { value: number; label: string }[] = [
  { value: 8, label: "8.0+ Very Good" },
  { value: 9, label: "9.0+ Excellent" },
];

export const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
];

export const PRICE_MIN = 0;
export const PRICE_MAX = 2000;

export const DEFAULT_FILTERS: HotelFilterState = {
  search: "",
  city: "",
  country: "",
  checkIn: "",
  checkOut: "",
  adults: 2,
  children: 0,
  rooms: 1,
  minPrice: "",
  maxPrice: "",
  starRatings: [],
  reviewLevels: [],
  amenities: [],
  propertyTypes: [],
  sort: "recommended",
};

const SORT_API: Record<SortValue, { sortBy?: string; sortDescending?: boolean }> = {
  recommended: {},
  price_asc: { sortBy: "price", sortDescending: false },
  price_desc: { sortBy: "price", sortDescending: true },
  rating: { sortBy: "review", sortDescending: true },
};

function amenityMatches(slugs: string[]): string[] {
  const bySlug = new Map(AMENITY_OPTIONS.map((o) => [o.value, o.match]));
  return slugs.map((s) => bySlug.get(s)).filter((m): m is string => Boolean(m));
}

function propertyTypeMatches(slugs: string[]): string[] {
  const bySlug = new Map(PROPERTY_TYPE_OPTIONS.map((o) => [o.value, o.match]));
  return slugs
    .map((s) => bySlug.get(s))
    .filter((m): m is string => Boolean(m));
}

function parseCsvInts(csv: string | null): number[] {
  if (!csv) return [];
  return csv
    .split(",")
    .map((v) => parseInt(v.trim(), 10))
    .filter((n) => Number.isFinite(n));
}

function parseCsv(csv: string | null): string[] {
  if (!csv) return [];
  return csv
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
}

export function parseUrlToFilters(params: URLSearchParams): HotelFilterState {
  const minPrice = params.get("minPrice");
  const maxPrice = params.get("maxPrice");
  const sort = params.get("sort") as SortValue | null;

  return {
    search: params.get("q") ?? "",
    city: params.get("city") ?? "",
    country: params.get("country") ?? "",
    checkIn: params.get("checkIn") ?? "",
    checkOut: params.get("checkOut") ?? "",
    adults: parseInt(params.get("adults") ?? "", 10) || DEFAULT_FILTERS.adults,
    children: parseInt(params.get("children") ?? "", 10) || DEFAULT_FILTERS.children,
    rooms: parseInt(params.get("rooms") ?? "", 10) || DEFAULT_FILTERS.rooms,
    minPrice: minPrice !== null && minPrice !== "" ? Number(minPrice) : "",
    maxPrice: maxPrice !== null && maxPrice !== "" ? Number(maxPrice) : "",
    starRatings: parseCsvInts(params.get("stars")),
    reviewLevels: parseCsvInts(params.get("reviews")),
    amenities: parseCsv(params.get("amenities")),
    propertyTypes: parseCsv(params.get("types")),
    sort: sort && SORT_OPTIONS.some((s) => s.value === sort) ? sort : DEFAULT_FILTERS.sort,
  };
}

export function filtersToApi(filters: HotelFilterState): GetHotelsRequest {
  const api: GetHotelsRequest = {
    search: filters.search || undefined,
    city: filters.city || undefined,
    country: filters.country || undefined,
  };

  if (filters.minPrice !== "") api.minPrice = filters.minPrice;
  if (filters.maxPrice !== "") api.maxPrice = filters.maxPrice;
  if (filters.starRatings.length) api.starRatings = filters.starRatings;

  if (filters.reviewLevels.length) {
    api.reviewScoreMin = Math.min(...filters.reviewLevels);
  }

  const amenities = amenityMatches(filters.amenities);
  if (amenities.length) api.amenities = amenities;

  const propertyTypes = propertyTypeMatches(filters.propertyTypes);
  if (propertyTypes.length) api.propertyTypes = propertyTypes;

  api.sortBy = SORT_API[filters.sort].sortBy;
  api.sortDescending = SORT_API[filters.sort].sortDescending;

  return api;
}

export function filtersToUrl(filters: HotelFilterState): Record<string, string> {
  const out: Record<string, string> = {};

  if (filters.search) out.q = filters.search;
  if (filters.city) out.city = filters.city;
  if (filters.country) out.country = filters.country;
  if (filters.checkIn) out.checkIn = filters.checkIn;
  if (filters.checkOut) out.checkOut = filters.checkOut;
  if (filters.adults !== DEFAULT_FILTERS.adults) out.adults = String(filters.adults);
  if (filters.children !== DEFAULT_FILTERS.children) out.children = String(filters.children);
  if (filters.rooms !== DEFAULT_FILTERS.rooms) out.rooms = String(filters.rooms);
  if (filters.minPrice !== "") out.minPrice = String(filters.minPrice);
  if (filters.maxPrice !== "") out.maxPrice = String(filters.maxPrice);
  if (filters.starRatings.length) out.stars = filters.starRatings.join(",");
  if (filters.reviewLevels.length) out.reviews = filters.reviewLevels.join(",");
  if (filters.amenities.length) out.amenities = filters.amenities.join(",");
  if (filters.propertyTypes.length) out.types = filters.propertyTypes.join(",");
  if (filters.sort !== DEFAULT_FILTERS.sort) out.sort = filters.sort;

  return out;
}
