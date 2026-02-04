import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';

import type { CartItem, Product } from '@/src/types';
import { cartReducer } from '@/src/features/cart/cartReducer';
import { loadCart, saveCart } from '@/src/features/cart/persistence';

export type CartTotals = {
  subtotal: number;
  itemsCount: number;
};

export type CartContextValue = {
  items: CartItem[];
  totals: CartTotals;
  isHydrated: boolean;
  addItem: (product: Product) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const hydrate = async () => {
      const storedItems = await loadCart();
      dispatch({ type: 'HYDRATE', items: storedItems });
      setIsHydrated(true);
    };

    hydrate();
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    saveCart(state.items);
  }, [isHydrated, state.items]);

  const addItem = useCallback((product: Product) => {
    dispatch({ type: 'ADD', product });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE', productId, quantity });
  }, []);

  const removeItem = useCallback((productId: string) => {
    dispatch({ type: 'REMOVE', productId });
  }, []);

  const clear = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const totals = useMemo(() => {
    const itemsCount = state.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const subtotal = state.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    return { itemsCount, subtotal };
  }, [state.items]);

  const value = useMemo(
    () => ({
      items: state.items,
      totals,
      isHydrated,
      addItem,
      updateQuantity,
      removeItem,
      clear,
    }),
    [addItem, clear, isHydrated, removeItem, state.items, totals, updateQuantity]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
