import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { EmptyState } from '@/src/components/EmptyState';
import { LoadingState } from '@/src/components/LoadingState';
import { QuantityStepper } from '@/src/components/QuantityStepper';
import { colors, radius, spacing, typography } from '@/src/constants/theme';
import { useCart } from '@/src/context/useCart';
import { formatCurrency } from '@/src/utils/currency';

export default function CartScreen() {
  const { items, totals, updateQuantity, removeItem, isHydrated } = useCart();

  if (!isHydrated) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <LoadingState message="Loading cart" />
      </SafeAreaView>
    );
  }

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <EmptyState
          title="Your cart is empty"
          message="Browse products and add items to your cart."
          actionLabel="Shop now"
          onAction={() => router.push('/')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <FlatList
          style={styles.list}
          data={items}
          keyExtractor={(item) => item.product.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.product.image }} style={styles.image} />
              <View style={styles.cardContent}>
                <Text numberOfLines={2} style={styles.title}>
                  {item.product.title}
                </Text>
                <Text style={styles.price}>
                  {formatCurrency(item.product.price)}
                </Text>
                <View style={styles.row}>
                  <QuantityStepper
                    quantity={item.quantity}
                    onIncrease={() =>
                      updateQuantity(item.product.id, item.quantity + 1)
                    }
                    onDecrease={() =>
                      updateQuantity(item.product.id, item.quantity - 1)
                    }
                  />
                  <Pressable
                    style={styles.removeButton}
                    onPress={() => removeItem(item.product.id)}>
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        />
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(totals.subtotal)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items</Text>
            <Text style={styles.summaryValue}>{totals.itemsCount}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Estimated total</Text>
            <Text style={styles.summaryTotal}>
              {formatCurrency(totals.subtotal)}
            </Text>
          </View>
          <Pressable
            style={styles.primaryButton}
            onPress={() => router.push('/checkout')}>
            <Text style={styles.primaryButtonText}>Proceed to Checkout</Text>
          </Pressable>
        </View>
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
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    resizeMode: 'contain',
  },
  cardContent: {
    flex: 1,
  },
  title: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  price: {
    fontSize: typography.caption,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  removeButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  removeButtonText: {
    color: colors.danger,
    fontSize: typography.caption,
    fontWeight: '600',
  },
  summary: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    color: colors.muted,
  },
  summaryValue: {
    color: colors.text,
    fontWeight: '600',
  },
  summaryTotal: {
    color: colors.text,
    fontWeight: '700',
  },
  primaryButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
