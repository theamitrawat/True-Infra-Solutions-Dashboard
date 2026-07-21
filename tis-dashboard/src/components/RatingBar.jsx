import { GOLD, NAVY } from "../constants";

/**
 * RatingBar — a small horizontal progress bar that visualises a 0–5 rating.
 *
 * Props:
 *   rating   number   — value between 0 and 5
 *   showNum  bool?    — whether to show the numeric value (default true)
 */
function RatingBar({ rating, showNum = true }) {
  const pct = Math.min((rating / 5) * 100, 100);

  // colour shifts from amber → gold → navy-gold depending on score
  const barColor = rating >= 4.5 ? NAVY : rating >= 4.0 ? GOLD : "#f0b429";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
      {showNum && (
        <span className="text-xs font-semibold w-7 text-right" style={{ color: GOLD }}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

export default RatingBar;
