import { NAVY } from "../constants";

/**
 * SectionHeader — page-level heading with an optional subtitle.
 *
 * Props:
 *   title     string
 *   subtitle  string?
 */
function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-5">
      <h1 className="text-xl font-bold" style={{ color: NAVY }}>
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm text-gray-400">{subtitle}</p>
      )}
    </div>
  );
}

export default SectionHeader;