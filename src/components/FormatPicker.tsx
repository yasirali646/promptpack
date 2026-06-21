import type { Format } from "@shared/types";

const FORMATS: { id: Format; label: string; hint: string }[] = [
  { id: "markdown", label: "Markdown", hint: "Best for readable rules and tables" },
  { id: "json", label: "JSON", hint: "Best for nested config and tool schemas" },
  { id: "yaml", label: "YAML", hint: "Compact nested structure" },
  { id: "minified", label: "Minified", hint: "Dense plain-text abbreviations" },
];

interface FormatPickerProps {
  value: Format;
  onChange: (format: Format) => void;
}

export default function FormatPicker({ value, onChange }: FormatPickerProps) {
  return (
    <fieldset className="picker">
      <legend className="picker__legend">Output format</legend>
      <div className="picker__grid">
        {FORMATS.map((f) => (
          <label key={f.id} className={`picker__option${value === f.id ? " is-active" : ""}`}>
            <input
              type="radio"
              name="format"
              value={f.id}
              checked={value === f.id}
              onChange={() => onChange(f.id)}
            />
            <span className="picker__label">{f.label}</span>
            <span className="picker__hint">{f.hint}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
