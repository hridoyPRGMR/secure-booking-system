interface DateRangePickerProps {
  checkIn: string;
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
}

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default function DateRangePicker({ checkIn, checkOut, onChange }: DateRangePickerProps) {
  const today = toDateInputValue(new Date());

  return (
    <div className="grid grid-cols-2 gap-2">
      <label className="space-y-1 w-full">
        <span className="text-xs text-base-content/60">Check in</span>
        <input
          type="date"
          min={today}
          value={checkIn}
          onChange={(e) => {
            const nextIn = e.target.value;
            const nextOut = checkOut && checkOut > nextIn ? checkOut : "";
            onChange(nextIn, nextOut);
          }}
          className="input input-bordered w-full"
        />
      </label>

      <label className="space-y-1 w-full">
        <span className="text-xs text-base-content/60">Check out</span>
        <input
          type="date"
          min={checkIn || today}
          value={checkOut}
          disabled={!checkIn}
          onChange={(e) => onChange(checkIn, e.target.value)}
          className="input input-bordered w-full"
        />
      </label>
    </div>
  );
}
