"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { Check, ArrowLeftCircle, Save } from "lucide-react";

// Queries
const GET_EMPLOYEE_USERS = gql`
  query GetEmployeeUsers {
    GetEmployeeUsers {
      id
      fullName
      email
      verified
      role
      employeeAllowanceGroup { name }
      employeeAllowanceGroupId
    }
  }
`;

const EMPLOYEE_ALLOWANCE_GROUPS = gql`
  query EmployeeAllowanceGroups {
    employeeAllowanceGroups {
      id
      name
      monthlyAllowance
    }
  }
`;

// Mutation
const ASSIGN_EMPLOYEE_ALLOWANCE_GROUP = gql`
  mutation AssignEmployeeAllowanceGroup($userId: ID!, $employeeAllowanceGroupId: ID!) {
    assignEmployeeAllowanceGroup(userId: $userId, employeeAllowanceGroupId: $employeeAllowanceGroupId)
  }
`;

export default function AssignEmployeeAllowanceGroupPage() {
  const [userId, setUserId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // info | success | error
  const [search, setSearch] = useState("");
  const [rowSelections, setRowSelections] = useState({}); // { [userId]: groupId }

  const { data: usersData, loading: usersLoading, error: usersError } = useQuery(GET_EMPLOYEE_USERS);
  const { data: groupsData, loading: groupsLoading, error: groupsError } = useQuery(EMPLOYEE_ALLOWANCE_GROUPS);

  const [assign, { loading: assigning } ] = useMutation(ASSIGN_EMPLOYEE_ALLOWANCE_GROUP, {
    refetchQueries: [
      { query: GET_EMPLOYEE_USERS },
      { query: EMPLOYEE_ALLOWANCE_GROUPS },
    ],
    awaitRefetchQueries: true,
  });
  const [assignRow, { loading: rowAssigning }] = useMutation(ASSIGN_EMPLOYEE_ALLOWANCE_GROUP, {
    refetchQueries: [
      { query: GET_EMPLOYEE_USERS },
      { query: EMPLOYEE_ALLOWANCE_GROUPS },
    ],
    awaitRefetchQueries: true,
  });

  const users = usersData?.GetEmployeeUsers || [];
  const groups = groupsData?.employeeAllowanceGroups || [];

  const selectedUser = useMemo(() => users.find(u => String(u.id) === String(userId)), [users, userId]);
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u =>
      (u.fullName || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.employeeAllowanceGroup?.name || "").toLowerCase().includes(q)
    );
  }, [users, search]);

  const isSameGroup = useMemo(() => {
    if (!selectedUser || !groupId) return false;
    return String(selectedUser.employeeAllowanceGroupId || "") === String(groupId);
  }, [selectedUser, groupId]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 3500);
    return () => clearTimeout(t);
  }, [message]);

  async function onSubmit(e) {
    e.preventDefault();
    setMessage("");
    setMessageType("info");
    if (!userId || !groupId) return;
    if (isSameGroup) {
      setMessageType("error");
      setMessage("Selected group is the same as the user's current group.");
      return;
    }
    try {
      await assign({ variables: { userId: String(userId), employeeAllowanceGroupId: String(groupId) } });
      setMessageType("success");
      setMessage("Assignment successful.");
    } catch (err) {
      setMessageType("error");
      setMessage(err?.message || "Assignment failed.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assign Allowance Group</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Assign an employee to an allowance group.</p>
        </div>
        <Link href="/finance/employee-allowance-groups" className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800">
          <ArrowLeftCircle size={16} /> Back to Groups
        </Link>
      </div>

      {(usersLoading || groupsLoading) && (
        <div className="text-sm text-gray-600 dark:text-gray-300">Loading data...</div>
      )}
      {(usersError || groupsError) && (
        <div className="text-sm text-red-600 dark:text-red-400">Failed to load data.</div>
      )}

      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm border ${messageType === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-200 dark:border-emerald-800' : messageType === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-900/20 dark:text-rose-200 dark:border-rose-800' : 'bg-gray-50 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600' }`}> 
          {message}
        </div>
      )}

      <form onSubmit={onSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Employee</label>
            <select value={userId} onChange={(e) => setUserId(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" required>
              <option value="" disabled>Select employee</option>
              {filteredUsers.map((u) => (
                <option key={u.id} value={u.id}>{u.fullName || u.email} ({u.email})</option>
              ))}
            </select>
            {selectedUser && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Current group: {selectedUser.employeeAllowanceGroup?.name ? (
                  <span className="inline-flex items-center px-2 py-0.5 ml-1 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                    {selectedUser.employeeAllowanceGroup.name}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 ml-1 rounded-full text-[11px] font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300">
                    No Group
                  </span>
                )}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Allowance Group</label>
            <select value={groupId} onChange={(e) => setGroupId(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" required>
              <option value="" disabled>Select group</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            {isSameGroup && (
              <p className="text-xs mt-1 text-rose-600 dark:text-rose-400">This is the user's current group. Choose a different group to proceed.</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button type="submit" disabled={!userId || !groupId || assigning || isSameGroup} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-sm">
            <Save size={16} /> {assigning ? "Assigning..." : "Assign"}
          </button>
          {selectedUser && (
            <span className="text-xs text-gray-600 dark:text-gray-300">Assign to: <strong>{selectedUser.fullName || selectedUser.email}</strong></span>
          )}
        </div>
      </form>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Employees & Current Allowance Group</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Employees without a group are highlighted in red.</p>
          </div>
          <div className="min-w-[220px]">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email or group" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Allowance Group</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Change Group</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((u) => {
                const hasGroup = !!u.employeeAllowanceGroupId && !!u.employeeAllowanceGroup?.name;
                const currentId = String(u.employeeAllowanceGroupId || "");
                const selected = rowSelections[u.id] !== undefined ? String(rowSelections[u.id]) : currentId;
                return (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">{u.fullName || u.email}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{u.email}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm">
                      {hasGroup ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                          {u.employeeAllowanceGroup.name}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300">
                          No Group
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm">
                      <select
                        value={selected}
                        onChange={(e) => setRowSelections((prev) => ({ ...prev, [u.id]: e.target.value }))}
                        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm min-w-[200px]"
                      >
                        <option value="">Select group</option>
                        {groups.map((g) => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={async () => {
                            if (!selected || selected === currentId) return;
                            await assignRow({ variables: { userId: String(u.id), employeeAllowanceGroupId: String(selected) } });
                          }}
                          disabled={!selected || selected === currentId || rowAssigning}
                          className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white"
                        >
                          {rowAssigning ? 'Saving...' : 'Save'}
                        </button>
                        <button onClick={() => { setUserId(String(u.id)); setGroupId(selected || ""); }} className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50">Select</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No employees found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
