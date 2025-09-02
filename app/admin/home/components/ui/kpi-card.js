"use client";

export function KPICard({ title, value, trend, icon: Icon }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
          <h3 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{value}</h3>
        </div>
        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
          <Icon size={20} />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center text-xs text-gray-500 dark:text-gray-400">
          <span className={`flex items-center ${trend.isUp ? "text-emerald-500" : "text-rose-500"}`}>{trend.isUp ? "↑" : "↓"} {trend.value}%</span>
          <span className="ml-1">{trend.label}</span>
        </div>
      )}
    </div>
  );
}

// Dashboard page content has been moved to app/admin/home/page.js. This module now only exports KPICard.