interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export default function PriceRangeSlider({ min, max, value, onChange }: PriceRangeSliderProps) {
  const [lo, hi] = value;
  const span = max - min || 1;
  const leftPct = ((lo - min) / span) * 100;
  const rightPct = ((hi - min) / span) * 100;

  return (
    <div>
      <style>{`
        .price-range { position: relative; height: 28px; }
        .price-range__track { position: absolute; top: 50%; left: 0; right: 0; height: 4px; transform: translateY(-50%); border-radius: 9999px; background: var(--color-base-300, #e5e7eb); }
        .price-range__fill { position: absolute; top: 50%; height: 4px; transform: translateY(-50%); border-radius: 9999px; background: var(--color-primary, #4f46e5); }
        .price-range input[type="range"] { position: absolute; left: 0; right: 0; top: 50%; width: 100%; height: 28px; margin: 0; transform: translateY(-50%); -webkit-appearance: none; appearance: none; background: transparent; pointer-events: none; }
        .price-range input[type="range"]::-webkit-slider-thumb { pointer-events: auto; -webkit-appearance: none; appearance: none; width: 18px; height: 18px; border-radius: 9999px; background: #fff; border: 2px solid var(--color-primary, #4f46e5); cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,.2); }
        .price-range input[type="range"]:nth-of-type(1) { z-index: 9; }
        .price-range input[type="range"]:nth-of-type(2) { z-index: 8; }
        .price-range input[type="range"]::-moz-range-thumb { pointer-events: auto; width: 18px; height: 18px; border-radius: 9999px; background: #fff; border: 2px solid var(--color-primary, #4f46e5); cursor: pointer; }
      `}</style>

      <div className="price-range">
        <div className="price-range__track" />
        <div className="price-range__fill" style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }} />

        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={lo}
          aria-label="Minimum price per night"
          onChange={(e) => onChange([Math.min(Number(e.target.value), hi), hi])}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={hi}
          aria-label="Maximum price per night"
          onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo)])}
        />
      </div>
    </div>
  );
}
