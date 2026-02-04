import { get } from '@/src/api/client';
import type { Product } from '@/src/types';

type ApiRating = { rate?: number; count?: number } | number | undefined;

type ApiProduct = {
  id: number | string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating?: ApiRating;
  stock?: number;
};

const normalizeRating = (rating?: ApiRating) => {
  if (typeof rating === 'number') {
    return rating;
  }
  if (rating && typeof rating === 'object' && typeof rating.rate === 'number') {
    return rating.rate;
  }
  return undefined;
};

const normalizeProduct = (product: ApiProduct): Product => ({
  id: String(product.id),
  title: product.title,
  description: product.description,
  price: product.price,
  image: product.image,
  category: product.category,
  rating: normalizeRating(product.rating),
  stock: product.stock,
});

export const getProducts = async () => {
  const products = await get<ApiProduct[]>('/products');
  return products.map(normalizeProduct);
};

export const getProduct = async (id: string) => {
  const product = await get<ApiProduct>(`/products/${id}`);
  return normalizeProduct(product);
};