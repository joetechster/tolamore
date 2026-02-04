export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating?: number;
  stock?: number;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type CustomerInfo = {
  fullName: string;
  email?: string;
  phone?: string;
  addressLine1: string;
  city: string;
  postalCode: string;
};

export type OrderItem = {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
};

export type OrderInput = {
  customer: CustomerInfo;
  items: OrderItem[];
  total: number;
};

export type OrderSummary = {
  id: string;
  total: number;
  itemsCount: number;
  createdAt: string;
  customerName: string;
};

export type OrderDetail = OrderSummary & {
  customer: CustomerInfo;
  items: OrderItem[];
};
