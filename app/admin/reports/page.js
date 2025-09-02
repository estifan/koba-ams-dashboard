"use client";

import { useMemo, useState } from "react";
import { BarChart3, Calendar, Download, FileText, PieChart, TrendingUp } from "lucide-react";

const PRESETS = [
  { id: "7d", label: "Last 7 days", days: 7 },
  { id: "30d", label: "Last 30 days", days: 30 },
  { id: "90d", label: "Last 90 days", days: 90 },
];

export default function ReportsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [start, setStart] = useState(() => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  const [end, setEnd] = useState(today);
  const [preset, setPreset] = useState("7d");

  const kpis = useMemo(() => {
    // Fake derived KPI values based on date span length
    const days = Math.max(1, Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)));
    const revenue = 1200 + days * 35; // demo formula
    const orders = 140 + Math.floor(days * 3.2);
    const avg = revenue / Math.max(1, orders);
    const refunds = Math.floor(orders * 0.03);
    return { revenue, orders, avg, refunds };
  }, [start, end]);

  function applyPreset(id) {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    setPreset(id);
    const newStart = new Date(Date.now() - p.days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    setStart(newStart);
    setEnd(today);
  }

  function exportCSV() {
    // In-memory demo export
    const rows = [
      ["Metric", "Value"],
      ["Revenue", kpis.revenue.toFixed(2)],
      ["Orders", kpis.orders],
      ["Avg Order", kpis.avg.toFixed(2)],
      ["Refunds", kpis.refunds],
      ["Range", `${start} to ${end}`],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report_${start}_${end}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Analyze performance with detailed reports.</p>
        </div>
        <button onClick={exportCSV} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-sm font-medium">
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"><Calendar size={16} /> From</span>
          <input type="date" value={start} onChange={(e) => { setStart(e.target.value); setPreset("custom"); }} className="w-full md:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
          <span className="text-sm text-gray-600 dark:text-gray-300">To</span>
          <input type="date" value={end} onChange={(e) => { setEnd(e.target.value); setPreset("custom"); }} className="w-full md:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
        </div>
        <div className="flex items-center gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => applyPreset(p.id)}
              className={`px-3 py-2 rounded-lg text-sm border ${preset === p.id ? "bg-emerald-600 text-white border-emerald-600" : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600"}`}
            >
              {p.label}
            </button>
          ))}
          <span className={`px-3 py-2 rounded-lg text-sm border ${preset === "custom" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700" : "bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600"}`}>Custom</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard icon={TrendingUp} label="Revenue" value={`$${kpis.revenue.toFixed(2)}`} sub="vs prev period" trend="up" />
        <KPICard icon={BarChart3} label="Orders" value={kpis.orders} sub="completed" trend="up" />
        <KPICard icon={FileText} label="Avg Order" value={`$${kpis.avg.toFixed(2)}`} sub="per order" trend="flat" />
        <KPICard icon={PieChart} label="Refunds" value={kpis.refunds} sub="count" trend="down" />
      </div>

      {/* Charts (placeholders) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard title="Sales Trend" description="Daily revenue over time">
          <div className="h-56 w-full rounded-lg border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400">Chart placeholder</div>
        </ChartCard>
        <ChartCard title="Category Breakdown" description="Revenue by category">
          <div className="h-56 w-full rounded-lg border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400">Pie/Bar placeholder</div>
        </ChartCard>
      </div>

      {/* Recent Reports Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Reports</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Report</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Generated</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {[{ name: "Sales Summary", period: `${start} — ${end}`, at: new Date().toLocaleString() }, { name: "Items Performance", period: `${start} — ${end}`, at: new Date().toLocaleString() }].map((r, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{r.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{r.period}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{r.at}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button className="px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600">View</button>
                    <button onClick={exportCSV} className="px-3 py-1.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-500">Download</button>
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

function KPICard({ icon: Icon, label, value, sub, trend = "flat" }) {
  const trendInfo = {
    up: { text: "+4.2%", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    down: { text: "-1.3%", color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-900/20" },
    flat: { text: "0.0%", color: "text-gray-500", bg: "bg-gray-50 dark:bg-gray-700" },
  }[trend];
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{sub}</p>
        </div>
        <div className={`p-3 rounded-lg ${trendInfo.bg}`}>
          <Icon className={trend === "down" ? "text-rose-600" : "text-emerald-600"} size={20} />
        </div>
      </div>
      <div className={`mt-3 text-xs font-medium ${trendInfo.color}`}>{trendInfo.text} vs previous</div>
    </div>
  );
}

function ChartCard({ title, description, children }) {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      {children}
    </div>
  );
}
