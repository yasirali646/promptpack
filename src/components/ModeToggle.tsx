import type { Mode } from "@shared/types";

interface ModeToggleProps {
  value: Mode;
  onChange: (mode: Mode) => void;
}

export default function ModeToggle({ value, onChange }: ModeToggleProps) {
  return (
    <fieldset className="mode">
      <legend className="picker__legend">Compression mode</legend>
      <div className="mode__toggle">
        <button
          type="button"
          className={`mode__btn${value === "lossless" ? " is-active" : ""}`}
          onClick={() => onChange("lossless")}
        >
          Lossless
          <span>Keep every constraint</span>
        </button>
        <button
          type="button"
          className={`mode__btn${value === "aggressive" ? " is-active" : ""}`}
          onClick={() => onChange("aggressive")}
        >
          Aggressive
          <span>Trim redundancy</span>
        </button>
      </div>
    </fieldset>
  );
}
