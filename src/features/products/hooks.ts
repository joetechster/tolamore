import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getProduct, getProducts } from '@/src/api/products';
import type { Product } from '@/src/types';

export const productKeys = {
  all: ['products'] as const,
  detail: (id: string) => ['products', id] as const,
};

export const useProducts = () =>
  useQuery({
    queryKey: productKeys.all,
    queryFn: getProducts,
    staleTime: 1000 * 60 * 2,
  });

export const useProduct = (id: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => getProduct(id),
    enabled: Boolean(id),
    initialData: () => {
      const products = queryClient.getQueryData<Product[]>(productKeys.all);
      return products?.find((product) => product.id === id);
    },
  });
};