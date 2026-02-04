import AsyncStorage from '@react-native-async-storage/async-storage';

import type { OrderDetail, CustomerInfo, OrderItem } from '@/src/types';

const ORDERS_STORAGE_KEY = '@orders';

type StoredOrder = Partial<OrderDetail> & { id?: string };

const normalizeOrder = (order: StoredOrder): OrderDetail | null => {
  if (!order.id || !order.createdAt || typeof order.total !== 'number') {
    return null;
  }

  const items = Array.isArray(order.items)
    ? (order.items as OrderItem[]).map((item) => ({
        ...item,
        image: item.image ?? '',
      }))
    : [];
  const itemsCount =
    typeof order.itemsCount === 'number'
      ? order.itemsCount
      : items.reduce((sum, item) => sum + item.quantity, 0);
  const customerName =
    order.customerName ??
    (order.customer && 'fullName' in order.customer
      ? (order.customer as CustomerInfo).fullName
      : 'Customer');

  const customer =
    order.customer ??
    ({
      fullName: customerName,
      email: undefined,
      phone: undefined,
      addressLine1: '',
      city: '',
      postalCode: '',
    } as CustomerInfo);

  return {
    id: order.id,
    total: order.total,
    itemsCount,
    createdAt: order.createdAt,
    customerName,
    customer,
    items,
  };
};

export const loadOrders = async (): Promise<OrderDetail[]> => {
  try {
    const stored = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
    if (!stored) {
      return [];
    }
    const raw = JSON.parse(stored) as StoredOrder[];
    return raw
      .map((order) => normalizeOrder(order))
      .filter((order): order is OrderDetail => Boolean(order));
  } catch {
    return [];
  }
};

export const saveOrders = async (orders: OrderDetail[]) => {
  try {
    await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // Ignore persistence errors.
  }
};

export const appendOrder = async (order: OrderDetail) => {
  const orders = await loadOrders();
  const next = [order, ...orders];
  await saveOrders(next);
  return next;
};

export const loadOrderById = async (id: string): Promise<OrderDetail | null> => {
  const orders = await loadOrders();
  return orders.find((order) => order.id === id) ?? null;
};

export const updateOrder = async (order: OrderDetail) => {
  const orders = await loadOrders();
  const next = orders.map((existing) =>
    existing.id === order.id ? order : existing
  );
  await saveOrders(next);
  return next;
};
