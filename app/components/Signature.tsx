/**
 * The closing mark: Rohitt's name written in a calligraphic hand, revealed left to
 * right as if being signed. It is a styled name, not a scan of his legal signature —
 * report PDFs keep their own real signature line.
 */
export function Signature({ note = "Managing Director, 100 Yards" }: { note?: string }) {
  return (
    <p className="signature" data-reveal>
      <span className="signature__ink" aria-hidden="true">Rohitt Kumar Singh</span>
      <span className="signature__rule" aria-hidden="true" />
      <span className="signature__note">{note}</span>
    </p>
  );
}
