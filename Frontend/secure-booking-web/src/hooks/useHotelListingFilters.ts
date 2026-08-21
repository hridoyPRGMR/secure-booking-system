import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  type HotelFilterState,
  parseUrlToFilters,
  filtersToUrl,
} from "../lib/hotelFilters";

const DEBOUNCE_MS = 300;

export function useHotelListingFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<HotelFilterState>(() =>
    parseUrlToFilters(searchParams)
  );

  // Raw, instantly-updating input values (debounced into `filters`).
  const [searchInput, setSearchInput] = useState(filters.search);
  const [minPriceInput, setMinPriceInput] = useState<number | "">(filters.minPrice);
  const [maxPriceInput, setMaxPriceInput] = useState<number | "">(filters.maxPrice);

  const initialUrlRef = useRef(true);

  useEffect(() => {
    if (initialUrlRef.current) {
      initialUrlRef.current = false;
      return;
    }
    setSearchParams(filtersToUrl(filters), { replace: true });
  }, [filters, setSearchParams]);

  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => ({ ...f, search: searchInput })), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => ({ ...f, minPrice: minPriceInput })), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [minPriceInput]);

  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => ({ ...f, maxPrice: maxPriceInput })), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [maxPriceInput]);

  function update<K extends keyof HotelFilterState>(key: K, value: HotelFilterState[K]) {
    setFilters((f) => {
      const next = { ...f, [key]: value };
      if (key === "checkIn") {
        const checkIn = value as string;
        if (next.checkOut && next.checkOut <= checkIn) next.checkOut = "";
      }
      return next;
    });
  }

  function toggleStarRating(value: number) {
    setFilters((f) => ({
      ...f,
      starRatings: f.starRatings.includes(value)
        ? f.starRatings.filter((v) => v !== value)
        : [...f.starRatings, value],
    }));
  }

  function toggleReviewLevel(value: number) {
    setFilters((f) => ({
      ...f,
      reviewLevels: f.reviewLevels.includes(value)
        ? f.reviewLevels.filter((v) => v !== value)
        : [...f.reviewLevels, value],
    }));
  }

  function toggleAmenity(value: string) {
    setFilters((f) => ({
      ...f,
      amenities: f.amenities.includes(value)
        ? f.amenities.filter((v) => v !== value)
        : [...f.amenities, value],
    }));
  }

  function togglePropertyType(value: string) {
    setFilters((f) => ({
      ...f,
      propertyTypes: f.propertyTypes.includes(value)
        ? f.propertyTypes.filter((v) => v !== value)
        : [...f.propertyTypes, value],
    }));
  }

  // Reset sidebar facets + sort but retain the primary search (location/dates/guests).
  function resetSidebar() {
    setMinPriceInput("");
    setMaxPriceInput("");
    setFilters((f) => ({
      ...f,
      minPrice: "",
      maxPrice: "",
      starRatings: [],
      reviewLevels: [],
      amenities: [],
      propertyTypes: [],
      sort: "recommended",
    }));
  }

  return {
    filters,
    update,
    toggleStarRating,
    toggleReviewLevel,
    toggleAmenity,
    togglePropertyType,
    resetSidebar,
    searchInput,
    setSearchInput,
    minPriceInput,
    setMinPriceInput,
    maxPriceInput,
    setMaxPriceInput,
  };
}
