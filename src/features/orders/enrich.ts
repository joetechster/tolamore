import type { OrderDetail } from '@/src/types';
import { getProduct } from '@/src/api/products';

const buildImageMap = async (productIds: string[]) => {
  const entries = await Promise.all(
    productIds.map(async (id) => {
      try {
        const product = await getProduct(id);
        return [id, product.image] as const;
      } catch {
        return [id, undefined] as const;
      }
    })
  );

  const imageMap = new Map<string, string>();
  for (const [id, image] of entries) {
    if (image) {
      imageMap.set(id, image);
    }
  }

  return imageMap;
};

export const enrichOrdersWithImages = async (orders: OrderDetail[]) => {
  const missingIds = new Set<string>();
  orders.forEach((order) => {
    order.items.forEach((item) => {
      if (!item.image) {
        missingIds.add(item.productId);
      }
    });
  });

  if (missingIds.size === 0) {
    return orders;
  }

  const imageMap = await buildImageMap(Array.from(missingIds));

  return orders.map((order) => ({
    ...order,
    items: order.items.map((item) =>
      item.image
        ? item
        : {
            ...item,
            image: imageMap.get(item.productId) ?? item.image,
          }
    ),
  }));
};

export const enrichOrderWithImages = async (order: OrderDetail) => {
  const [enriched] = await enrichOrdersWithImages([order]);
  return enriched;
};