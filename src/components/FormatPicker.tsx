import type { Format } from "@shared/types";

const FORMATS: { id: Format; label: string; hint: string }[] = [
  { id: "markdown", label: "Markdown", hint: "Rules & tables" },
  { id: "json", label: "JSON", hint: "Nested config" },
  { id: "yaml", label: "YAML", hint: "Compact tree" },
  { id: "minified", label: "Shorthand", hint: "Dense prose" },
];

interface FormatPickerProps {
  value: Format;
  onChange: (format: Format) => void;
}

export default function FormatPicker({ value, onChange }: FormatPickerProps) {
  return (
    <fieldset className="control-block">
      <legend className="control-block__legend">Output format</legend>
      <div className="format-row">
        {FORMATS.map((f) => (
          <label key={f.id} className={`format-chip${value === f.id ? " is-active" : ""}`}>
            <input
              type="radio"
              name="format"
              value={f.id}
              checked={value === f.id}
              onChange={() => onChange(f.id)}
            />
            <span className="format-chip__label">{f.label}</span>
            <span className="format-chip__hint">{f.hint}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
