import { ArrowUpDown } from "lucide-react";
import type { SortValue } from "../../lib/hotelFilters";
import { SORT_OPTIONS } from "../../lib/hotelFilters";

interface HotelSortSelectProps {
  value: SortValue;
  onChange: (value: SortValue) => void;
}

export default function HotelSortSelect({ value, onChange }: HotelSortSelectProps) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <ArrowUpDown size={15} className="text-base-content/60" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortValue)}
        aria-label="Sort hotels"
        className="select select-sm w-auto"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
