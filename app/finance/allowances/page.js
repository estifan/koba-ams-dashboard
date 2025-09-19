"use client";

import { Download, Upload, Settings2, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

// GraphQL: Employee Allowances
const EMPLOYEE_ALLOWANCES = gql`
  query EmployeeAllowances($userId: ID, $month: Month, $year: Int) {
    employeeAllowances(userId: $userId, month: $month, year: $year) {
      id
      user {
        fullName
        email
        employeeAllowanceGroup {
          name
        }
      }
      month
      year
      initialAmount
      currentBalance
      createdAt
      updatedAt
    }
  }
`;

export default function AllowanceManagementPage() {
  const [view, setView] = useState("employee");
  // Fetch employee allowances (no filters initially)
  const { data, loading, error } = useQuery(EMPLOYEE_ALLOWANCES, { variables: {} });
  const allowances = data?.employeeAllowances || [];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Allowance Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage monthly allowances by group and employee.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm inline-flex items-center gap-2"><Upload size={16} /> Import</button>
          <button className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm inline-flex items-center gap-2"><Download size={16} /> Export</button>
          <button className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm inline-flex items-center gap-2"><Plus size={16} /> Set Group Allowance</button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => setView("group")} className={`px-3 py-2 rounded-lg text-sm border ${view === "group" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600"}`}>By Group</button>
        <button onClick={() => setView("employee")} className={`px-3 py-2 rounded-lg text-sm border ${view === "employee" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600"}`}>By Employee</button>
      </div>

      {view === "group" ? (
        <GroupTable />
      ) : (
        <EmployeeTable allowances={allowances} loading={loading} error={error} />
      )}
    </div>
  );
}

function GroupTable() {
  const rows = [
    { name: "Senior Managers", amount: 400, employees: 12, issued: 4800, used: 3610 },
    { name: "Middle Managers", amount: 300, employees: 25, issued: 7500, used: 5220 },
    { name: "Lower Managers", amount: 200, employees: 40, issued: 8000, used: 6120 },
  ];
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Group</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Monthly Allowance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employees</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Issued</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Used</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {rows.map((r) => (
              <tr key={r.name} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{r.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{r.amount.toFixed(2)} ETB</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{r.employees}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{r.issued.toFixed(2)} ETB</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{r.used.toFixed(2)} ETB</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"><Pencil size={14} /> Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmployeeTable({ allowances, loading, error }) {
  if (loading) {
    return <div className="text-sm text-gray-600 dark:text-gray-300">Loading employee allowances...</div>;
  }
  if (error) {
    return <div className="text-sm text-red-600 dark:text-red-400">Failed to load employee allowances.</div>;
  }
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Group</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Initial Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Current Balance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Month</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Year</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Updated</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {allowances.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  <div>{a.user?.fullName || a.user?.email || ""}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{a.user?.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{a.user?.employeeAllowanceGroup?.name || "-"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200"> {typeof a.initialAmount === 'number' ? a.initialAmount.toFixed(2) : a.initialAmount} ETB</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${a.currentBalance < 0 ? "text-rose-600" : "text-gray-700 dark:text-gray-200"}`}>{typeof a.currentBalance === 'number' ? a.currentBalance.toFixed(2) : a.currentBalance} ETB</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{a.month}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{a.year}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{a.updatedAt ? new Date(a.updatedAt).toLocaleString() : "-"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"><Settings2 size={14} /> Adjust</button>
                </td>
              </tr>
            ))}
            {allowances.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">No employee allowances found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
