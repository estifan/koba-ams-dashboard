"use client";

import { useMemo, useState } from "react";
import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { Plus, Pencil, Trash2, AlertCircle, Loader2 } from "lucide-react";

const GET_BRANCHES = gql`
  query Branches {
    branches {
      id
      name
      location
    }
  }
`;

const CREATE_BRANCH = gql`
  mutation CreateBranch($name: String!, $location: String) {
    createBranch(name: $name, location: $location) {
      id
      name
      location
    }
  }
`;

const UPDATE_BRANCH = gql`
  mutation UpdateBranch($updateBranchId: ID!, $name: String, $location: String) {
    updateBranch(id: $updateBranchId, name: $name, location: $location) {
      id
      name
      location
    }
  }
`;

const DELETE_BRANCH = gql`
  mutation DeleteBranch($deleteBranchId: ID!) {
    deleteBranch(id: $deleteBranchId)
  }
`;

export default function BranchesPage() {
  const { data, loading, error } = useQuery(GET_BRANCHES);
  const [createBranch, { loading: creating }] = useMutation(CREATE_BRANCH, {
    refetchQueries: [{ query: GET_BRANCHES }],
    awaitRefetchQueries: true,
  });
  const [updateBranch, { loading: updating }] = useMutation(UPDATE_BRANCH, {
    refetchQueries: [{ query: GET_BRANCHES }],
    awaitRefetchQueries: true,
  });
  const [deleteBranch, { loading: deleting }] = useMutation(DELETE_BRANCH, {
    refetchQueries: [{ query: GET_BRANCHES }],
    awaitRefetchQueries: true,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // { id?, name, location }
  const [filter, setFilter] = useState("");

  const branches = useMemo(() => {
    const list = data?.branches || [];
    if (!filter.trim()) return list;
    const f = filter.toLowerCase();
    return list.filter((b) => (b.name || "").toLowerCase().includes(f) || (b.location || "").toLowerCase().includes(f));
  }, [data, filter]);

  const openCreate = () => {
    setEditing({ id: null, name: "", location: "" });
    setModalOpen(true);
  };

  const openEdit = (b) => {
    setEditing({ id: b.id, name: b.name || "", location: b.location || "" });
    setModalOpen(true);
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!editing) return;
    const { id, name, location } = editing;
    if (!name.trim()) return;
    try {
      if (id == null) {
        await createBranch({ variables: { name: name.trim(), location: location?.trim() || null } });
      } else {
        await updateBranch({ variables: { updateBranchId: String(id), name: name.trim(), location: location?.trim() || null } });
      }
      setModalOpen(false);
      setEditing(null);
    } catch (err) {
      console.error(err);
    }
  };

  const onDelete = async (id) => {
    if (!id) return;
    if (!confirm("Delete this branch?")) return;
    try {
      await deleteBranch({ variables: { deleteBranchId: String(id) } });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Branches</h1>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium"
          disabled={creating || updating || deleting}
        >
          <Plus className="h-4 w-4" /> New Branch
        </button>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search by name or location"
          className="block w-full max-w-md px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-sm"
        />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300"><Loader2 className="h-4 w-4 animate-spin" /> Loading branches...</div>
      ) : error ? (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400"><AlertCircle className="h-4 w-4" /> Failed to load branches.</div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Location</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {branches.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3">{b.name}</td>
                  <td className="px-4 py-3">{b.location || "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(b)}
                        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md text-xs bg-amber-500 hover:bg-amber-400 text-white"
                        disabled={creating || updating || deleting}
                      >
                        <Pencil className="h-4 w-4" /> Edit
                      </button>
                      <button
                        onClick={() => onDelete(b.id)}
                        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md text-xs bg-rose-600 hover:bg-rose-500 text-white"
                        disabled={creating || updating || deleting}
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {branches.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-gray-500">No branches found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-base font-semibold">{editing?.id == null ? "Create Branch" : "Edit Branch"}</h2>
              <button onClick={() => { setModalOpen(false); setEditing(null); }} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
            </div>
            <form onSubmit={onSave} className="p-5 space-y-4">
              <div>
                <label className="block text-sm mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={editing?.name || ""}
                  onChange={(e) => setEditing((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Branch name"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Location</label>
                <input
                  type="text"
                  value={editing?.location || ""}
                  onChange={(e) => setEditing((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="Location (optional)"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => { setModalOpen(false); setEditing(null); }} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm">Cancel</button>
                <button type="submit" disabled={creating || updating} className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm">
                  {editing?.id == null ? (creating ? "Creating..." : "Create") : (updating ? "Saving..." : "Save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
