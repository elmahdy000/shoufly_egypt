"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Users, FileText, Settings, LogOut, Truck, Package, Home } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/requests", label: "Requests", icon: Package },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/reports", label: "Reports", icon: BarChart3 },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="fixed right-0 top-0 h-screen w-64 bg-white border-l border-gray-200 flex flex-col shadow-sm">
      {/* Logo Section */}
      <div className="h-20 border-b border-gray-100 flex items-center px-6">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">Shoufly</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                active
                  ? "bg-orange-50 text-orange-600 border-r-2 border-orange-500"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="h-20 border-t border-gray-100 px-4 py-4 flex items-center">
        <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 text-sm font-medium">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
