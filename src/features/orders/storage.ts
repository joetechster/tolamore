import AsyncStorage from '@react-native-async-storage/async-storage';

import type { OrderSummary } from '@/src/types';

const ORDERS_STORAGE_KEY = '@orders';

export const loadOrders = async (): Promise<OrderSummary[]> => {
  try {
    const stored = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored) as OrderSummary[];
  } catch {
    return [];
  }
};

export const saveOrders = async (orders: OrderSummary[]) => {
  try {
    await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // Ignore persistence errors.
  }
};

export const appendOrder = async (order: OrderSummary) => {
  const orders = await loadOrders();
  const next = [order, ...orders];
  await saveOrders(next);
  return next;
};