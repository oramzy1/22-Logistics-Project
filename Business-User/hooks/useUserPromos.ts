import { useState, useEffect } from 'react';
import apiClient from '@/api/api';
import { useAuth } from '@/context/AuthContext';

export interface UserPromo {
  id: string;
  code: string;
  description: string | null;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  expiresAt: string | null;
  targetType: string;
}

export function useUserPromos() {
  const { user } = useAuth();
  const [promos, setPromos] = useState<UserPromo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    apiClient
      .get('/bookings/promos/available')
      .then((res) => setPromos(res.data ?? []))
      .catch(() => setPromos([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  return { promos, loading };
}