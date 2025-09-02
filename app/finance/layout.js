"use client";

import { useEffect, useState } from "react";
import { BarChart3, FileText, LayoutDashboard, Menu, ShieldAlert, Wallet, X, History, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function FinanceLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const userRaw = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null;
      const user = userRaw ? JSON.parse(userRaw) : null;
      if (!token || !user) {
        router.replace('/loginPage');
        return;
      }
      if (user.role !== 'FINANCE') {
        if (user.role === 'ADMIN') router.replace('/admin/home');
        else router.replace('/');
        return;
      }
      setReady(true);
    } catch (e) {
      router.replace('/loginPage');
    }
  }, [router]);
  const nav = [
    { label: "Overview", href: "/finance", icon: LayoutDashboard },
    { label: "Allowances", href: "/finance/allowances", icon: Wallet },
    { label: "Transactions", href: "/finance/transactions", icon: History },
    { label: "Employee Groups", href: "/finance/employee-groups", icon: Users },
    { label: "Reports", href: "/finance/reports", icon: BarChart3 },
    { label: "Over-Usage", href: "/finance/over-usage", icon: ShieldAlert },
    { label: "Audit & Logs", href: "/finance/audit", icon: FileText },
  ];

  if (!ready) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile topbar */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-gray-900/70 backdrop-blur border-b border-gray-200 dark:border-gray-800 lg:hidden">
        <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
          <Menu className="h-5 w-5 text-gray-700 dark:text-gray-200" />
        </button>
        <div className="text-sm font-medium text-gray-700 dark:text-gray-200">Finance</div>
        <div className="w-9" />
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 transition-transform duration-200 ease-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-600" />
              <span className="font-semibold text-gray-900 dark:text-white">Finance</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden">
              <X className="h-5 w-5 text-gray-700 dark:text-gray-200" />
            </button>
          </div>
          <nav className="space-y-1">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                <n.icon className="h-4 w-4" />
                <span>{n.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content area */}
        <div className="flex-1 lg:pl-72">
          {/* Header */}
          <header className="sticky top-0 z-30 hidden lg:block bg-white/80 dark:bg-gray-900/70 backdrop-blur border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between px-6 h-14">
              <div className="text-sm text-gray-500 dark:text-gray-400">Restaurant Allowance Management • Finance</div>
              <div className="flex items-center gap-3">
                <input placeholder="Search…" className="hidden md:block px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700" />
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
