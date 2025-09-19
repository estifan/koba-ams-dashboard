"use client";

import { useState, useCallback, useEffect } from "react";
import { Calendar, Download } from "lucide-react";
import { useQuery } from "@apollo/client/react";
import { GET_ORDERS, GET_EMPLOYEES, GET_BRANCHES } from "@/lib/queries/transactions";

export default function FinanceTransactionsPage() {
  const [filters, setFilters] = useState({
    employeeId: null,
    branchId: null,
    startDate: null,
    endDate: null,
    orderType: null,
    page: 1,
    limit: 10,
  });

  // This state will store the actual filter values from the form
  const [filterValues, setFilterValues] = useState({
    startDate: '',
    endDate: '',
    employeeId: '',
    branchId: '',
    orderType: '',
  });

  // Fetch employees and branches
  const { data: employeesData, loading: loadingEmployees } = useQuery(GET_EMPLOYEES, {
    fetchPolicy: 'cache-and-network',
  });

  const { data: branchesData, loading: loadingBranches } = useQuery(GET_BRANCHES, {
    fetchPolicy: 'cache-and-network',
  });

  const employees = employeesData?.GetEmployeeUsers || [];
  const branches = branchesData?.branches || [];

  const { loading, error, data } = useQuery(GET_ORDERS, {
    variables: {
      employeeId: filters.employeeId || undefined,
      branchId: filters.branchId || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      orderType: filters.orderType || undefined,
      page: filters.page,
      limit: filters.limit,
    },
    fetchPolicy: "cache-and-network",
  });

  // Debounce function to prevent too many requests
  const debounce = (func, delay) => {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };

  // Apply filters automatically with debounce
  const applyFilters = useCallback(debounce(() => {
    setFilters(prev => ({
      ...prev,
      employeeId: filterValues.employeeId || null,
      branchId: filterValues.branchId || null,
      startDate: filterValues.startDate || null,
      endDate: filterValues.endDate || null,
      orderType: filterValues.orderType || null,
      page: 1, // Reset to first page when filters change
    }));
  }, 300), [filterValues]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterValues(prev => {
      const newValues = {
        ...prev,
        [name]: value
      };
      return newValues;
    });
  };

  // Apply filters when filterValues change
  useEffect(() => {
    applyFilters();
  }, [filterValues, applyFilters]);

  const resetFilters = () => {
    setFilterValues({
      startDate: '',
      endDate: '',
      employeeId: '',
      branchId: '',
      orderType: '',
    });
    // No need to manually call applyFilters as the effect will handle it
  };

  const orders = data?.orders || [];

  const handleDateChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  if (error) return <div className="p-6 text-red-500">Error loading transactions: {error.message}</div>;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions (Finance)</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Full transaction history with finance filters.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm inline-flex items-center gap-2"><Download size={16}/> Export CSV</button>
          <button className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm inline-flex items-center gap-2"><Download size={16}/> Export PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-3">
        {(loadingEmployees || loadingBranches) && (
          <div className="col-span-6 p-2 text-sm text-gray-500">
            Loading filter options...
          </div>
        )}
        <div className="lg:col-span-2 flex items-center gap-2">
          <span className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Calendar size={16}/> From
          </span>
          <input 
            type="date" 
            name="startDate"
            value={filterValues.startDate}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
          <span className="text-sm text-gray-600 dark:text-gray-300">To</span>
          <input 
            type="date" 
            name="endDate"
            value={filterValues.endDate}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        </div>
        
        <select 
          name="employeeId"
          value={filterValues.employeeId}
          onChange={handleFilterChange}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        >
          <option value="">All Employees</option>
          {employees.map(employee => (
            <option key={employee.id} value={employee.id}>
              {employee.fullName}
            </option>
          ))}
        </select>
        
        <select 
          name="branchId"
          value={filterValues.branchId}
          onChange={handleFilterChange}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        >
          <option value="">All Branches</option>
          {branches.map(branch => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
        
        <select 
          name="orderType"
          value={filterValues.orderType}
          onChange={handleFilterChange}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        >
          <option value="">Order Type: Any</option>
          <option value="SELF">Self</option>
          <option value="GUEST">Guest</option>
        </select>
        
        <button 
          onClick={resetFilters}
          className="px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          Reset Filters
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
        <div className="p-6 text-center text-gray-500">Loading transactions...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date/Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Order Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Branch</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Guest Note</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(Number(order.createdAt)).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {order.employee?.fullName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {order.orderType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {order.branch?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-700 dark:text-red-400">
                      ETB {order.totalAmount?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      
                        {order.orderType === "GUEST" ? order.guestNote : "-"}
                      
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {/* Pagination */}
          {orders.length > 0 && (
            <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={filters.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={orders.length < filters.limit}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span className="font-medium">{(filters.page - 1) * filters.limit + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(filters.page * filters.limit, (filters.page - 1) * filters.limit + orders.length)}
                    </span>{' '}
                    of <span className="font-medium">{filters.page * filters.limit + (orders.length < filters.limit ? 0 : '+')}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={filters.page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200">
                      Page {filters.page}
                    </span>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={orders.length < filters.limit}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
