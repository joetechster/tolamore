import { useCallback, useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';

import type { OrderDetail } from '@/src/types';
import { loadOrders, saveOrders } from './storage';
import { enrichOrdersWithImages } from './enrich';

export const useOrders = () => {
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFocused = useIsFocused();

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stored = await loadOrders();
      setOrders(stored);
      const needsImages = stored.some((order) =>
        order.items.some((item) => !item.image)
      );
      if (needsImages) {
        const enriched = await enrichOrdersWithImages(stored);
        setOrders(enriched);
        await saveOrders(enriched);
      }
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
