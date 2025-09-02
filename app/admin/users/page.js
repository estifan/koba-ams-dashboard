"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";

const ROLE_LABELS = ["Admin", "Finance", "Employee"];
const ROLE_TO_API = { Admin: "ADMIN", Finance: "FINANCE", Employee: "EMPLOYEE" };
const API_TO_ROLE = { ADMIN: "Admin", FINANCE: "Finance", EMPLOYEE: "Employee" };
const STATUSES = ["active", "inactive"]; // derived from verified when available

const GET_ALL_USERS = gql`
  query Query {
    GetAllUsers {
      id
      fullName
      email
      role
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($user: UserInput!) {
    CreateUser(user: $user) {
      id
      fullName
      email
      verified
      role
    }
  }
`;

const EDIT_USER = gql`
  mutation EditUser($editUserId: ID!, $user: UserEditInput!) {
    EditUser(id: $editUserId, user: $user) {
      id
      fullName
      email
      role
    }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($deleteUserId: ID!) {
    DeleteUser(id: $deleteUserId)
  }
`;

export default function UsersPage() {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { data, loading, error } = useQuery(GET_ALL_USERS);
  const [createUser, { loading: creating }] = useMutation(CREATE_USER);
  const [editUser, { loading: editingUser }] = useMutation(EDIT_USER);
  const [deleteUser, { loading: deleting }] = useMutation(DELETE_USER);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // {id?, name, email, role, status}

  const rows = useMemo(() => {
    const apiUsers = data?.GetAllUsers || [];
    // Map API -> UI rows
    return apiUsers.map((u) => ({
      id: u.id,
      name: u.fullName,
      email: u.email,
      role: API_TO_ROLE[u.role] || u.role || "Employee",
      status: "active", // If API provides verified, use: u.verified ? 'active' : 'inactive'
    }));
  }, [data]);

  const filtered = useMemo(() => {
    return rows.filter((u) => {
      const matchesQuery = `${u.name} ${u.email}`.toLowerCase().includes(query.toLowerCase());
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const matchesStatus = statusFilter === "all" || u.status === statusFilter;
      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [rows, query, roleFilter, statusFilter]);

  function openAdd() {
    setEditing({ id: null, name: "", email: "", role: ROLE_LABELS[2], status: "active" });
    setModalOpen(true);
  }

  function openEdit(u) {
    setEditing({ ...u });
    setModalOpen(true);
  }

  async function onDelete(id) {
    try {
      await deleteUser({
        variables: { deleteUserId: String(id) },
        refetchQueries: [{ query: GET_ALL_USERS }],
        awaitRefetchQueries: true,
      });
    } catch (e) {
      console.error(e);
    }
  }

  async function onSave(e) {
    e.preventDefault();
    if (!editing) return;
    if (!editing.name.trim() || !editing.email.trim()) return;
    try {
      if (editing.id == null) {
        await createUser({
          variables: {
            user: {
              fullName: editing.name,
              email: editing.email,
              role: ROLE_TO_API[editing.role] || editing.role,
            },
          },
          refetchQueries: [{ query: GET_ALL_USERS }],
          awaitRefetchQueries: true,
        });
      } else {
        await editUser({
          variables: {
            editUserId: String(editing.id),
            user: {
              fullName: editing.name,
              email: editing.email,
              role: ROLE_TO_API[editing.role] || editing.role,
            },
          },
          refetchQueries: [{ query: GET_ALL_USERS }],
          awaitRefetchQueries: true,
        });
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users & Roles</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage users, roles, and access.</p>
        </div>
        <button onClick={openAdd} disabled={creating || editingUser || deleting} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white px-4 py-2 text-sm font-medium">
          <Plus size={16} /> Add User
        </button>
      </div>

      {(loading) && (
        <div className="text-sm text-gray-500 dark:text-gray-400">Loading users…</div>
      )}
      {error && (
        <div className="text-sm text-rose-600">Failed to load users: {error.message}</div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email"
            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        >
          <option value="all">All Roles</option>
          {ROLE_LABELS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        >
          <option value="all">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{u.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{u.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      u.status === "active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    }`}>
                      {u.status[0].toUpperCase() + u.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={() => openEdit(u)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                      <Pencil size={14} /> Edit
                    </button>
                    <button onClick={() => onDelete(u.id)} disabled={deleting} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 disabled:opacity-50">
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    No users match your filters.
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{editing.id == null ? "Add User" : "Edit User"}</h3>
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
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={editing.email}
                  onChange={(e) => setEditing((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Role</label>
                  <select
                    value={editing.role}
                    onChange={(e) => setEditing((prev) => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    {ROLE_LABELS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={editing.status}
                    onChange={(e) => setEditing((prev) => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setModalOpen(false); setEditing(null); }}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || editingUser}
                  className="px-4 py-2 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
