"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, X, Users as UsersIcon } from "lucide-react";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";

const EMPLOYEE_GROUPS = gql`
  query EmployeeGroups {
    employeeGroups {
      id
      name
      monthlyAllowance
    }
  }
`;

const CREATE_EMPLOYEE_GROUP = gql`
  mutation CreateEmployeeGroup($name: String!, $monthlyAllowance: Float!) {
    createEmployeeGroup(name: $name, monthlyAllowance: $monthlyAllowance) {
      id
      name
      monthlyAllowance
    }
  }
`;

const UPDATE_EMPLOYEE_GROUP = gql`
  mutation UpdateEmployeeGroup($updateEmployeeGroupId: ID!, $name: String, $monthlyAllowance: Float) {
    updateEmployeeGroup(id: $updateEmployeeGroupId, name: $name, monthlyAllowance: $monthlyAllowance) {
      id
      name
      monthlyAllowance
    }
  }
`;

const DELETE_EMPLOYEE_GROUP = gql`
  mutation DeleteEmployeeGroup($deleteEmployeeGroupId: ID!) {
    deleteEmployeeGroup(id: $deleteEmployeeGroupId)
  }
`;

export default function GroupsPage() {
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // { id?, name, monthlyAllowance }
  const { data, loading, error } = useQuery(EMPLOYEE_GROUPS);
  const [createGroup, { loading: creating }] = useMutation(CREATE_EMPLOYEE_GROUP, {
    refetchQueries: [{ query: EMPLOYEE_GROUPS }],
    awaitRefetchQueries: true,
  });
  const [updateGroup, { loading: updating }] = useMutation(UPDATE_EMPLOYEE_GROUP, {
    refetchQueries: [{ query: EMPLOYEE_GROUPS }],
    awaitRefetchQueries: true,
  });
  const [deleteGroup, { loading: deleting }] = useMutation(DELETE_EMPLOYEE_GROUP, {
    refetchQueries: [{ query: EMPLOYEE_GROUPS }],
    awaitRefetchQueries: true,
  });

  const groups = data?.employeeGroups || [];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) => {
      const allowance = (g.monthlyAllowance ?? "").toString();
      return (g.name || "").toLowerCase().includes(q) || allowance.includes(q);
    });
  }, [groups, query]);

  function openAdd() {
    setEditing({ id: null, name: "", monthlyAllowance: "" });
    setModalOpen(true);
  }

  function openEdit(g) {
    setEditing({ id: g.id, name: g.name || "", monthlyAllowance: g.monthlyAllowance ?? "" });
    setModalOpen(true);
  }

  async function onDelete(id) {
    if (!id) return;
    if (!confirm("Delete this employee group?")) return;
    try {
      await deleteGroup({ variables: { deleteEmployeeGroupId: String(id) } });
    } catch (err) {
      console.error(err);
    }
  }

  async function onSave(e) {
    e.preventDefault();
    if (!editing) return;
    const name = (editing.name || "").trim();
    const monthlyAllowance = parseFloat(editing.monthlyAllowance);
    if (!name) return;
    if (Number.isNaN(monthlyAllowance)) return;
    try {
      if (editing.id == null) {
        await createGroup({ variables: { name, monthlyAllowance } });
      } else {
        await updateGroup({ variables: { updateEmployeeGroupId: String(editing.id), name, monthlyAllowance } });
      }
      setModalOpen(false);
      setEditing(null);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employee Groups</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Organize employees into groups for easier management.</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-sm font-medium">
          <Plus size={16} /> New Group
        </button>
      </div>

      {/* Filter */}
      <div className="grid grid-cols-1 gap-3">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search groups by name or allowance"
            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="text-sm text-gray-600 dark:text-gray-300">Loading groups...</div>
      )}
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">Failed to load employee groups.</div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Group</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Monthly Allowance</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filtered.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                      <UsersIcon size={16} />
                    </span>
                    {g.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{g.monthlyAllowance}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={() => openEdit(g)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                      <Pencil size={14} /> Edit
                    </button>
                    <button onClick={() => onDelete(g.id)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    No groups match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setModalOpen(false); setEditing(null); }} />
          <div className="relative z-10 w-full max-w-md rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{editing.id == null ? "New Group" : "Edit Group"}</h3>
              <button onClick={() => { setModalOpen(false); setEditing(null); }} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={onSave} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Name</label>
                <input
                  value={editing.name}
                  onChange={(e) => setEditing((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Monthly Allowance</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editing.monthlyAllowance}
                  onChange={(e) => setEditing((prev) => ({ ...prev, monthlyAllowance: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => { setModalOpen(false); setEditing(null); }} className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                <button type="submit" disabled={creating || updating} className="px-4 py-2 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white">
                  {editing.id == null ? (creating ? "Creating..." : "Create") : (updating ? "Saving..." : "Save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
