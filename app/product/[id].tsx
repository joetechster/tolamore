import { useMemo } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { ErrorState } from '@/src/components/ErrorState';
import { LoadingState } from '@/src/components/LoadingState';
import { QuantityStepper } from '@/src/components/QuantityStepper';
import { colors, radius, spacing, typography } from '@/src/constants/theme';
import { useCart } from '@/src/context/useCart';
import { useProduct } from '@/src/features/products/hooks';
import { formatCurrency } from '@/src/utils/currency';

export default function ProductDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const productId = useMemo(() => {
    if (!params.id) {
      return '';
    }
    return Array.isArray(params.id) ? params.id[0] : params.id;
  }, [params.id]);

  const { data: product, isLoading, error, refetch } = useProduct(productId);
  const { addItem, items, updateQuantity } = useCart();

  const cartItem = items.find((item) => item.product.id === product?.id);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <LoadingState message="Loading product" />
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ErrorState
          message="We couldn't load this product."
          onRetry={refetch}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={{ uri: product.image }} style={styles.image} />
        <View style={styles.headerRow}>
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.price}>{formatCurrency(product.price)}</Text>
        </View>
        <Text style={styles.category}>{product.category}</Text>
        {typeof product.rating === 'number' ? (
          <Text style={styles.rating}>Rating: {product.rating.toFixed(1)}</Text>
        ) : null}
        <Text style={styles.description}>{product.description}</Text>
      </ScrollView>
      <View style={styles.footer}>
        {cartItem ? (
          <View style={styles.cartRow}>
            <QuantityStepper
              quantity={cartItem.quantity}
              onIncrease={() =>
                updateQuantity(product.id, cartItem.quantity + 1)
              }
              onDecrease={() =>
                updateQuantity(product.id, cartItem.quantity - 1)
              }
            />
            <Pressable
              style={styles.secondaryButton}
              onPress={() => router.push('/(tabs)/cart')}>
              <Text style={styles.secondaryButtonText}>Go to Cart</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.primaryButton} onPress={() => addItem(product)}>
            <Text style={styles.primaryButtonText}>Add to Cart</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  image: {
    width: '100%',
    height: 260,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
    resizeMode: 'contain',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    flex: 1,
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.text,
  },
  price: {
    fontSize: typography.heading,
    fontWeight: '700',
    color: colors.primary,
  },
  category: {
    marginTop: spacing.sm,
    fontSize: typography.caption,
    textTransform: 'capitalize',
    color: colors.muted,
  },
  rating: {
    marginTop: spacing.xs,
    color: colors.muted,
  },
  description: {
    marginTop: spacing.lg,
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 20,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: typography.body,
  },
  cartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
});
