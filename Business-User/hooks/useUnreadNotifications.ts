import { useCallback, useState } from "react";
import apiClient from "@/api/api";

const api = apiClient;

// ⚠ Set to your unread-notifications endpoint and adjust the mapping below.
const ENDPOINT = "/notifications/unread-count";

export function useUnreadNotifications() {
  const [count, setCount] = useState(0);

  // Rethrows so the screen's existing 401 handling still works.
  const refetch = useCallback(async () => {
    const { data } = await api.get(ENDPOINT);
    setCount(Number(data?.count ?? data?.unread ?? data?.data?.count ?? 0));
  }, []);

  return { count, refetch };
}
