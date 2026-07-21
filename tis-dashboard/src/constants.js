// TIS brand colors — imported wherever needed
export const NAVY = "#1e3a5f";
export const GOLD = "#d4920a";
export const NAVY_MID = "#2e5484";
export const NAVY_LIGHT = "#7aa3cc";

export const PIE_COLORS = ["#1e3a5f", "#d4920a", "#2e5484", "#f0b429", "#4a7ab5"];

export const SERVICE_COLORS = {
  Electrical:      "bg-yellow-100 text-yellow-800",
  HVAC:            "bg-blue-100 text-blue-800",
  Plumbing:        "bg-cyan-100 text-cyan-800",
  Interior_Fitout: "bg-purple-100 text-purple-800",
  Exterior_Fitout: "bg-green-100 text-green-800",
  Maintenance:     "bg-orange-100 text-orange-800",
};

export function formatCurrency(num) {
  if (num >= 10000000) return "₹" + (num / 10000000).toFixed(2) + " Cr";
  if (num >= 100000)   return "₹" + (num / 100000).toFixed(1) + " L";
  return "₹" + num;
}
