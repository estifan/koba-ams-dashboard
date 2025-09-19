"use client";

import { useEffect, useState } from "react";
import {
  BarChart3, FileSpreadsheet, List, Settings, Users,
  CreditCard, ClipboardList, LogOut, Search, ChevronDown, Bell, Menu
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

const NavItem = ({ icon: Icon, label, isActive, hasChildren, children, onClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="space-y-1">
      <div
        className={`flex items-center justify-between px-4 py-2.5 rounded-lg cursor-pointer transition-colors duration-200 ${isActive ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/5 hover:text-white"
          }`}
        onClick={() => {
          if (hasChildren) setIsOpen(!isOpen);
          if (onClick) onClick();
        }}
      >
        <div className="flex items-center gap-3">
          <Icon size={18} />
          <span className="text-sm font-medium">{label}</span>
        </div>
        {hasChildren && (
          <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        )}
      </div>
      {hasChildren && isOpen && <div className="ml-6 mt-1 space-y-1">{children}</div>}
    </div>
  );
};

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);
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
      if (parsedUser.role !== 'ADMIN') {
        if (parsedUser.role === 'FINANCE') router.replace('/finance');
        else router.replace('/');
        return;
      }
      setUser(parsedUser);
      setReady(true);
    } catch (e) {
      router.replace('/');
    }
  }, [router]);

  const handleLogout = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    } catch { }
    router.replace('/');
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {sidebarOpen && <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          <div className="px-6 py-5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Image src="/Logo-sm.png" alt="Logo" width={40} height={40} />
              <div>
                <h1 className="text-xl font-bold">Koba Pestry</h1>
                <p className="text-xs text-white/60 mt-1">Admin Dashboard</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
            <Link href="/admin/home">
              <NavItem icon={BarChart3} label="Dashboard" isActive={activeNav === "dashboard"} onClick={() => setActiveNav("dashboard")} />
            </Link>
            <Link href="/admin/users">
              <NavItem icon={Users} label="Users & Roles" isActive={activeNav === "users"} onClick={() => setActiveNav("users")} />
            </Link>
            <Link href="/admin/branches">
              <NavItem icon={List} label="Branches" isActive={activeNav === "branches"} onClick={() => setActiveNav("branches")} />
            </Link>
            <Link href="/admin/groups">
              <NavItem icon={List} label="Employee Groups" isActive={activeNav === "groups"} onClick={() => setActiveNav("groups")} />
            </Link>
            <NavItem icon={ClipboardList} label="Menu & Pricing" isActive={activeNav.startsWith("menu")} hasChildren>
              <Link href="/admin/menu/items" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 rounded-lg transition-colors">Items</Link>
              <Link href="/admin/menu/categories" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 rounded-lg transition-colors">Categories</Link>
            </NavItem>
            <Link href="/admin/transactions">
              <NavItem icon={FileSpreadsheet} label="Transactions" isActive={activeNav === "transactions"} onClick={() => setActiveNav("transactions")} />
            </Link>
            <Link href="/admin/reports">
              <NavItem icon={CreditCard} label="Reports & Analytics" isActive={activeNav === "reports"} onClick={() => setActiveNav("reports")} />
            </Link>
            <Link href="/admin/settings">
              <NavItem icon={Settings} label="Settings" isActive={activeNav === "settings"} onClick={() => setActiveNav("settings")} />
            </Link>
          </nav>

          <div className="p-4 border-t border-white/10">
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 px-4 py-2.5 text-sm font-medium transition-colors duration-200">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col lg:ml-64">
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setSidebarOpen(true)}>
                <Menu size={20} />
              </button>
              <div className="relative ml-4 max-w-md w-full lg:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 relative">
                <Bell size={20} />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500"></span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">{user?.fullName || 'Admin User'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.role === 'ADMIN' ? 'Administrator' : user?.role === 'FINANCE' ? 'Finance' : user?.role || 'Administrator'}
                  </p>
                </div>
                <div className="h-9 w-9 rounded-full bg-emerald-500 flex items-center justify-center text-white font-medium">
                  {(() => {
                    const name = user?.fullName || 'Admin User';
                    const parts = name.trim().split(/\s+/);
                    const initials = parts.length >= 2 ? `${parts[0][0] || ''}${parts[1][0] || ''}` : (parts[0]?.slice(0, 2) || 'AU');
                    return initials.toUpperCase();
                  })()}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}