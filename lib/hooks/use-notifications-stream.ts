"use client";

import { useCallback, useEffect, useState } from "react";
import { listNotifications, markNotificationRead } from "@/lib/api/notifications";
import type { ApiNotification } from "@/lib/types/api";

export function useNotificationsStream(role: "CLIENT" | "VENDOR" | "ADMIN", intervalMs = 4000) {
  const [data, setData] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const rows = await listNotifications(role);
      setData(rows);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => {
      void refresh();
    }, intervalMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [intervalMs, refresh]);

  const markRead = useCallback(
    async (id: number) => {
      await markNotificationRead(role, id);
      setData((current) => current.map((item) => (item.id === id ? { ...item, isRead: true } : item)));
    },
    [role]
  );

  return { data, loading, error, refresh, markRead };
}
