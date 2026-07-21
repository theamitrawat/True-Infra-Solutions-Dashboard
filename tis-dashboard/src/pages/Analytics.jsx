import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  Cell,
} from "recharts";

import { NAVY, GOLD, NAVY_MID, NAVY_LIGHT, PIE_COLORS, formatCurrency } from "../constants";
import {
  getTotals,
  getProfitMargin,
  getAverageRating,
  groupByService,
  groupByCity,
  groupByMarket,
  getRatingDistribution,
  getMonthlyTrend,
  topByRating,
} from "../services/dataService";

import KpiCard       from "../components/KpiCard";
import SectionHeader from "../components/SectionHeader";
import ServiceBadge  from "../components/ServiceBadge";
import RatingBar     from "../components/RatingBar";

// ─── Custom tooltip shared by charts ─────────────────────────────────────────
function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border rounded-lg shadow-lg px-3 py-2 text-xs" style={{ borderColor: "#c8d8e8" }}>
      <p className="font-semibold mb-1" style={{ color: NAVY }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {formatter ? formatter(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
function Analytics({ data }) {
  const { revenue, cost, profit } = getTotals(data);
  const margin     = getProfitMargin(data).toFixed(1);
  const avgRating  = getAverageRating(data);

  const byService  = groupByService(data);
  const byCity     = groupByCity(data);
  const byMarket   = groupByMarket(data);
  const ratingDist = getRatingDistribution(data);
  const monthly    = getMonthlyTrend(data);
  const topRated   = topByRating(data, 8);

  // Radar data — normalise each service's margin to 0–100 scale for the chart
  const radarData = byService.map(s => ({
    service: s.name.replace("_", " "),
    margin:  Math.max(0, Math.round(s.margin)),
    rating:  Math.round(s.avgRating * 20), // scale 0–5 → 0–100
    projects: Math.round((s.count / data.length) * 100),
  }));

  return (
    <div className="p-6">
      <SectionHeader
        title="Analytics 📈"
        subtitle="Deep-dive into margins, trends, ratings, and market segments"
      />

      {/* ── KPI row ── */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Profit Margin"
          value={`${margin}%`}
          sub="revenue − cost / revenue"
          accent={GOLD}
          icon="📊"
        />
        <KpiCard
          label="Avg Rating"
          value={`⭐ ${avgRating}`}
          sub="across all projects"
          accent={NAVY_MID}
          icon="🏆"
        />
        <KpiCard
          label="Total Revenue"
          value={formatCurrency(revenue)}
          sub="all services combined"
          accent={NAVY}
          icon="💰"
        />
        <KpiCard
          label="Net Profit"
          value={formatCurrency(profit)}
          sub={profit >= 0 ? "positive" : "negative"}
          accent={profit >= 0 ? NAVY_MID : "#ef4444"}
          icon="📉"
        />
      </div>

      {/* ── Monthly trend ── */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-5">
        <h3 className="text-sm font-semibold mb-4" style={{ color: NAVY }}>
          Monthly Revenue vs Cost Trend
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={monthly} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: "#6b7280" }}
              tickFormatter={v => v.slice(2)} // "23-01" style
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#6b7280" }}
              tickFormatter={v => "₹" + (v / 100000).toFixed(0) + "L"}
            />
            <Tooltip content={<ChartTooltip formatter={formatCurrency} />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            <Line
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke={GOLD}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="cost"
              name="Cost"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="profit"
              name="Profit"
              stroke={NAVY_MID}
              strokeWidth={2}
              dot={false}
              strokeDasharray="4 2"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Service margin + City revenue side by side ── */}
      <div className="grid grid-cols-2 gap-5 mb-5">

        {/* Profit margin by service */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-semibold mb-4" style={{ color: NAVY }}>
            Profit Margin by Service (%)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byService} barSize={22} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10, fill: "#6b7280" }} tickFormatter={v => `${v.toFixed(0)}%`} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 10, fill: "#6b7280" }}
                tickFormatter={v => v.replace("_", " ")}
                width={90}
              />
              <Tooltip
                formatter={v => `${v.toFixed(1)}%`}
                labelFormatter={l => l.replace("_", " ")}
              />
              <Bar dataKey="margin" name="Margin %" radius={[0, 4, 4, 0]}>
                {byService.map((entry, i) => (
                  <Cell key={entry.name} fill={entry.margin >= 0 ? PIE_COLORS[i % PIE_COLORS.length] : "#ef4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by city */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-semibold mb-4" style={{ color: NAVY }}>
            Revenue by City
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byCity} barSize={28}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} />
              <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} tickFormatter={v => "₹" + (v / 100000).toFixed(0) + "L"} />
              <Tooltip content={<ChartTooltip formatter={formatCurrency} />} />
              <Bar dataKey="revenue" name="Revenue" fill={NAVY} radius={[4, 4, 0, 0]}>
                {byCity.map((entry, i) => (
                  <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Market breakdown + Rating distribution ── */}
      <div className="grid grid-cols-2 gap-5 mb-5">

        {/* Market segment cards */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-semibold mb-4" style={{ color: NAVY }}>
            Market Segment Breakdown
          </h3>
          <div className="space-y-3">
            {byMarket.map((m, i) => {
              const pct = ((m.revenue / revenue) * 100).toFixed(1);
              return (
                <div key={m.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium" style={{ color: NAVY }}>{m.name}</span>
                    <span style={{ color: GOLD }}>{formatCurrency(m.revenue)} · {pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: PIE_COLORS[i % PIE_COLORS.length],
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{m.count} projects · avg ⭐ {m.avgRating}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rating distribution */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-semibold mb-4" style={{ color: NAVY }}>
            Rating Distribution
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={ratingDist} barSize={36}>
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#6b7280" }} />
              <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" name="Projects" fill={GOLD} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-400 mt-3 text-center">
            Overall average: ⭐ {avgRating} across {data.length} projects
          </p>
        </div>
      </div>

      {/* ── Service radar ── */}
      <div className="grid grid-cols-2 gap-5 mb-5">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-semibold mb-4" style={{ color: NAVY }}>
            Service Performance Radar
          </h3>
          <p className="text-xs text-gray-400 mb-3">
            Margin, rating (×20), and project share (%) — all scaled 0–100
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="service" tick={{ fontSize: 10, fill: "#6b7280" }} />
              <Radar name="Margin" dataKey="margin"   stroke={NAVY}     fill={NAVY}     fillOpacity={0.15} />
              <Radar name="Rating" dataKey="rating"   stroke={GOLD}     fill={GOLD}     fillOpacity={0.15} />
              <Radar name="Share"  dataKey="projects" stroke={NAVY_MID} fill={NAVY_MID} fillOpacity={0.10} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Top rated projects */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-semibold mb-4" style={{ color: NAVY }}>
            Top Rated Projects
          </h3>
          <div className="space-y-3">
            {topRated.map((p, i) => (
              <div key={p.Project_ID} className="flex items-center gap-3">
                <span
                  className="text-xs font-bold w-5 text-center shrink-0"
                  style={{ color: i === 0 ? GOLD : NAVY_LIGHT }}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-xs font-medium truncate" style={{ color: NAVY }}>
                      {p.Client_Name}
                    </span>
                    <ServiceBadge service={p.Service} />
                  </div>
                  <RatingBar rating={p.Rating} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Service summary table ── */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="text-sm font-semibold mb-4" style={{ color: NAVY }}>
          Service Summary
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `2px solid ${NAVY}` }}>
                {["Service", "Projects", "Revenue", "Cost", "Profit", "Margin", "Avg Rating"].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold" style={{ color: NAVY }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {byService.map(s => (
                <tr
                  key={s.name}
                  className="hover:bg-blue-50 transition-colors"
                  style={{ borderBottom: "1px solid #f0f2f5" }}
                >
                  <td className="py-2.5 px-3">
                    <ServiceBadge service={s.name} />
                  </td>
                  <td className="py-2.5 px-3 text-gray-500">{s.count}</td>
                  <td className="py-2.5 px-3 font-semibold" style={{ color: GOLD }}>
                    {formatCurrency(s.revenue)}
                  </td>
                  <td className="py-2.5 px-3 text-red-400">{formatCurrency(s.cost)}</td>
                  <td
                    className="py-2.5 px-3 font-semibold"
                    style={{ color: s.profit >= 0 ? NAVY_MID : "#ef4444" }}
                  >
                    {formatCurrency(s.profit)}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className="text-xs font-semibold"
                      style={{ color: s.margin >= 0 ? NAVY_MID : "#ef4444" }}
                    >
                      {s.margin.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <RatingBar rating={s.avgRating} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
