import { useEffect, useRef, useState } from "react";
import { Users, Minus, Plus, X } from "lucide-react";

interface GuestsRoomsSelectProps {
  adults: number;
  children: number;
  rooms: number;
  onChange: (adults: number, children: number, rooms: number) => void;
}

interface CounterRowProps {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

function CounterRow({ label, hint, value, min, max, onChange }: CounterRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-xs text-base-content/60">{hint}</p>}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="btn btn-circle btn-sm btn-outline"
        >
          <Minus size={14} />
        </button>
        <span className="w-8 text-center text-sm font-medium">{value}</span>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          className="btn btn-circle btn-sm btn-outline"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

export default function GuestsRoomsSelect({ adults, children, rooms, onChange }: GuestsRoomsSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const summary = `${adults} adult${adults !== 1 ? "s" : ""} · ${children} child${children !== 1 ? "ren" : ""} · ${rooms} room${rooms !== 1 ? "s" : ""}`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="btn input-bordered flex w-full items-center justify-between gap-2 rounded-btn px-3 py-2 text-left"
      >
        <span className="flex items-center gap-2 truncate text-sm">
          <Users size={16} className="opacity-60" />
          <span className="truncate">{summary}</span>
        </span>
        <span className="opacity-60">{open ? <X size={16} /> : "▾"}</span>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full min-w-[260px] rounded-box border border-base-300 bg-base-100 p-3 shadow-lg">
          <CounterRow label="Adults" value={adults} min={1} max={16} onChange={(v) => onChange(v, children, rooms)} />
          <CounterRow label="Children" value={children} min={0} max={10} onChange={(v) => onChange(adults, v, rooms)} />
          <CounterRow label="Rooms" value={rooms} min={1} max={10} onChange={(v) => onChange(adults, children, v)} />

          <button type="button" onClick={() => setOpen(false)} className="btn btn-primary btn-sm btn-block mt-3">
            Done
          </button>
        </div>
      )}
    </div>
  );
}
