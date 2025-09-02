"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, X, CreditCard, DollarSign } from "lucide-react";

const STATUSES = ["paid", "pending", "refunded"];
const METHODS = ["cash", "card", "online"];

export default function TransactionsPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [txns, setTxns] = useState(() => [
    { id: 1001, date: "2025-08-30", customer: "Alice Johnson", items: 3, total: 12.8, status: "paid", method: "card" },
    { id: 1002, date: "2025-08-31", customer: "Bob Smith", items: 1, total: 4.5, status: "pending", method: "cash" },
    { id: 1003, date: "2025-09-01", customer: "Charlie Lee", items: 5, total: 22.1, status: "refunded", method: "online" },
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => {
    return txns.filter((t) => {
      const q = query.toLowerCase();
      const matchesQuery = `${t.id} ${t.customer}`.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      const matchesMethod = methodFilter === "all" || t.method === methodFilter;
      return matchesQuery && matchesStatus && matchesMethod;
    });
  }, [txns, query, statusFilter, methodFilter]);

  function openAdd() {
    setEditing({ id: null, date: new Date().toISOString().slice(0, 10), customer: "", items: 1, total: 0, status: "paid", method: "card" });
    setModalOpen(true);
  }
  function openEdit(t) {
    setEditing({ ...t });
    setModalOpen(true);
  }
  function onDelete(id) {
    setTxns((prev) => prev.filter((t) => t.id !== id));
  }
  function onSave(e) {
    e.preventDefault();
    if (!editing) return;
    if (!String(editing.customer).trim()) return;
    const items = Math.max(0, Number(editing.items) || 0);
    const total = Math.max(0, Number(editing.total) || 0);
    if (editing.id == null) {
      const nextId = txns.length ? Math.max(...txns.map((t) => t.id)) + 1 : 1001;
      setTxns((prev) => [...prev, { ...editing, id: nextId, items, total }]);
    } else {
      setTxns((prev) => prev.map((t) => (t.id === editing.id ? { ...editing, items, total } : t)));
    }
    setModalOpen(false);
    setEditing(null);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">View and manage transaction records.</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-sm font-medium">
          <Plus size={16} /> New Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative md:col-span-2">
          <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by ID or customer"
            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
          />
        </div>
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
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        >
          <option value="all">All Methods</option>
          {METHODS.map((m) => (
            <option key={m} value={m}>{m[0].toUpperCase() + m.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{t.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{t.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{t.customer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{t.items}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">${'{'}t.total.toFixed(2){'}'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      t.status === "paid"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : t.status === "pending"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400"
                    }`}>
                      {t.status[0].toUpperCase() + t.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-sm text-gray-700 dark:text-gray-200">
                      {t.method === "card" && <CreditCard size={14} />}
                      {t.method === "cash" && <DollarSign size={14} />}
                      {t.method === "online" && <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" />}
                      {t.method[0].toUpperCase() + t.method.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={() => openEdit(t)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                      <Pencil size={14} /> Edit
                    </button>
                    <button onClick={() => onDelete(t.id)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    No transactions match your filters.
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{editing.id == null ? "New Transaction" : "Edit Transaction"}</h3>
              <button onClick={() => { setModalOpen(false); setEditing(null); }} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={onSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={editing.date}
                    onChange={(e) => setEditing((prev) => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Customer</label>
                  <input
                    value={editing.customer}
                    onChange={(e) => setEditing((prev) => ({ ...prev, customer: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Items</label>
                  <input
                    type="number"
                    min={0}
                    value={editing.items}
                    onChange={(e) => setEditing((prev) => ({ ...prev, items: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Total</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={editing.total}
                    onChange={(e) => setEditing((prev) => ({ ...prev, total: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Method</label>
                  <select
                    value={editing.method}
                    onChange={(e) => setEditing((prev) => ({ ...prev, method: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    {METHODS.map((m) => (
                      <option key={m} value={m}>{m[0].toUpperCase() + m.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => { setModalOpen(false); setEditing(null); }} className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
