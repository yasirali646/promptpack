import type { Mode } from "@shared/types";

interface ModeToggleProps {
  value: Mode;
  onChange: (mode: Mode) => void;
}

export default function ModeToggle({ value, onChange }: ModeToggleProps) {
  return (
    <fieldset className="control-block">
      <legend className="control-block__legend">Compression mode</legend>
      <div className="mode-row">
        <button
          type="button"
          className={`mode-seg${value === "lossless" ? " is-active" : ""}`}
          onClick={() => onChange("lossless")}
        >
          <span className="mode-seg__title">Lossless</span>
          <span className="mode-seg__desc">Every constraint kept</span>
        </button>
        <button
          type="button"
          className={`mode-seg${value === "aggressive" ? " is-active" : ""}`}
          onClick={() => onChange("aggressive")}
        >
          <span className="mode-seg__title">Aggressive</span>
          <span className="mode-seg__desc">Trim redundancy</span>
        </button>
      </div>
    </fieldset>
  );
}
