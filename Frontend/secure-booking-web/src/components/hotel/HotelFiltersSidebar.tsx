import { Star } from "lucide-react";
import type { HotelFilterState } from "../../lib/hotelFilters";
import {
  PRICE_MIN,
  PRICE_MAX,
  AMENITY_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  REVIEW_LEVELS,
} from "../../lib/hotelFilters";
import FilterGroup from "./FilterGroup";
import PriceRangeSlider from "./PriceRangeSlider";

interface HotelFiltersSidebarProps {
  filters: HotelFilterState;
  minPriceInput: number | "";
  maxPriceInput: number | "";
  onMinPriceChange: (value: number | "") => void;
  onMaxPriceChange: (value: number | "") => void;
  onToggleStarRating: (value: number) => void;
  onToggleReviewLevel: (value: number) => void;
  onToggleAmenity: (value: string) => void;
  onTogglePropertyType: (value: string) => void;
  onReset: () => void;
}

const currency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

export default function HotelFiltersSidebar({
  filters,
  minPriceInput,
  maxPriceInput,
  onMinPriceChange,
  onMaxPriceChange,
  onToggleStarRating,
  onToggleReviewLevel,
  onToggleAmenity,
  onTogglePropertyType,
  onReset,
}: HotelFiltersSidebarProps) {
  const activeCount =
    (filters.minPrice !== "" ? 1 : 0) +
    (filters.maxPrice !== "" ? 1 : 0) +
    filters.starRatings.length +
    filters.reviewLevels.length +
    filters.amenities.length +
    filters.propertyTypes.length;

  const loDisplay = minPriceInput === "" ? PRICE_MIN : minPriceInput;
  const hiDisplay = maxPriceInput === "" ? PRICE_MAX : maxPriceInput;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="card-title text-base">Filters</h2>
        {activeCount > 0 && (
          <button type="button" onClick={onReset} className="btn btn-link btn-sm p-0">
            Clear all
          </button>
        )}
      </div>

      {/* Price range */}
      <fieldset className="fieldset gap-2">
        <legend className="fieldset-legend">Price per night</legend>
        <div className="grid grid-cols-1 gap-3">
          <PriceRangeSlider
            min={PRICE_MIN}
            max={PRICE_MAX}
            value={[loDisplay, hiDisplay]}
            onChange={([lo, hi]) => {
              onMinPriceChange(lo);
              onMaxPriceChange(hi);
            }}
          />
          <div className="grid grid-cols-2 gap-3">
            <label className="fieldset gap-1">
              <span className="fieldset-legend text-xs">Min</span>
              <input
                type="number"
                min={PRICE_MIN}
                max={PRICE_MAX}
                placeholder={currency(PRICE_MIN)}
                value={minPriceInput}
                onChange={(e) =>
                  onMinPriceChange(e.target.value === "" ? "" : Math.max(PRICE_MIN, Number(e.target.value)))
                }
                className="input input-bordered input-sm w-full"
              />
            </label>
            <label className="fieldset gap-1">
              <span className="fieldset-legend text-xs">Max</span>
              <input
                type="number"
                min={PRICE_MIN}
                max={PRICE_MAX}
                placeholder={currency(PRICE_MAX)}
                value={maxPriceInput}
                onChange={(e) =>
                  onMaxPriceChange(e.target.value === "" ? "" : Math.min(PRICE_MAX, Number(e.target.value)))
                }
                className="input input-bordered input-sm w-full"
              />
            </label>
          </div>
        </div>
      </fieldset>

      {/* Star ratings */}
      <FilterGroup
        title="Star rating"
        selected={filters.starRatings.map(String)}
        onToggle={(v) => onToggleStarRating(Number(v))}
        options={[3, 4, 5].map((s) => ({
          value: String(s),
          label: (
            <span className="flex items-center gap-1">
              {s}
              <Star size={13} className="text-amber-500" fill="currentColor" />
            </span>
          ),
        }))}
      />

      {/* Review scores */}
      <FilterGroup
        title="User review score"
        selected={filters.reviewLevels.map(String)}
        onToggle={(v) => onToggleReviewLevel(Number(v))}
        options={REVIEW_LEVELS.map((r) => ({ value: String(r.value), label: r.label }))}
      />

      {/* Amenities */}
      <FilterGroup
        title="Amenities"
        selected={filters.amenities}
        onToggle={onToggleAmenity}
        options={AMENITY_OPTIONS.map((a) => ({ value: a.value, label: a.label }))}
      />

      {/* Property type */}
      <FilterGroup
        title="Property type"
        selected={filters.propertyTypes}
        onToggle={onTogglePropertyType}
        options={PROPERTY_TYPE_OPTIONS.map((p) => ({ value: p.value, label: p.label }))}
      />
    </div>
  );
}
