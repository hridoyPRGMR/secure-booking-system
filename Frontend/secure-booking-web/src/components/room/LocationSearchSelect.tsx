import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, X } from "lucide-react";
import { locationApi } from "../../api/locationApi";
import type { LocationOption } from "../../types/Location";

interface LocationSearchSelectProps {
  value: LocationOption | null;
  onChange: (location: LocationOption | null) => void;
}

export default function LocationSearchSelect({ value, onChange }: LocationSearchSelectProps) {
  const [query, setQuery] = useState(value?.label ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value?.label ?? "");
  }, [value]);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: results = [], isFetching } = useQuery({
    queryKey: ["locations", "search", debouncedQuery],
    queryFn: async () => {
      const found = await locationApi.search(debouncedQuery);
      return found.map((l) => ({ city: l.city, country: l.country, label: l.displayText }));
    },
    enabled: isOpen && debouncedQuery.length > 0,
    staleTime: 30_000,
  });

  function handleSelect(option: LocationOption) {
    onChange(option);
    setQuery(option.label);
    setIsOpen(false);
  }

  function handleClear() {
    onChange(null);
    setQuery("");
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="input w-full">
        <MapPin size={16} className="opacity-50" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            const next = e.target.value;
            setQuery(next);
            setIsOpen(true);
            if (value && next !== value.label) {
              onChange(null);
            }
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search city, country, or address…"
        />
        {(query || value) && (
          <button type="button" onClick={handleClear} aria-label="Clear location">
            <X size={14} className="opacity-50" />
          </button>
        )}
      </label>

      {isOpen && debouncedQuery.length > 0 && (
        <ul className="menu absolute z-10 mt-1 max-h-56 w-full flex-nowrap overflow-y-auto rounded-box bg-base-100 shadow-lg">
          {isFetching ? (
            <li className="p-3 text-sm text-base-content/60">Searching…</li>
          ) : results.length === 0 ? (
            <li className="p-3 text-sm text-base-content/60">No locations found.</li>
          ) : (
            results.map((option) => (
              <li key={`${option.city}|${option.country}`}>
                <button type="button" onClick={() => handleSelect(option)}>
                  {option.label}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
