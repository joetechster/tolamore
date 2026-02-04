import AsyncStorage from '@react-native-async-storage/async-storage';

import type { CustomerInfo } from '@/src/types';

const SHIPPING_STORAGE_KEY = '@shipping_details';

export const loadShippingDetails = async (): Promise<CustomerInfo | null> => {
  try {
    const stored = await AsyncStorage.getItem(SHIPPING_STORAGE_KEY);
    if (!stored) {
      return null;
    }
    return JSON.parse(stored) as CustomerInfo;
  } catch {
    return null;
  }
};

export const saveShippingDetails = async (details: CustomerInfo) => {
  try {
    await AsyncStorage.setItem(
      SHIPPING_STORAGE_KEY,
      JSON.stringify(details)
    );
  } catch {
    // Ignore persistence errors.
  }
};

export const clearShippingDetails = async () => {
  try {
    await AsyncStorage.removeItem(SHIPPING_STORAGE_KEY);
  } catch {
    // Ignore persistence errors.
  }
};