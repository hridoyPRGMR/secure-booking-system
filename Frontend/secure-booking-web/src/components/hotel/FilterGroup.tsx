import type { ReactNode } from "react";

interface FilterOption {
  value: string;
  label: ReactNode;
  hint?: string;
}

interface FilterGroupProps {
  title: string;
  options: FilterOption[];
  selected: string[];
  onToggle: (value: string) => void;
}

export default function FilterGroup({ title, options, selected, onToggle }: FilterGroupProps) {
  return (
    <fieldset className="fieldset gap-2">
      <legend className="fieldset-legend">{title}</legend>
      {options.map((option) => (
        <label key={option.value} className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={selected.includes(option.value)}
            onChange={() => onToggle(option.value)}
          />
          <span>{option.label}</span>
          {option.hint && <span className="text-xs text-base-content/50">({option.hint})</span>}
        </label>
      ))}
    </fieldset>
  );
}
