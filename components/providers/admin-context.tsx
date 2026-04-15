"use client";

/**
 * AdminContext — Single unified context for Admin dashboard data
 * Replaces per-layout useEffect calls that re-fetched data on every navigation.
 * Data is fetched ONCE when the admin logs in and stays cached until logout.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiFetch } from "@/lib/api/client";

interface AdminStats {
  totalUsers: number;
  openRequests: number;
  pendingWithdrawals: number;
  totalVendors: number;
}

interface AdminContextValue {
  adminName: string;
  stats: AdminStats | null;
  notifCount: number;
  isLoading: boolean;
  setNotifCount: (count: number) => void;
  refreshStats: () => Promise<void>;
}

const AdminContext = createContext<AdminContextValue>({
  adminName: "مدير النظام",
  stats: null,
  notifCount: 0,
  isLoading: true,
  setNotifCount: () => {},
  refreshStats: async () => {},
});

const STATS_CACHE_KEY = "admin_stats_cache";
const STATS_TTL_MS = 2 * 60 * 1000; // 2 minutes in-memory TTL

interface CachedStats {
  data: AdminStats;
  ts: number;
}

let statsCache: CachedStats | null = null;

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [adminName, setAdminName] = useState("مدير النظام");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [notifCount, setNotifCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    // Return cached stats if still fresh
    if (statsCache && Date.now() - statsCache.ts < STATS_TTL_MS) {
      setStats(statsCache.data);
      return;
    }
    try {
      const data = await apiFetch<AdminStats>("/api/admin/stats", "ADMIN");
      statsCache = { data, ts: Date.now() };
      setStats(data);
    } catch {
      // Keep stale cache if available
      if (statsCache) setStats(statsCache.data);
    }
  }, []);

  const refreshStats = useCallback(async () => {
    statsCache = null; // Bust cache
    await fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    let mounted = true;

    async function init() {
      setIsLoading(true);
      await Promise.allSettled([
        // Fetch admin name
        apiFetch<{ fullName?: string }>("/api/auth/me", "ADMIN").then(
          (user) => {
            if (mounted && user?.fullName) setAdminName(user.fullName);
          }
        ),
        // Fetch stats (with cache)
        fetchStats(),
        // Fetch unread notifications count
        fetch("/api/notifications?limit=1&unreadOnly=true", {
          credentials: "include",
        })
          .then((r) => r.json())
          .then((data) => {
            if (mounted && typeof data?.unreadCount === "number") {
              setNotifCount(data.unreadCount);
            }
          })
          .catch(() => {}),
      ]);

      if (mounted) setIsLoading(false);
    }

    init();
    return () => {
      mounted = false;
    };
  }, [fetchStats]);

  return (
    <AdminContext.Provider
      value={{
        adminName,
        stats,
        notifCount,
        isLoading,
        setNotifCount,
        refreshStats,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
