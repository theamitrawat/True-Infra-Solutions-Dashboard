import { NAVY, GOLD, formatCurrency } from "../constants";
import SectionHeader from "../components/SectionHeader";
import KpiCard       from "../components/KpiCard";

const medals = ["🥇", "🥈", "🥉"];

function Clients({ data }) {
  const clientMap = {};

  data.forEach(item => {
    if (!clientMap[item.Client_Name]) {
      clientMap[item.Client_Name] = { revenue: 0, cost: 0, projects: 0 };
    }
    clientMap[item.Client_Name].revenue  += item.Revenue;
    clientMap[item.Client_Name].cost     += item.Cost;
    clientMap[item.Client_Name].projects += 1;
  });

  const clientData = Object.entries(clientMap)
    .map(([name, val]) => ({ name, ...val, profit: val.revenue - val.cost }))
    .sort((a, b) => b.revenue - a.revenue);

  const topClients = clientData.slice(0, 3);

  return (
    <div className="p-6">
      <SectionHeader title="Clients" subtitle="Revenue and project breakdown by client" />

      {/* total clients banner */}
      <div className="mb-6">
        <KpiCard
          label="Total Clients"
          value={clientData.length}
          sub="unique clients across all services"
          highlight
          icon="👥"
        />
      </div>

      {/* top 3 podium cards */}
      <h2 className="text-sm font-semibold mb-3" style={{ color: NAVY }}>Top Clients by Revenue</h2>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {topClients.map((client, i) => (
          <div key={client.name} className="bg-white rounded-xl shadow-sm p-5"
            style={{ borderTop: `4px solid ${i === 0 ? GOLD : NAVY}` }}>
            <div className="text-2xl mb-2">{medals[i]}</div>
            <p className="font-semibold text-sm" style={{ color: NAVY }}>{client.name}</p>
            <p className="text-lg font-bold mt-1" style={{ color: GOLD }}>{formatCurrency(client.revenue)}</p>
            <p className="text-xs text-gray-400 mt-1">{client.projects} projects</p>
          </div>
        ))}
      </div>

      {/* full client table */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="text-sm font-semibold mb-4" style={{ color: NAVY }}>All Clients</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `2px solid ${NAVY}` }}>
                {["Rank", "Client", "Projects", "Revenue", "Cost", "Profit"].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold" style={{ color: NAVY }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clientData.map((client, i) => (
                <tr key={client.name} className="hover:bg-blue-50 transition-colors"
                  style={{ borderBottom: "1px solid #f0f2f5" }}>
                  <td className="py-2.5 px-3 text-xs font-medium" style={{ color: GOLD }}>
                    {i < 3 ? medals[i] : `#${i + 1}`}
                  </td>
                  <td className="py-2.5 px-3 font-medium" style={{ color: NAVY }}>{client.name}</td>
                  <td className="py-2.5 px-3 text-gray-500">{client.projects}</td>
                  <td className="py-2.5 px-3 font-semibold" style={{ color: GOLD }}>{formatCurrency(client.revenue)}</td>
                  <td className="py-2.5 px-3 text-red-400">{formatCurrency(client.cost)}</td>
                  <td className="py-2.5 px-3 font-semibold"
                    style={{ color: client.profit >= 0 ? "#2e5484" : "#ef4444" }}>
                    {formatCurrency(client.profit)}
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

export default Clients;
