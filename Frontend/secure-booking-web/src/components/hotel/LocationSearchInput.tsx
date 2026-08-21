import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { locationApi } from "../../api/locationApi";

interface LocationSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (city: string, country: string) => void;
  placeholder?: string;
}

export default function LocationSearchInput({
  value,
  onChange,
  onSelect,
  placeholder = "Search city, landmark, or hotel name…",
}: LocationSearchInputProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(value);
  const [debounced, setDebounced] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(query.trim()), 300);
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
    queryKey: ["locations", "search", debounced],
    queryFn: () => locationApi.search(debounced),
    enabled: isOpen && debounced.length > 0,
    staleTime: 30_000,
  });

  return (
    <div ref={containerRef} className="relative">
      <label className="input w-full">
        <MapPin size={16} className="opacity-50" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full"
        />
      </label>

      {isOpen && debounced.length > 0 && (
        <ul className="menu absolute z-20 mt-1 max-h-56 w-full flex-nowrap overflow-y-auto rounded-box bg-base-100 shadow-lg">
          {isFetching ? (
            <li className="p-3 text-sm text-base-content/60">Searching…</li>
          ) : results.length === 0 ? (
            <li className="p-3 text-sm text-base-content/60">No locations found.</li>
          ) : (
            results.map((option, index) => (
              <li key={`${option.city}|${option.country}|${index}`}>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setIsOpen(false);
                    onSelect(option.city, option.country);
                  }}
                >
                  {option.displayText}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
