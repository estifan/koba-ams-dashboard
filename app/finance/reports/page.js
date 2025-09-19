"use client";

import { useState } from "react";
import { Calendar, Download, Filter, Loader2, AlertCircle, X as XIcon } from "lucide-react";
import { gql } from "@apollo/client";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";

// Queries
const GET_EMPLOYEES = gql`
  query GetEmployeeUsers {
    GetEmployeeUsers {
      id
      fullName
    }
  }
`;

const GET_BRANCHES = gql`
  query Branches {
    branches {
      id
      name
    }
  }
`;

const ALLOWANCE_SUMMARY = gql`
  query AllowanceSummary($month: Month!, $year: Int!) {
    allowanceSummary(month: $month, year: $year) {
      totalIssued
      totalUsed
      remainingBalance
      usagePercentage
    }
  }
`;

const OVER_USAGE_CASES = gql`
  query OverUsageCases($month: Month!, $year: Int!) {
    overUsageCases(month: $month, year: $year) {
      userId
      userName
      allowedAmount
      usedAmount
      overUsage
    }
  }
`;

const ALLOWANCE_USAGE_TREND = gql`
  query AllowanceUsageTrend($months: Int) {
    allowanceUsageTrend(months: $months) {
      month
      selfUsage
      guestUsage
    }
  }
`;

const OVER_USAGE_BY_GROUP = gql`
  query OverUsageByGroup($month: Month!, $year: Int!) {
    overUsageByGroup(month: $month, year: $year) {
      groupName
      totalOverUsage
      employeeCount
    }
  }
`;

// Helper function to get current month and year
const getCurrentMonthYear = () => {
  const now = new Date();
  const month = now.toLocaleString("default", { month: "long" }).toUpperCase();
  const year = now.getFullYear();
  return { month, year };
};

export default function FinanceReportsPage() {
  const router = useRouter();

  const [dateRange, setDateRange] = useState(() => {
    const { month, year } = getCurrentMonthYear();
    return { month, year };
  });

  const [activeTab, setActiveTab] = useState("summary");
  const [filters, setFilters] = useState({
    branchId: null,
    orderType: null,
    page: 1,
    limit: 10,
  });
  const [filterValues, setFilterValues] = useState({
    branchId: "",
    orderType: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [preset, setPreset] = useState("default");

  const onError = (error) => {
    console.error("GraphQL Error:", error);
    toast.error("Failed to fetch data. Please try again.");
  };

  const { data: employeesData } = useQuery(GET_EMPLOYEES, { fetchPolicy: "cache-and-network" });
  const { data: branchesData } = useQuery(GET_BRANCHES, { fetchPolicy: "cache-and-network" });

  const employees = employeesData?.GetEmployeeUsers || [];
  const branches = branchesData?.branches || [];

  const handleEmployeeClick = (employee) => {
    router.push(`/finance/reports/${employee.userId || employee.id}`);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "" ? null : value,
      ...(key === "startDate" || key === "endDate" ? { page: 1 } : {}),
    }));
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({ branchId: null, orderType: null, page: 1 });
    setFilterValues({ branchId: "", orderType: "" });
  };

  const formatMonthYear = (month, year) => {
    const safeMonth = month.charAt(0) + month.slice(1).toLowerCase();
    return new Date(`${safeMonth} 1, ${year}`).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const { data: summaryData, loading: summaryLoading } = useQuery(ALLOWANCE_SUMMARY, {
    variables: { month: dateRange.month, year: parseInt(dateRange.year) },
    onError,
    skip: !dateRange.month || !dateRange.year,
  });

  const { data: overUsageData, loading: overUsageLoading } = useQuery(OVER_USAGE_CASES, {
    variables: { month: dateRange.month, year: parseInt(dateRange.year) },
    onError,
    skip: !dateRange.month || !dateRange.year,
  });

  const { data: trendData, loading: trendLoading } = useQuery(ALLOWANCE_USAGE_TREND, {
    variables: { months: 6 },
    onError,
  });

  const { data: groupData, loading: groupLoading } = useQuery(OVER_USAGE_BY_GROUP, {
    variables: { month: dateRange.month, year: parseInt(dateRange.year) },
    onError,
    skip: !dateRange.month || !dateRange.year,
  });

  const monthOptions = (() => {
    const months = [
      "JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE",
      "JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"
    ];
    const currentYear = new Date().getFullYear();
    const options = [];
    for (let i = 0; i <= new Date().getMonth(); i++)
      options.push({ value: months[i], label: `${months[i][0]+months[i].slice(1).toLowerCase()} ${currentYear}`, year: currentYear });
    for (let i = new Date().getMonth() + 1; i < 12; i++)
      options.push({ value: months[i], label: `${months[i][0]+months[i].slice(1).toLowerCase()} ${currentYear -1}`, year: currentYear -1 });
    return options;
  })();

  const currentSelection =
    monthOptions.find((opt) => opt.value === dateRange.month && opt.year === dateRange.year)?.label ||
    formatMonthYear(dateRange.month, dateRange.year);

  const handleMonthYearChange = (month, year) => setDateRange({ month, year });
  const formatCurrency = (amount) => new Intl.NumberFormat("en-US",{ style:"currency",currency:"ETB",minimumFractionDigits:0,maximumFractionDigits:0 }).format(amount);
  const calculatePercentage = (value, total) => (!total ? 0 : Math.min(100, Math.round((value / total) * 100)));

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{formatMonthYear(dateRange.month, dateRange.year)}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <select
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              value={dateRange.month}
              onChange={(e) => {
                const selected = monthOptions.find((opt) => opt.value === e.target.value);
                if (selected) handleMonthYearChange(selected.value, selected.year);
              }}
            >
              {monthOptions.map((option) => (
                <option key={`${option.value}-${option.year}`} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm inline-flex items-center gap-2">
              <Download size={16}/> Export Excel
            </button>
            <button className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm inline-flex items-center gap-2">
              <Download size={16}/> Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "summary", label: "Summary" },
            { id: "trends", label: "Usage Trends" },
            { id: "over-usage", label: "Over Usage" },
            { id: "groups", label: "By Group" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Summary */}
      {activeTab === "summary" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card title="Total Allowance Issued" loading={summaryLoading}>
            <p className="text-3xl font-bold text-black dark:text-white">{formatCurrency(summaryData?.allowanceSummary?.totalIssued || 0)}</p>
            <p className="text-sm text-gray-500 mt-1">{formatMonthYear(dateRange.month, dateRange.year)}</p>
          </Card>
          <Card title="Allowance Used" loading={summaryLoading}>
            <p className={`${summaryData?.allowanceSummary?.usagePercentage < 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'} text-3xl font-bold`}>{formatCurrency(summaryData?.allowanceSummary?.totalUsed || 0)}</p>
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div className={`h-2.5 rounded-full ${summaryData?.allowanceSummary?.usagePercentage < 100 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${summaryData?.allowanceSummary?.usagePercentage > 100 ? 100 : summaryData?.allowanceSummary?.usagePercentage || 0}%` }} />
            </div>
            <p className={`${summaryData?.allowanceSummary?.usagePercentage < 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'} text-xs text-gray-500 mt-1 text-right`}>{summaryData?.allowanceSummary?.usagePercentage?.toFixed(1) || 0}% utilized</p>
          </Card>
          <Card title="Remaining Balance" loading={summaryLoading}>
            <p className={`${summaryData?.allowanceSummary?.remainingBalance > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'} text-3xl font-bold`}>{formatCurrency(summaryData?.allowanceSummary?.remainingBalance || 0)}</p>
            <p className={`${summaryData?.allowanceSummary?.remainingBalance > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'} text-sm text-gray-500 mt-1`}>{summaryData?.allowanceSummary?.remainingBalance > 0 ? 'Remaining' : 'Overspent'}</p>
          </Card>
          <Card title="Over Usage Cases" loading={overUsageLoading}>
            <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">{overUsageData?.overUsageCases?.length || 0}</p>
            <p className="text-sm text-gray-500 mt-1">{overUsageData?.overUsageCases?.length === 1 ? 'Employee' : 'Employees'} exceeded limits</p>
          </Card>
        </div>
      )}

      {/* Usage Trends */}
      {activeTab === "trends" && (
        <Card title="Allowance Usage Trend" desc="Self vs Guest by month" loading={trendLoading}>
          {trendData?.allowanceUsageTrend?.length > 0 ? (
            <div className="h-56 w-full flex items-end gap-1">
              {trendData.allowanceUsageTrend.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex justify-center gap-0.5">
                    <div className="w-3 bg-emerald-500 rounded-t-sm" style={{ height: `${(item.selfUsage/1000)*2}px` }} title={`Self: ${item.selfUsage} ETB`} />
                    <div className="w-3 bg-amber-500 rounded-t-sm" style={{ height: `${(item.guestUsage/1000)*2}px` }} title={`Guest: ${item.guestUsage} ETB`} />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{item.month.substring(0,3)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">{trendLoading ? <Loader2 className="animate-spin" /> : 'No trend data available'}</div>
          )}
        </Card>
      )}

      {/* Over Usage */}
      {activeTab === "over-usage" && (
        <Card title="Over Usage Cases" desc={`Employees who exceeded allowance in ${formatMonthYear(dateRange.month, dateRange.year)}`} loading={overUsageLoading}>
          {overUsageData?.overUsageCases?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Allowed</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Used</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Over Usage</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {overUsageData.overUsageCases.map((item) => (
                    <tr key={item.userId} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => handleEmployeeClick(item)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{item.userName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">ID: {item.userId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right dark:text-white">{formatCurrency(item.allowedAmount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right dark:text-white">{formatCurrency(item.usedAmount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-rose-600 dark:text-rose-400">{formatCurrency(item.overUsage)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">{overUsageLoading ? <Loader2 className="animate-spin" /> : 'No over-usage cases found'}</div>
          )}
        </Card>
      )}

      {/* By Group */}
      {activeTab === "groups" && (
        <Card title="Over-Usage by Group" desc={`Group-wise over-usage for ${formatMonthYear(dateRange.month, dateRange.year)}`} loading={groupLoading}>
          {groupData?.overUsageByGroup?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupData.overUsageByGroup.map((group) => (
                <div key={group.groupName} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{group.groupName}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{group.employeeCount} {group.employeeCount === 1 ? 'employee' : 'employees'}</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200">{formatCurrency(group.totalOverUsage)} over</span>
                  </div>
                  <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${calculatePercentage(group.totalOverUsage, summaryData?.allowanceSummary?.totalIssued || 1)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">{groupLoading ? <Loader2 className="animate-spin" /> : 'No group over-usage data'}</div>
          )}
        </Card>
      )}
    </div>
  );
}

// Simple reusable Card component
function Card({ title, desc, loading, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
          {desc && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{desc}</p>}
        </div>
        {loading && <Loader2 className="animate-spin text-gray-400" />}
      </div>
      {children}
    </div>
  );
}
