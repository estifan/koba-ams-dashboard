"use client";

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { Loader2, ArrowLeft } from 'lucide-react';

// GraphQL query to fetch employee details and orders
const GET_EMPLOYEE_ORDERS = gql`
  query GetEmployeeOrders($employeeId: ID!, $startDate: String, $endDate: String, $branchId: ID, $orderType: OrderType) {
   
    orders(
      employeeId: $employeeId,
      startDate: $startDate,
      endDate: $endDate,
      branchId: $branchId,
      orderType: $orderType
    ) {
      id
      totalAmount
      orderType
      createdAt
      guestNote
      branch {
        id
        name
      }
      items {
        id
        quantity
        price
        menuItem {
          id
          name
        }
      }
    }
  }
`;
const GET_EMPLOYEE = gql`
  query GetUsersById($getUsersByIdId: ID!) {
  GetUsersById(id: $getUsersByIdId) {
    id
    fullName
  }
}
`;

// Format currency
const formatCurrency = (amount) => {
  if (amount == null) return '0.00 ETB';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export default function EmployeeOrdersPage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params.employeeId;
  
  // Get current month and year for the date range
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  
  // Format dates for the query
  const startDate = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0];
  const endDate = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];

  // Fetch employee orders
  const { data, loading, error } = useQuery(GET_EMPLOYEE_ORDERS, {
    variables: {
      employeeId,
      startDate,
      endDate
    },
    skip: !employeeId,
    fetchPolicy: 'cache-and-network',
  });
  const { data: employeeData, loading: employeeLoading, error: employeeError } = useQuery(GET_EMPLOYEE, {
    variables: {
      getUsersByIdId: employeeId,
    },
    skip: !employeeId,
    fetchPolicy: 'cache-and-network',
  });

  if (loading || employeeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading employee orders...</p>
        </div>
      </div>
    );
  }

  if (error || employeeError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-2xl w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mt-3 text-lg font-medium text-gray-900 dark:text-white">Error loading orders</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {error.message || 'Failed to load employee orders. Please try again later.'}
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const employee = employeeData?.GetUsersById;
  const orders = data?.orders || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Reports
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {employee?.fullName || 'Employee'}'s Orders
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow px-5 py-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {orders.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          {orders.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {orders.map((order) => (
                <div key={order.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex flex-col md:flex-row md:justify-between">
                    <div className="mb-4 md:mb-0">
                      <div className="flex items-center space-x-3">
                        <span className="px-2 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full">
                          #{order.id.split('-')[0].toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(Number(order.createdAt)).toLocaleString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          {order.orderType || 'N/A'}
                        </span>
                      </div>
                      
                      {order.guestNote && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border-l-4 border-emerald-500">
                          <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                            "{order.guestNote}"
                          </p>
                        </div>
                      )}

                      {order.items?.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                            Order Items
                          </h4>
                          <ul className="space-y-2">
                            {order.items.map((item) => (
                              <li key={item.id} className="flex justify-between text-sm">
                                <span className="text-gray-700 dark:text-gray-300">
                                  {item.quantity}x {item.menuItem?.name || 'Unknown Item'}
                                </span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {formatCurrency(item.quantity * item.price)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {order.items?.length} {order.items?.length === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No orders</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                No orders found for this employee in the selected period.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
