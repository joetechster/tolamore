import type { OrderInput } from '@/src/types';
import { sleep } from '@/src/utils/sleep';

export type OrderResponse = {
  id: string;
  createdAt: string;
  total: number;
};

export const submitOrder = async (input: OrderInput): Promise<OrderResponse> => {
  if (input.items.length === 0) {
    throw new Error('Cart is empty');
  }

  await sleep(800);

  return {
    id: `ORD-${Date.now()}`,
    createdAt: new Date().toISOString(),
    total: input.total,
  };
};