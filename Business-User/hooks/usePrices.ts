// Business-User/hooks/usePrices.ts
import { useEffect, useState } from "react";
import apiClient from "@/api/api";
import { socketService } from "@/api/socket.service";

export type Prices = {
  price_3_hours: number;
  price_6_hours: number;
  price_10_hours: number;
  price_airport: number;
  price_multiday: number;
  ext_price_1_hour: number;
  ext_price_2_hours: number;
  ext_price_3_hours: number;
   price_fuel_3_hours: number;
  price_fuel_6_hours: number;
  price_fuel_10_hours: number;
  price_fuel_airport: number;
  price_airport_upgrade_discount: number;
};

const DEFAULT_PRICES: Prices = {
  price_3_hours: 24000,
  price_6_hours: 34000,
  price_10_hours: 54000,
  price_airport: 80000,
  price_multiday: 80000,
  ext_price_1_hour: 10000,
  ext_price_2_hours: 15000,
  ext_price_3_hours: 24000,
  price_fuel_3_hours: 0,
  price_fuel_6_hours: 0,
  price_fuel_10_hours: 0,
  price_fuel_airport: 0,
  price_airport_upgrade_discount: 0,
  
};

// Module-level cache so all components share the same fetch
let cachedPrices: Prices | null = null;
let fetchPromise: Promise<Prices> | null = null;

async function fetchPrices(): Promise<Prices> {
  if (fetchPromise) return fetchPromise;
  fetchPromise = apiClient
    .get("/admin/public/prices")
    .then((r) => {
      cachedPrices = { ...DEFAULT_PRICES, ...r.data };
      fetchPromise = null;
      return cachedPrices!;
    })
    .catch(() => {
      fetchPromise = null;
      return DEFAULT_PRICES;
    });
  return fetchPromise;
}

export function usePrices() {
  const [prices, setPrices] = useState<Prices>(cachedPrices ?? DEFAULT_PRICES);
  const [loading, setLoading] = useState(!cachedPrices);

  useEffect(() => {
    fetchPrices().then((p) => {
      setPrices(p);
      setLoading(false);
    });

    // Poll every 15s so price changes from admin propagate quickly
  const refresh = () => {
      cachedPrices = null; // bust cache
      fetchPrices().then(setPrices);
    };

    // Instant sync when admin saves settings (server emits this in updateSettings)
    const unsubscribe = socketService.onPricesUpdated(refresh);

    // Fallback poll in case the socket connection drops
    const interval = setInterval(refresh, 15000);
    
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return { prices, loading };
}

export function formatPrice(amount: number): string {
  return `₦${amount.toLocaleString()}`;
}