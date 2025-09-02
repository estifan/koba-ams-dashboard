"use client";

import { Download, Plus, Settings2 } from "lucide-react";

export default function FinanceOverviewPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Finance Overview</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Monthly allowance insights at a glance.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm inline-flex items-center gap-2"><Plus size={16}/> Assign Allowances</button>
          <button className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm inline-flex items-center gap-2"><Settings2 size={16}/> Adjust Balances</button>
          <button className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm inline-flex items-center gap-2"><Download size={16}/> Export Summary</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPI title="Total Issued" value="$48,000" sub="This month" trend="up"/>
        <KPI title="Total Used" value="$36,420" sub="Approved spend" trend="up"/>
        <KPI title="Remaining Balance" value="24%" sub="of issued" trend="flat"/>
        <KPI title="Over-Usage Cases" value="7" sub="employees" trend="down"/>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card title="Allowance Usage Trend" desc="Self vs Guest by day">
          <div className="h-56 w-full rounded-lg border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400">Chart placeholder</div>
        </Card>
        <Card title="Over-Usage by Group" desc="Count and amount over time">
          <div className="h-56 w-full rounded-lg border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400">Chart placeholder</div>
        </Card>
      </div>
    </div>
  );
}

function KPI({ title, value, sub, trend = "flat" }) {
  const colors = trend === "up" ? "text-emerald-600" : trend === "down" ? "text-rose-600" : "text-gray-500";
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
        <span>{sub}</span>
        <span className={`${colors}`}>{trend === "up" ? "+2.8%" : trend === "down" ? "-1.1%" : "0.0%"}</span>
      </div>
    </div>
  );
}

function Card({ title, desc, children }) {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
      </div>
      {children}
    </div>
  );
}
