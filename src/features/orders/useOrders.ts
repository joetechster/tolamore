import { useCallback, useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';

import type { OrderSummary } from '@/src/types';
import { loadOrders } from './storage';

export const useOrders = () => {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFocused = useIsFocused();

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stored = await loadOrders();
      setOrders(stored);
    } catch (err) {
      setError('Unable to load orders');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      refresh();
    }
  }, [isFocused, refresh]);

  return { orders, isLoading, error, refresh };
};