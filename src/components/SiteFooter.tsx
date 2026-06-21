import { useState } from "react";
import LegalModal from "./LegalModal";
import { PRIVACY_CONTENT, TERMS_CONTENT } from "../content/legal";

export default function SiteFooter() {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <>
      <footer className="colophon">
        <p className="colophon__privacy">
          We do not save your prompts or uploaded files on our servers. Compression runs locally in
          your browser.
        </p>
        <nav className="colophon__nav" aria-label="Legal">
          <button type="button" className="colophon__link" onClick={() => setShowTerms(true)}>
            Terms &amp; Conditions
          </button>
          <span className="colophon__sep" aria-hidden="true">
            ·
          </span>
          <button type="button" className="colophon__link" onClick={() => setShowPrivacy(true)}>
            Privacy Policy
          </button>
        </nav>
      </footer>

      <LegalModal
        title="Terms & Conditions"
        content={TERMS_CONTENT}
        open={showTerms}
        onClose={() => setShowTerms(false)}
      />
      <LegalModal
        title="Privacy Policy"
        content={PRIVACY_CONTENT}
        open={showPrivacy}
        onClose={() => setShowPrivacy(false)}
      />
    </>
  );
}
