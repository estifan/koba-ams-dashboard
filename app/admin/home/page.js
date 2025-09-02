"use client"
import { Users, List, ClipboardList, FileSpreadsheet } from "lucide-react";
import { KPICard } from "./components/ui/kpi-card";

// Sidebar and header moved to app/admin/layout.js

// KPICard is now imported from ./components/ui/kpi-card

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <KPICard 
          title="Total Employees" 
          value="124" 
          trend={{ isUp: true, value: '12.5', label: 'vs last month' }}
          icon={Users}
        />
        <KPICard 
          title="Active Groups" 
          value="8" 
          trend={{ isUp: false, value: '2.3', label: 'vs last month' }}
          icon={List}
        />
        <KPICard 
          title="Menu Items" 
          value="48" 
          trend={{ isUp: true, value: '5.2', label: 'new items' }}
          icon={ClipboardList}
        />
        <KPICard 
          title="This Month's Orders" 
          value="1,248" 
          trend={{ isUp: true, value: '24.1', label: 'vs last month' }}
          icon={FileSpreadsheet}
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Action
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {[
                { date: '2025-09-01', action: 'Menu price updated', user: 'Admin', status: 'completed' },
                { date: '2025-08-30', action: 'New group created', user: 'Finance', status: 'completed' },
                { date: '2025-08-29', action: 'Employee added', user: 'Admin', status: 'pending' },
                { date: '2025-08-28', action: 'Menu items imported', user: 'Manager', status: 'completed' },
                { date: '2025-08-27', action: 'User permissions updated', user: 'Admin', status: 'completed' },
              ].map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {item.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {item.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {item.user}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.status === 'completed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-700 text-right">
          <a href="#" className="text-sm font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300">
            View all activity →
          </a>
        </div>
      </div>
    </div>
  );
}