import electricalData from "./data/electrical.json";
import exteriorData from "./data/exterior_fitout.json";
import hvacData from "./data/hvac.json";
import interiorData from "./data/interior_fitout.json";
import maintenanceData from "./data/maintenance.json";
import plumbingData from "./data/plumbing.json";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend
} from "recharts";

import { useState } from "react";
import { NavLink, Routes, Route } from "react-router-dom";
import Projects  from "./pages/Projects";
import Clients   from "./pages/Clients";
import AskAI     from "./pages/AskAI";
import Analytics from "./pages/Analytics";
import KpiCard      from "./components/KpiCard";
import ServiceBadge from "./components/ServiceBadge";
import { NAVY, GOLD, PIE_COLORS, formatCurrency } from "./constants";
import { getTotals, groupByService, groupByCity } from "./services/dataService";

function App() {
  const allProjects = [
    ...electricalData, ...exteriorData, ...hvacData,
    ...interiorData, ...maintenanceData, ...plumbingData,
  ];

  const [selectedService, setSelectedService] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All");

  let filtered = allProjects;
  if (selectedService !== "All") filtered = filtered.filter(p => p.Service === selectedService);
  if (selectedCity !== "All")    filtered = filtered.filter(p => p.City === selectedCity);

  const { revenue: totalRevenue, cost: totalCost, profit: totalProfit } = getTotals(filtered);

  const serviceData = groupByService(filtered).map(s => ({ name: s.name, revenue: s.revenue }));
  const cityData    = groupByCity(filtered).map(c => ({ name: c.name, value: c.count }));

  return (
    <div className="flex h-screen" style={{ background: "#f0f2f5", fontFamily: "sans-serif" }}>

      {/* ---- SIDEBAR ---- */}
      <div className="w-56 shrink-0 flex flex-col" style={{ background: NAVY }}>

        {/* logo area */}
        <div className="px-5 pt-6 pb-5" style={{ borderBottom: "1px solid #2e5484" }}>
          <div className="text-xs tracking-widest uppercase mb-1" style={{ color: "#7aa3cc" }}>
            True Infra
          </div>
          <div className="text-xl font-bold" style={{ color: GOLD }}>
            SOLUTIONS
          </div>
          <div className="text-xs mt-1" style={{ color: "#7aa3cc" }}>
            Analytics Dashboard
          </div>
        </div>

        {/* nav links */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {[
            { to: "/",          label: "Overview",  icon: "📊" },
            { to: "/projects",  label: "Projects",  icon: "🗂️" },
            { to: "/clients",   label: "Clients",   icon: "👥" },
            { to: "/analytics", label: "Analytics", icon: "📈" },
            { to: "/ask-ai",    label: "Ask AI",    icon: "🤖" },
          ].map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm transition-all ${
                  isActive ? "font-semibold" : "hover:opacity-80"
                }`
              }
              style={({ isActive }) => ({
                background: isActive ? GOLD : "transparent",
                color: isActive ? NAVY : "#a8c4e0",
              })}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-5 py-4 text-xs" style={{ color: "#4a7ab5", borderTop: "1px solid #2e5484" }}>
          Internship · 2024
        </div>
      </div>

      {/* ---- MAIN CONTENT ---- */}
      <div className="flex-1 overflow-y-auto">
        <Routes>

          {/* OVERVIEW / DASHBOARD */}
          <Route path="/" element={
            <div className="p-6">

              {/* header banner */}
              <div className="rounded-2xl p-6 mb-6 relative overflow-hidden" style={{ background: NAVY }}>
                <div className="absolute top-0 right-0 h-full w-2" style={{ background: GOLD }} />
                <div className="text-xs tracking-widest uppercase mb-1" style={{ color: "#7aa3cc" }}>
                  True Infra Solutions
                </div>
                <h1 className="text-2xl font-bold text-white">Business Overview</h1>
                <p className="text-sm mt-1" style={{ color: "#a8c4e0" }}>
                  Project Analytics · Construction | Interior Fit-Out | MEP Fit-Out
                </p>
              </div>

              {/* filters */}
              <div className="flex gap-3 mb-6">
                <select
                  className="border rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none"
                  style={{ borderColor: "#c8d8e8" }}
                  value={selectedService}
                  onChange={e => setSelectedService(e.target.value)}
                >
                  <option value="All">All Services</option>
                  <option value="Electrical">Electrical</option>
                  <option value="HVAC">HVAC</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Interior_Fitout">Interior Fitout</option>
                  <option value="Exterior_Fitout">Exterior Fitout</option>
                  <option value="Maintenance">Maintenance</option>
                </select>

                <select
                  className="border rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none"
                  style={{ borderColor: "#c8d8e8" }}
                  value={selectedCity}
                  onChange={e => setSelectedCity(e.target.value)}
                >
                  <option value="All">All Cities</option>
                  <option value="Noida">Noida</option>
                  <option value="Gurgaon">Gurgaon</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Faridabad">Faridabad</option>
                  <option value="Ghaziabad">Ghaziabad</option>
                </select>

                {(selectedService !== "All" || selectedCity !== "All") && (
                  <button
                    onClick={() => { setSelectedService("All"); setSelectedCity("All"); }}
                    className="text-xs rounded-lg px-3 py-2 border"
                    style={{ color: GOLD, borderColor: GOLD, background: "white" }}
                  >
                    ✕ Clear
                  </button>
                )}
              </div>

              {/* KPI cards */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <KpiCard
                  label="Total Projects"
                  value={filtered.length}
                  sub="across all services"
                  accent={NAVY}
                />
                <KpiCard
                  label="Total Revenue"
                  value={formatCurrency(totalRevenue)}
                  sub="combined billing"
                  accent={GOLD}
                />
                <KpiCard
                  label="Net Profit"
                  value={formatCurrency(totalProfit)}
                  sub="revenue minus cost"
                  accent={totalProfit >= 0 ? "#2e5484" : "#ef4444"}
                />
              </div>

              {/* charts */}
              <div className="grid grid-cols-2 gap-5 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-5">
                  <h3 className="text-sm font-semibold mb-4" style={{ color: NAVY }}>Revenue by Service</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={serviceData} barSize={28}>
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} tickFormatter={v => "₹" + (v / 100000).toFixed(0) + "L"} />
                      <Tooltip formatter={v => formatCurrency(v)} />
                      <Bar dataKey="revenue" fill={NAVY} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-5">
                  <h3 className="text-sm font-semibold mb-4" style={{ color: NAVY }}>Projects by City</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={cityData} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={3}>
                        {cityData.map((entry, index) => (
                          <Cell key={`city-${entry.name}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend iconType="circle" iconSize={8} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* recent projects table */}
              <div className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold" style={{ color: NAVY }}>Recent Projects</h2>
                  <span className="text-xs text-gray-400">showing top 10</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${NAVY}` }}>
                        {["Client", "City", "Service", "Revenue", "Cost", "Rating"].map(h => (
                          <th key={h} className="text-left py-2 px-3 text-xs font-semibold" style={{ color: NAVY }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.slice(0, 10).map(item => (
                        <tr key={item.Project_ID} className="transition-colors hover:bg-blue-50"
                          style={{ borderBottom: "1px solid #f0f2f5" }}>
                          <td className="py-2.5 px-3 font-medium" style={{ color: NAVY }}>{item.Client_Name}</td>
                          <td className="py-2.5 px-3 text-gray-500">{item.City}</td>
                          <td className="py-2.5 px-3">
                            <ServiceBadge service={item.Service} />
                          </td>
                          <td className="py-2.5 px-3 font-semibold" style={{ color: GOLD }}>{formatCurrency(item.Revenue)}</td>
                          <td className="py-2.5 px-3 text-red-400">{formatCurrency(item.Cost)}</td>
                          <td className="py-2.5 px-3 font-semibold text-amber-500">⭐ {item.Rating}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          } />

          <Route path="/projects"  element={<Projects  data={allProjects} />} />
          <Route path="/clients"   element={<Clients   data={allProjects} />} />
          <Route path="/analytics" element={<Analytics data={allProjects} />} />
          <Route path="/ask-ai"    element={<AskAI     data={allProjects} />} />

        </Routes>
      </div>
    </div>
  );
}

export default App;