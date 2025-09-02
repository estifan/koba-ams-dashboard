 "use client";

 import { useMemo, useState } from "react";
 import { Plus, Pencil, Trash2, Search, X, FolderTree } from "lucide-react";
 import { gql } from "@apollo/client";
 import { useQuery, useMutation } from "@apollo/client/react";

 // GraphQL: Menus
 const MENUS = gql`
   query Menus($branchId: ID) {
     menus(branchId: $branchId) {
       id
       name
       branch {
         name
       }
       branchId
     }
   }
 `;

 const CREATE_MENU = gql`
   mutation CreateMenu($name: String!, $branchId: ID!) {
     createMenu(name: $name, branchId: $branchId) {
       id
       name
       branch {
         name
       }
       branchId
     }
   }
 `;

 const UPDATE_MENU = gql`
   mutation UpdateMenu($updateMenuId: ID!, $name: String, $branchId: ID) {
     updateMenu(id: $updateMenuId, name: $name, branchId: $branchId) {
       id
       name
       branch {
         name
       }
       branchId
     }
   }
 `;

 const DELETE_MENU = gql`
   mutation DeleteMenu($deleteMenuId: ID!) {
     deleteMenu(id: $deleteMenuId)
   }
 `;

 // GraphQL: Branches for dropdown
 const BRANCHES = gql`
   query Branches {
     branches {
       id
       name
     }
   }
 `;

 export default function MenuCategoriesPage() {
   const [query, setQuery] = useState("");
   const [branchFilter, setBranchFilter] = useState("all"); // 'all' or branchId
   const [modalOpen, setModalOpen] = useState(false);
   const [editing, setEditing] = useState(null); // { id?, name, branchId }

   const variables = useMemo(() => ({ branchId: branchFilter === "all" ? null : branchFilter }), [branchFilter]);

   const { data, loading, error, refetch } = useQuery(MENUS, { variables });
   const { data: branchesData } = useQuery(BRANCHES);

   const [createMenu, { loading: creating }] = useMutation(CREATE_MENU, {
     refetchQueries: [{ query: MENUS, variables }],
     awaitRefetchQueries: true,
   });
   const [updateMenu, { loading: updating }] = useMutation(UPDATE_MENU, {
     refetchQueries: [{ query: MENUS, variables }],
     awaitRefetchQueries: true,
   });
   const [deleteMenu, { loading: deleting }] = useMutation(DELETE_MENU, {
     refetchQueries: [{ query: MENUS, variables }],
     awaitRefetchQueries: true,
   });

   const menus = data?.menus || [];
   const branches = branchesData?.branches || [];

   const filtered = useMemo(() => {
     const q = query.trim().toLowerCase();
     if (!q) return menus;
     return menus.filter((m) => {
       const branchName = m.branch?.name || "";
       return (m.name || "").toLowerCase().includes(q) || branchName.toLowerCase().includes(q);
     });
   }, [menus, query]);

   function openAdd() {
     // default to first branch if available
     const defaultBranchId = branches[0]?.id ? String(branches[0].id) : "";
     setEditing({ id: null, name: "", branchId: defaultBranchId });
     setModalOpen(true);
   }
   function openEdit(m) {
     setEditing({ id: m.id, name: m.name || "", branchId: m.branchId ? String(m.branchId) : "" });
     setModalOpen(true);
   }
   async function onDelete(id) {
     if (!id) return;
     if (!confirm("Delete this menu?")) return;
     try {
       await deleteMenu({ variables: { deleteMenuId: String(id) } });
       refetch();
     } catch (err) {
       console.error(err);
     }
   }

   async function onSubmit(e) {
     e.preventDefault();
     if (!editing.name) return;
     try {
       if (editing.id == null) {
         await createMenu({ variables: { name: editing.name, branchId: editing.branchId } });
       } else {
         await updateMenu({ variables: { updateMenuId: editing.id, name: editing.name, branchId: editing.branchId } });
       }
       refetch();
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Menu Categories</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage categories for your menu items.</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-sm font-medium">
          <Plus size={16} /> New Category
        </button>
      </div>
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative md:col-span-2">
          <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search menus by name or branch"
            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
          />
        </div>
        <select
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        >
          <option value="all">All Branches</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      {/* Loading / Error */}
      {loading && <div className="text-sm text-gray-600 dark:text-gray-300">Loading menus...</div>}
      {error && <div className="text-sm text-red-600 dark:text-red-400">Failed to load menus.</div>}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Menu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Branch</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                      <FolderTree size={16} />
                    </span>
                    {m.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{m.branch?.name || "—"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={() => openEdit(m)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                      <Pencil size={14} /> Edit
                    </button>
                    <button onClick={() => onDelete(m.id)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    No menus match your filters.
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{editing.id == null ? "New Menu" : "Edit Menu"}</h3>
              <button onClick={() => { setModalOpen(false); setEditing(null); }} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={onSubmit} className="space-y-3">
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
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Branch</label>
                <select
                  value={editing.branchId}
                  onChange={(e) => setEditing((prev) => ({ ...prev, branchId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  required
                >
                  <option value="" disabled>Select branch</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
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

