import AsyncStorage from '@react-native-async-storage/async-storage';

import type { CartItem } from '@/src/types';

const CART_STORAGE_KEY = '@shopping_cart';

export const loadCart = async (): Promise<CartItem[]> => {
  try {
    const stored = await AsyncStorage.getItem(CART_STORAGE_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored) as CartItem[];
  } catch {
    return [];
  }
};

export const saveCart = async (items: CartItem[]) => {
  try {
    await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore persistence errors; cart will remain in memory.
  }
};

export const clearCartStorage = async () => {
  try {
    await AsyncStorage.removeItem(CART_STORAGE_KEY);
  } catch {
    // Ignore persistence errors.
  }
};