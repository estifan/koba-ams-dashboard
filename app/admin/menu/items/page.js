"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, X, Package } from "lucide-react";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";

// GraphQL: Menu Items
const MENU_ITEMS = gql`
  query MenuItems {
    menuItems {
      id
      name
      price
      description
      menu { name }
      menuId
      branch { name }
      branchId
    }
  }
`;

const CREATE_MENU_ITEM = gql`
  mutation CreateMenuItem($name: String!, $price: Float!, $menuId: ID!, $description: String) {
    createMenuItem(name: $name, price: $price, menuId: $menuId, description: $description) {
      id
      name
      price
      description
      menu { name }
      menuId
      branch { name }
      branchId
    }
  }
`;

const UPDATE_MENU_ITEM = gql`
  mutation UpdateMenuItem($updateMenuItemId: ID!, $name: String, $description: String, $price: Float, $menuId: ID) {
    updateMenuItem(id: $updateMenuItemId, name: $name, description: $description, price: $price, menuId: $menuId) {
      id
      name
      price
      description
      menu { name }
      menuId
      branch { name }
      branchId
    }
  }
`;

const DELETE_MENU_ITEM = gql`
  mutation DeleteMenuItem($deleteMenuItemId: ID!) {
    deleteMenuItem(id: $deleteMenuItemId)
  }
`;

// GraphQL: Menus for dropdown
const MENUS = gql`
  query Menus {
    menus {
      id
      name
    }
  }
`;

export default function MenuItemsPage() {
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // { id?, name, price, description, menuId }

  const { data, loading, error, refetch } = useQuery(MENU_ITEMS);
  const { data: menusData } = useQuery(MENUS);

  const [createItem, { loading: creating }] = useMutation(CREATE_MENU_ITEM, {
    refetchQueries: [{ query: MENU_ITEMS }],
    awaitRefetchQueries: true,
  });
  const [updateItem, { loading: updating }] = useMutation(UPDATE_MENU_ITEM, {
    refetchQueries: [{ query: MENU_ITEMS }],
    awaitRefetchQueries: true,
  });
  const [deleteItem, { loading: deleting }] = useMutation(DELETE_MENU_ITEM, {
    refetchQueries: [{ query: MENU_ITEMS }],
    awaitRefetchQueries: true,
  });

  const items = data?.menuItems || [];
  const menus = menusData?.menus || [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => {
      const menuName = it.menu?.name || "";
      const branchName = it.branch?.name || "";
      return (
        (it.name || "").toLowerCase().includes(q) ||
        String(it.price ?? "").toLowerCase().includes(q) ||
        menuName.toLowerCase().includes(q) ||
        branchName.toLowerCase().includes(q)
      );
    });
  }, [items, query]);

  function openAdd() {
    const defaultMenuId = menus[0]?.id ? String(menus[0].id) : "";
    setEditing({ id: null, name: "", price: 0, description: "", menuId: defaultMenuId });
    setModalOpen(true);
  }
  function openEdit(it) {
    setEditing({ id: it.id, name: it.name || "", price: it.price ?? 0, description: it.description || "", menuId: it.menuId ? String(it.menuId) : "" });
    setModalOpen(true);
  }
  async function onDelete(id) {
    if (!id) return;
    if (!confirm("Delete this item?")) return;
    try {
      await deleteItem({ variables: { deleteMenuItemId: String(id) } });
      refetch();
    } catch (err) {
      console.error(err);
    }
  }
  async function onSubmit(e) {
    e.preventDefault();
    if (!editing) return;
    const name = (editing.name || "").trim();
    const price = Number(editing.price);
    const menuId = String(editing.menuId || "");
    const description = editing.description || "";
    if (!name) return;
    if (!(menuId && !Number.isNaN(price))) return;
    try {
      if (editing.id == null) {
        await createItem({ variables: { name, price, menuId, description } });
      } else {
        await updateItem({ variables: { updateMenuItemId: String(editing.id), name, price, menuId, description } });
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Menu Items</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Create, edit, and manage menu items.</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-sm font-medium">
          <Plus size={16} /> New Item
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="relative md:col-span-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, price, menu or branch"
            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
          />
        </div>
        <select
          value={editing?.menuId ?? ""}
          onChange={(e) => setEditing((prev) => prev ? ({ ...prev, menuId: e.target.value }) : prev)}
          disabled={!modalOpen}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        >
          <option value="" disabled>{menus.length ? "Select menu (modal)" : "No menus"}</option>
          {menus.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      {/* Loading / Error */}
      {loading && <div className="text-sm text-gray-600 dark:text-gray-300">Loading items...</div>}
      {error && <div className="text-sm text-red-600 dark:text-red-400">Failed to load items.</div>}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Menu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filtered.map((it) => (
                <tr key={it.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                      <Package size={16} />
                    </span>
                    <div className="flex flex-col">
                      <span>{it.name}</span>
                      {it.description && <span className="text-xs text-gray-500 dark:text-gray-400">{it.description}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{it.menu?.name || "—"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{Number(it.price ?? 0).toFixed(2)} ETB</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={() => openEdit(it)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                      <Pencil size={14} /> Edit
                    </button>
                    <button onClick={() => onDelete(it.id)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    No items match your filters.
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{editing.id == null ? "New Item" : "Edit Item"}</h3>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={editing.price}
                    onChange={(e) => setEditing((prev) => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Menu</label>
                  <select
                    value={editing.menuId}
                    onChange={(e) => setEditing((prev) => ({ ...prev, menuId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    required
                  >
                    <option value="" disabled>Select menu</option>
                    {menus.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={editing.description}
                  onChange={(e) => setEditing((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  rows={3}
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
