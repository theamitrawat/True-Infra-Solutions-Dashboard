import { SERVICE_COLORS } from "../constants";

/**
 * ServiceBadge — coloured pill for a service name.
 * Replaces the inline className logic scattered across tables.
 *
 * Props:
 *   service  string  — e.g. "Electrical", "Interior_Fitout"
 */
function ServiceBadge({ service }) {
  const classes = SERVICE_COLORS[service] || "bg-gray-100 text-gray-700";
  const label   = service.replace(/_/g, " ");

  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${classes}`}>
      {label}
    </span>
  );
}

export default ServiceBadge;
