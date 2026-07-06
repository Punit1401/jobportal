"use client";

import { useCallback, useEffect, useState } from "react";

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications", {
        method: "GET",
        credentials: "include",
      });

      // 🟢 FIX: If user NOT logged in → return cleanly (NO error)
      if (res.status === 401) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        console.error("Notifications fetch failed:", res.status);
        setNotifications([]);
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (data.success) {
        setNotifications(data.notifications);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Notifications fetch error:", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return { notifications, loading, refresh };
}
