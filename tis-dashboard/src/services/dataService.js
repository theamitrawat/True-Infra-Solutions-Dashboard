/**
 * dataService.js
 * Pure utility functions for aggregating and analysing TIS project data.
 * All functions are stateless — they take the projects array and return
 * derived values, keeping pages and components free of business logic.
*
*/

// ─── Basic aggregation ────────────────────────────────────────────────────────

/** Sum revenue, cost, and derive profit for an array of projects. */
export function getTotals(projects) {
  let revenue = 0;
  let cost = 0;
  projects.forEach(p => {
    revenue += p.Revenue;
    cost += p.Cost;
  });
  return { revenue, cost, profit: revenue - cost };
}

/** Profit margin as a percentage (0–100). */
export function getProfitMargin(projects) {
  const { revenue, profit } = getTotals(projects);
  if (revenue === 0) return 0;
  return (profit / revenue) * 100;
}

/** Average rating across all projects (rounded to 1 dp). */
export function getAverageRating(projects) {
  if (!projects.length) return 0;
  const sum = projects.reduce((acc, p) => acc + p.Rating, 0);
  return Math.round((sum / projects.length) * 10) / 10;
}

// ─── Group-by helpers ─────────────────────────────────────────────────────────

/**
 * Group projects by a string field and compute revenue, cost, profit, count.
 * Returns an array sorted by revenue descending.
 */
export function groupBy(projects, field) {
  const map = {};
  projects.forEach(p => {
    const key = p[field];
    if (!map[key]) map[key] = { name: key, revenue: 0, cost: 0, count: 0, ratingSum: 0 };
    map[key].revenue   += p.Revenue;
    map[key].cost      += p.Cost;
    map[key].count     += 1;
    map[key].ratingSum += p.Rating;
  });
  return Object.values(map)
    .map(g => ({
      ...g,
      profit: g.revenue - g.cost,
      margin: g.revenue > 0 ? ((g.revenue - g.cost) / g.revenue) * 100 : 0,
      avgRating: Math.round((g.ratingSum / g.count) * 10) / 10,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

/** Shorthand wrappers for common groupings. */
export const groupByService = projects => groupBy(projects, "Service");
export const groupByCity    = projects => groupBy(projects, "City");
export const groupByClient  = projects => groupBy(projects, "Client_Name");
export const groupByMarket  = projects => groupBy(projects, "Market");

// ─── Filtering ────────────────────────────────────────────────────────────────

/** Filter projects by service and/or city. Pass "All" to skip a filter. */
export function filterProjects(projects, { service = "All", city = "All" } = {}) {
  return projects.filter(p => {
    if (service !== "All" && p.Service !== service) return false;
    if (city    !== "All" && p.City    !== city)    return false;
    return true;
  });
}

// ─── Top-N helpers ────────────────────────────────────────────────────────────

/** Return the top N projects by revenue. */
export function topByRevenue(projects, n = 5) {
  return [...projects].sort((a, b) => b.Revenue - a.Revenue).slice(0, n);
}

/** Return the top N projects by rating. */
export function topByRating(projects, n = 5) {
  return [...projects].sort((a, b) => b.Rating - a.Rating).slice(0, n);
}

// ─── Rating distribution ──────────────────────────────────────────────────────

/**
 * Bucket projects into rating bands: 3–3.5, 3.5–4, 4–4.5, 4.5–5.
 * Returns an array of { label, count } objects.
 */
export function getRatingDistribution(projects) {
  const bands = [
    { label: "3.0 – 3.5", min: 3.0, max: 3.5 },
    { label: "3.5 – 4.0", min: 3.5, max: 4.0 },
    { label: "4.0 – 4.5", min: 4.0, max: 4.5 },
    { label: "4.5 – 5.0", min: 4.5, max: 5.1 },
  ];
  return bands.map(b => ({
    label: b.label,
    count: projects.filter(p => p.Rating >= b.min && p.Rating < b.max).length,
  }));
}

// ─── Monthly trend ────────────────────────────────────────────────────────────

/**
 * Aggregate revenue and cost by calendar month (YYYY-MM) using Start_Date.
 * Returns an array sorted chronologically.
 */
export function getMonthlyTrend(projects) {
  const map = {};
  projects.forEach(p => {
    const month = p.Start_Date.slice(0, 7); // "YYYY-MM"
    if (!map[month]) map[month] = { month, revenue: 0, cost: 0, count: 0 };
    map[month].revenue += p.Revenue;
    map[month].cost    += p.Cost;
    map[month].count   += 1;
  });
  return Object.values(map)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(m => ({ ...m, profit: m.revenue - m.cost }));
}
