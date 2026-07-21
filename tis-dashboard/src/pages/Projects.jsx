import { useState } from "react";
import { NAVY, GOLD, formatCurrency } from "../constants";
import KpiCard      from "../components/KpiCard";
import ServiceBadge from "../components/ServiceBadge";
import DataTable    from "../components/DataTable";
import SectionHeader from "../components/SectionHeader";
import RatingBar    from "../components/RatingBar";

function Projects({ data }) {
  const [service, setService] = useState("All");
  const [city, setCity]       = useState("All");

  let filtered = data;
  if (service !== "All") filtered = filtered.filter(p => p.Service === service);
  if (city !== "All")    filtered = filtered.filter(p => p.City === city);

  let revenue = 0, cost = 0;
  filtered.forEach(p => { revenue += p.Revenue; cost += p.Cost; });
  const profit = revenue - cost;

  return (
    <div className="flex gap-5 p-6">

      {/* filter panel */}
      <div className="w-52 shrink-0 space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-sm font-semibold mb-4" style={{ color: NAVY }}>🔍 Filters</h2>

          <div className="mb-4">
            <label className="text-xs uppercase tracking-wide" style={{ color: "#7aa3cc" }}>Service</label>
            <select
              className="w-full border rounded-lg mt-1.5 p-2 text-sm focus:outline-none"
              style={{ borderColor: "#c8d8e8" }}
              value={service}
              onChange={e => setService(e.target.value)}
            >
              <option value="All">All Services</option>
              <option value="Electrical">Electrical</option>
              <option value="HVAC">HVAC</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Interior_Fitout">Interior Fitout</option>
              <option value="Exterior_Fitout">Exterior Fitout</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="text-xs uppercase tracking-wide" style={{ color: "#7aa3cc" }}>City</label>
            <select
              className="w-full border rounded-lg mt-1.5 p-2 text-sm focus:outline-none"
              style={{ borderColor: "#c8d8e8" }}
              value={city}
              onChange={e => setCity(e.target.value)}
            >
              <option value="All">All Cities</option>
              <option value="Noida">Noida</option>
              <option value="Gurgaon">Gurgaon</option>
              <option value="Delhi">Delhi</option>
              <option value="Faridabad">Faridabad</option>
              <option value="Ghaziabad">Ghaziabad</option>
            </select>
          </div>

          {(service !== "All" || city !== "All") && (
            <button
              onClick={() => { setService("All"); setCity("All"); }}
              className="w-full text-xs rounded-lg py-1.5 border"
              style={{ color: GOLD, borderColor: GOLD }}
            >
              ✕ Clear filters
            </button>
          )}
        </div>

        {/* project count box */}
        <div className="rounded-xl p-4" style={{ background: NAVY }}>
          <p className="text-xs mb-1" style={{ color: "#7aa3cc" }}>Showing</p>
          <p className="text-3xl font-bold" style={{ color: GOLD }}>{filtered.length}</p>
          <p className="text-xs mt-1" style={{ color: "#7aa3cc" }}>projects</p>
        </div>
      </div>

      {/* main content */}
      <div className="flex-1">
        <div className="mb-5">
          <SectionHeader title="Projects" subtitle="Filter and explore project data" />
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          <KpiCard label="Projects" value={filtered.length} accent={NAVY} />
          <KpiCard label="Revenue"  value={formatCurrency(revenue)} accent={GOLD} />
          <KpiCard label="Profit"   value={formatCurrency(profit)}  accent={profit >= 0 ? "#2e5484" : "#ef4444"} />
        </div>

        {/* table */}
        <DataTable
          caption="Project List"
          rows={filtered}
          rowKey="Project_ID"
          maxRows={15}
          columns={[
            { key: "Client_Name", label: "Client",  render: row => <span className="font-medium" style={{ color: NAVY }}>{row.Client_Name}</span> },
            { key: "City",        label: "City",    render: row => <span className="text-gray-500">{row.City}</span> },
            { key: "Service",     label: "Service", render: row => <ServiceBadge service={row.Service} /> },
            { key: "Revenue",     label: "Revenue", render: row => <span className="font-semibold" style={{ color: GOLD }}>{formatCurrency(row.Revenue)}</span> },
            { key: "Cost",        label: "Cost",    render: row => <span className="text-red-400">{formatCurrency(row.Cost)}</span> },
            { key: "Rating",      label: "Rating",  render: row => <RatingBar rating={row.Rating} /> },
          ]}
        />
      </div>
    </div>
  );
}

export default Projects;
