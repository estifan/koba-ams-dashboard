"use client";

import { useState } from "react";
import { Calendar, Download } from "lucide-react";

export default function FinanceReportsPage() {
  const [preset, setPreset] = useState("30d");
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Explore allowance usage and trends.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm inline-flex items-center gap-2"><Download size={16}/> Export Excel</button>
          <button className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm inline-flex items-center gap-2"><Download size={16}/> Export PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"><Calendar size={16}/> From</span>
          <input type="date" className="w-full md:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"/>
          <span className="text-sm text-gray-600 dark:text-gray-300">To</span>
          <input type="date" className="w-full md:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"/>
        </div>
        <div className="flex items-center gap-2">
          {[["7d","Last 7 days"],["30d","Last 30 days"],["90d","Last 90 days"]].map(([id,label]) => (
            <button key={id} onClick={() => setPreset(id)} className={`px-3 py-2 rounded-lg text-sm border ${preset===id?"bg-emerald-600 text-white border-emerald-600":"bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600"}`}>{label}</button>
          ))}
          <span className={`px-3 py-2 rounded-lg text-sm border ${preset === "custom" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700" : "bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600"}`}>Custom</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card title="Allowance Usage Trend (Self vs Guest)" desc="Stacked area/line">
          <div className="h-56 w-full rounded-lg border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400">Chart placeholder</div>
        </Card>
        <Card title="Over-Usage by Employee Group" desc="Bar chart">
          <div className="h-56 w-full rounded-lg border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400">Chart placeholder</div>
        </Card>
        <Card title="Branch-wise Allowance Spend" desc="If multi-branch enabled">
          <div className="h-56 w-full rounded-lg border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400">Chart placeholder</div>
        </Card>
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
