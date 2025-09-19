"use client";

import { useEffect, useState } from "react";
import { BarChart3, FileText, LayoutDashboard, Menu, ShieldAlert, Wallet, X, History, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function FinanceLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);
  const [activeNav, setActiveNav] = useState("Overview");
  const router = useRouter();

  useEffect(() => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const userRaw = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null;
      const parsedUser = userRaw ? JSON.parse(userRaw) : null;
      if (!token || !parsedUser) {
        router.replace('/');
        return;
      }
      if (parsedUser.role !== 'FINANCE') {
        if (parsedUser.role === 'ADMIN') router.replace('/admin/home');
        else router.replace('/');
        return;
      }
      setUser(parsedUser);
      setReady(true);
    } catch (e) {
      router.replace('/');
    }
  }, [router]);
  const nav = [
    { label: "Overview", href: "/finance", icon: LayoutDashboard },
    { label: "Allowances", href: "/finance/allowances", icon: Wallet },
    { label: "Transactions", href: "/finance/transactions", icon: History },
    { label: "Employee Allowance Groups", href: "/finance/employee-allowance-groups", icon: Users },
    { label: "Assign Allowance Group", href: "/finance/employee-allowance-groups/assign", icon: Users },
    { label: "Reports", href: "/finance/reports", icon: BarChart3 },
    { label: "Over-Usage", href: "/finance/over-usage", icon: ShieldAlert },
    // { label: "Audit & Logs", href: "/finance/audit", icon: FileText },
  ];

  function handleLogout() {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    } catch { }
    router.replace('/');
  }

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
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-transform duration-200 ease-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
          <div className="p-4 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Image src="/Logo-sm.png" alt="Logo" width={40} height={40} />
                <div>
                  <h1 className="text-xl font-bold text-white">Koba Pestry</h1>
                  <p className="text-xs text-white/60 mt-1">Finance Dashboard</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden">
                <X className="h-5 w-5 text-gray-700 dark:text-gray-200" />
              </button>
            </div>
            <nav className="space-y-1">
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    activeNav === n.label
                      ? "bg-white/10 text-white"
                      : "text-white/80 hover:bg-white/5 hover:text-white"
                  }`}
                  onClick={() => setActiveNav(n.label)}
                >
                  <n.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{n.label}</span>
                </Link>
              ))}
            </nav>
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-800 transition-colors duration-150"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
              <span>Log out</span>
            </button>
          </div>
        </aside>

        {/* Main content area */}
        <div className="flex-1 lg:pl-72">
          {/* Header */}
          <header className="sticky top-0 z-30 hidden lg:block bg-white/80 dark:bg-gray-900/70 backdrop-blur border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between px-6 h-14">
              <div className="text-sm text-gray-500 dark:text-gray-400">Restaurant Allowance Management • Finance</div>
              <div className="flex items-center gap-3">
                {/* <input placeholder="Search…" className="hidden md:block px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700" /> */}
                <div className="hidden sm:flex flex-col items-end mr-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{user?.fullName || 'Finance User'}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{user?.role === 'FINANCE' ? 'Finance' : user?.role || 'Finance'}</span>
                </div>
                <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-medium">
                  {(() => {
                    const name = user?.fullName || 'Finance User';
                    const parts = name.trim().split(/\s+/);
                    const initials = parts.length >= 2 ? `${parts[0][0] || ''}${parts[1][0] || ''}` : (parts[0]?.slice(0, 2) || 'FU');
                    return initials.toUpperCase();
                  })()}
                </div>
                <button onClick={handleLogout} className="ml-2 px-3 py-1.5 rounded-md text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                  Log out
                </button>
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
