import { NAVY, GOLD } from "../constants";

/**
 * KpiCard — a single metric tile used across Overview, Projects, and Analytics.
 *
 * Props:
 *   label      string   — small label above the value
 *   value      string   — the formatted metric value
 *   sub        string?  — optional sub-label below the value
 *   accent     string?  — left-border color (defaults to NAVY)
 *   icon       string?  — emoji icon shown on the right
 *   highlight  bool?    — if true, renders with NAVY background (inverted style)
 */
function KpiCard({ label, value, sub, accent = NAVY, icon, highlight = false }) {
  if (highlight) {
    return (
      <div
        className="rounded-xl p-5 relative overflow-hidden"
        style={{ background: NAVY }}
      >
        <div
          className="absolute top-0 right-0 h-full w-1.5"
          style={{ background: GOLD }}
        />
        {icon && (
          <div className="text-4xl opacity-20 absolute right-5 top-1/2 -translate-y-1/2">
            {icon}
          </div>
        )}
        <p className="text-xs uppercase tracking-wide mb-1" style={{ color: "#7aa3cc" }}>
          {label}
        </p>
        <h2 className="text-3xl font-bold" style={{ color: GOLD }}>
          {value}
        </h2>
        {sub && (
          <p className="text-xs mt-1" style={{ color: "#7aa3cc" }}>
            {sub}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-xl shadow-sm p-5"
      style={{ borderLeft: `4px solid ${accent}` }}
    >
      {icon && (
        <div className="text-2xl float-right opacity-30">{icon}</div>
      )}
      <p className="text-xs uppercase tracking-wide" style={{ color: "#7aa3cc" }}>
        {label}
      </p>
      <h2 className="text-3xl font-bold mt-1" style={{ color: accent }}>
        {value}
      </h2>
      {sub && (
        <p className="text-xs text-gray-400 mt-1">{sub}</p>
      )}
    </div>
  );
}

export default KpiCard;
