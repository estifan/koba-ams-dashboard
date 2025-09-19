"use client";

import { useState, useEffect } from "react";
import { Download, Plus, Settings2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";


// GraphQL Queries
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

export default function FinanceOverviewPage() {
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' }).toUpperCase();
  const currentYear = currentDate.getFullYear();
  const router = useRouter();

  // Fetch data using GraphQL queries
  const { data: summaryData, loading: summaryLoading } = useQuery(ALLOWANCE_SUMMARY, {
    variables: { month: currentMonth, year: currentYear },
    fetchPolicy: 'cache-and-network'
  });

  const { data: overUsageData, loading: overUsageLoading } = useQuery(OVER_USAGE_CASES, {
    variables: { month: currentMonth, year: currentYear },
    fetchPolicy: 'cache-and-network'
  });

  const { data: trendData, loading: trendLoading } = useQuery(ALLOWANCE_USAGE_TREND, {
    variables: { months: 6 },
    fetchPolicy: 'cache-and-network'
  });

  const { data: groupData, loading: groupLoading } = useQuery(OVER_USAGE_BY_GROUP, {
    variables: { month: currentMonth, year: currentYear },
    fetchPolicy: 'cache-and-network'
  });

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Finance Overview</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Monthly allowance insights for {currentMonth} {currentYear}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm inline-flex items-center gap-2"
          onClick={() => router.push('/finance/allowances')}
          >
            <Plus size={16}/> Assign Allowances
          </button>
          <button className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm inline-flex items-center gap-2">
            <Settings2 size={16}/> Adjust Balances
          </button>
          <button className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm inline-flex items-center gap-2">
            <Download size={16}/> Export Summary
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPI 
          title="Total Issued" 
          value={summaryLoading ? '...' : formatCurrency(summaryData?.allowanceSummary?.totalIssued || 0)} 
          sub="This month" 
          trend="up"
        />
        <KPI 
          title="Total Used" 
          value={summaryLoading ? '...' : formatCurrency(summaryData?.allowanceSummary?.totalUsed || 0)} 
          sub="Approved spend" 
          trend="up"
        />
        <KPI 
          title="Remaining Balance" 
          value={formatCurrency(summaryData?.allowanceSummary?.remainingBalance || 0)} 
          sub="of issued" 
          trend={summaryData?.allowanceSummary?.usagePercentage > 90 ? 'down' : 'up'}
        />
        <KPI 
          title="Over-Usage Cases" 
          value={overUsageLoading ? '...' : overUsageData?.overUsageCases?.length || 0} 
          sub="employees" 
          trend={overUsageData?.overUsageCases?.length > 5 ? 'up' : 'down'}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card title="Allowance Usage Trend" desc="Self vs Guest by month">
          <div className="h-56 w-full p-4">
            {trendLoading ? (
              <div className="h-full w-full flex items-center justify-center text-gray-400">Loading data...</div>
            ) : (
              <div className="h-full w-full flex items-end gap-1">
                {trendData?.allowanceUsageTrend?.map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex justify-center gap-0.5">
                      <div 
                        className="w-3 bg-emerald-500 rounded-t-sm" 
                        style={{ height: `${(item.selfUsage / 1000) * 2}px` }}
                        title={`Self: ${item.selfUsage} ETB`}
                      ></div>
                      <div 
                        className="w-3 bg-amber-500 rounded-t-sm" 
                        style={{ height: `${(item.guestUsage / 1000) * 2}px` }}
                        title={`Guest: ${item.guestUsage} ETB`}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {item.month.substring(0, 3)}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-center gap-4 mt-2 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-emerald-500 mr-1"></div>
                <span>Self</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-amber-500 mr-1"></div>
                <span>Guest</span>
              </div>
            </div>
          </div>
        </Card>
        
        <Card title="Over-Usage by Group" desc="Total over-usage amount">
          <div className="h-56 w-full p-4">
            {groupLoading ? (
              <div className="h-full w-full flex items-center justify-center text-gray-400">Loading data...</div>
            ) : (
              <div className="space-y-2">
                {groupData?.overUsageByGroup?.map((group, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{group.groupName}</span>
                      <span className="text-rose-600">{formatCurrency(group.totalOverUsage)}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-rose-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(100, (group.totalOverUsage / 1000) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {group.employeeCount} employee{group.employeeCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
                {groupData?.overUsageByGroup?.length === 0 && (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    No over-usage cases found
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function KPI({ title, value, sub, trend = "flat" }) {
  const colors = trend === "up" ? "text-emerald-600" : trend === "down" ? "text-rose-600" : "text-gray-500";
  const trendIcons = {
    up: <TrendingUp size={14} className="inline" />,
    down: <TrendingDown size={14} className="inline" />,
    flat: <Minus size={14} className="inline" />
  };
  
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
        <span>{sub}</span>
        <span className={`${colors} flex items-center gap-1`}>
          {trendIcons[trend]}
          {trend === "up" ? "+2.8%" : trend === "down" ? "-1.1%" : "0.0%"}
        </span>
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
