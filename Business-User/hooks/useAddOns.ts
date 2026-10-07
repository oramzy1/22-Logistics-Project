import { useCallback, useEffect, useState } from "react";
import apiClient from "@/api/api";

export type AddOn = { key: string; label: string; price: number };

export function useAddOns() {
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
   try { setAddOns((await apiClient.get<AddOn[]>("/admin/public/addons")).data); }
    catch (e) { console.error("Add-ons load failed", e); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { reload(); }, [reload]);
  return { addOns, loading, reload };
}