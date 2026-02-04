import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { colors } from '@/src/constants/theme';
import { CartProvider } from '@/src/context/CartContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <Stack
            screenOptions={{
              contentStyle: { backgroundColor: colors.background },
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.text,
              headerTitleStyle: { fontWeight: '600' },
            }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="product/[id]"
              options={{ title: 'Product Details' }}
            />
            <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
            <Stack.Screen
              name="confirmation"
              options={{
                title: 'Order Confirmed',
                headerBackVisible: false,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="order/[id]"
              options={{ title: 'Order Details' }}
            />
          </Stack>
          <StatusBar style="dark" backgroundColor={colors.background} translucent={false} />
        </CartProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
