import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal, Building2 } from "lucide-react";
import { hotelApi } from "../../api/hotelApi";
import HotelCard from "./HotelCard";
import HotelSearchBar from "./HotelSearchBar";
import HotelFiltersSidebar from "./HotelFiltersSidebar";
import HotelSortSelect from "./HotelSortSelect";
import { useHotelListingFilters } from "../../hooks/useHotelListingFilters";
import { filtersToApi } from "../../lib/hotelFilters";

const PAGE_SIZE = 12;

function SkeletonCard() {
  return (
    <div className="card card-border bg-base-100">
      <div className="skeleton h-44 w-full rounded-none" />
      <div className="card-body gap-3">
        <div className="skeleton h-5 w-2/3" />
        <div className="skeleton h-4 w-1/2" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-8 w-full" />
      </div>
    </div>
  );
}

export default function Hotels() {
  const hook = useHotelListingFilters();
  const {
    filters,
    update,
    searchInput,
    setSearchInput,
  } = hook;

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const apiParams = useMemo(() => ({ ...filtersToApi(filters), page: 1, pageSize: PAGE_SIZE }), [filters]);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["hotels", "list", apiParams],
    queryFn: () => hotelApi.getHotels(apiParams),
    placeholderData: (previous) => previous,
  });

  const hotels = data?.items ?? [];
  const total = data?.totalCount ?? 0;

  const sidebarProps = {
    filters,
    minPriceInput: hook.minPriceInput,
    maxPriceInput: hook.maxPriceInput,
    onMinPriceChange: hook.setMinPriceInput,
    onMaxPriceChange: hook.setMaxPriceInput,
    onToggleStarRating: hook.toggleStarRating,
    onToggleReviewLevel: hook.toggleReviewLevel,
    onToggleAmenity: hook.toggleAmenity,
    onTogglePropertyType: hook.togglePropertyType,
    onReset: hook.resetSidebar,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hotels</h1>
        <p className="mt-1 text-sm text-base-content/60">Browse, filter, and sort hotels to find your stay.</p>
      </div>

      <HotelSearchBar
        filters={filters}
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        onLocationSelect={(city, country) => {
          update("city", city);
          update("country", country);
          setSearchInput("");
        }}
        onDatesChange={(checkIn, checkOut) => {
          update("checkIn", checkIn);
          update("checkOut", checkOut);
        }}
        onGuestsChange={(adults, children, rooms) => {
          update("adults", adults);
          update("children", children);
          update("rooms", rooms);
        }}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        {/* Desktop sticky sidebar */}
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-24">
            <div className="card card-border bg-base-100">
              <div className="card-body">
                <HotelFiltersSidebar {...sidebarProps} />
              </div>
            </div>
          </div>
        </aside>

        <div className="drawer min-w-0 flex-1 lg:contents">
          <input
            id="hotel-filters-drawer"
            type="checkbox"
            className="drawer-toggle"
            checked={mobileFiltersOpen}
            onChange={(e) => setMobileFiltersOpen(e.target.checked)}
          />

          {/* Main content */}
          <div className="drawer-content min-w-0 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-base-content/60">
                {isLoading ? "Searching…" : `${total} propert${total === 1 ? "y" : "ies"} found`}
              </p>

              <div className="flex w-full items-center justify-between gap-2 sm:w-auto">
                <label
                  htmlFor="hotel-filters-drawer"
                  className="btn btn-outline btn-sm drawer-button gap-2 lg:hidden"
                >
                  <SlidersHorizontal size={16} />
                  Filters
                </label>

                <HotelSortSelect value={filters.sort} onChange={(sort) => update("sort", sort)} />
              </div>
            </div>

            {error ? (
              <div role="alert" className="alert alert-error text-sm">
                Failed to load hotels.
              </div>
            ) : isFetching && !data ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : hotels.length === 0 ? (
              <div className="card card-dash bg-base-200">
                <div className="card-body items-center py-12 text-center">
                  <Building2 className="text-base-content/40" size={32} />
                  <p className="text-sm text-base-content/60">No properties match your filters.</p>
                  <button type="button" onClick={hook.resetSidebar} className="btn btn-sm btn-outline mt-1">
                    Clear filters
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div
                  className={`grid gap-6 md:grid-cols-2 xl:grid-cols-3 ${isFetching ? "opacity-60 transition-opacity" : ""}`}
                >
                  {hotels.map((hotel) => (
                    <HotelCard key={hotel.id} hotel={hotel} roomCount={hotel.roomCount} />
                  ))}
                </div>
                {isFetching && (
                  <div className="flex justify-center">
                    <span className="loading loading-spinner loading-md text-primary" />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile off-canvas drawer */}
          <div className="drawer-side z-20 lg:hidden">
            <label
              htmlFor="hotel-filters-drawer"
              aria-label="Close filters"
              className="drawer-overlay"
            ></label>

            <div className="min-h-full w-80 max-w-[85vw] overflow-y-auto bg-base-100 p-4">
              <HotelFiltersSidebar {...sidebarProps} />
              <label htmlFor="hotel-filters-drawer" className="btn btn-primary btn-block mt-4">
                Show {total} results
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
