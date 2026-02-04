import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

import { ErrorState } from '@/src/components/ErrorState';
import { LoadingState } from '@/src/components/LoadingState';
import { colors, radius, spacing, typography } from '@/src/constants/theme';
import { loadOrderById, updateOrder } from '@/src/features/orders/storage';
import { enrichOrderWithImages } from '@/src/features/orders/enrich';
import type { OrderDetail } from '@/src/types';
import { formatCurrency } from '@/src/utils/currency';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const orderId = id ?? '';
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await loadOrderById(orderId);
        if (!result) {
          setError('Order not found');
          return;
        }
        const enriched = await enrichOrderWithImages(result);
        setOrder(enriched);
        if (enriched !== result) {
          await updateOrder(enriched);
        }
      } catch {
        setError('Unable to load order');
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    } else {
      setIsLoading(false);
      setError('Missing order id');
    }
  }, [orderId]);

  const formattedDate = useMemo(() => {
    if (!order?.createdAt) {
      return '';
    }
    return new Date(order.createdAt).toLocaleString();
  }, [order?.createdAt]);

  const galleryImages = useMemo(() => {
    if (!order) {
      return [];
    }
    return order.items
      .map((item) => item.image)
      .filter(Boolean)
      .slice(0, 4) as string[];
  }, [order]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <LoadingState message="Loading order" />
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ErrorState message={error ?? 'Unable to load order'} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <View style={styles.heroText}>
            <Text style={styles.title}>Order Details</Text>
            <Text style={styles.subtitle}>Order {order.id}</Text>
            <Text style={styles.meta}>{formattedDate}</Text>
          </View>
          <View style={styles.totalBadge}>
            <Text style={styles.totalText}>{formatCurrency(order.total)}</Text>
          </View>
        </View>

        <View style={styles.gallery}>
          {galleryImages.length > 0 ? (
            galleryImages.map((src, index) => (
              <Image
                key={`${order.id}-gallery-${index}`}
                source={{ uri: src }}
                style={styles.galleryImage}
              />
            ))
          ) : (
            <View style={styles.galleryPlaceholder} />
          )}
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Items</Text>
            <Text style={styles.value}>{order.itemsCount}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Customer</Text>
            <Text style={styles.value}>{order.customer.fullName}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>
              {order.customer.email ?? '—'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.value}>
              {order.customer.phone ?? '—'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Ship to</Text>
            <Text style={styles.value}>
              {order.customer.addressLine1}, {order.customer.city}{' '}
              {order.customer.postalCode}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          <View style={styles.itemsCard}>
            {order.items.map((item, index) => (
              <View
                key={`${item.productId}-${index}`}
                style={styles.itemRow}>
                <View style={styles.itemLeft}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.itemImage} />
                  ) : (
                    <View style={styles.itemImagePlaceholder} />
                  )}
                  <View style={styles.itemText}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemMeta}>
                      {item.quantity} x {formatCurrency(item.price)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.itemTotal}>
                  {formatCurrency(item.price * item.quantity)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
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
  hero: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  heroText: {
    flex: 1,
  },
  title: {
    fontSize: typography.title + 2,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    marginTop: spacing.xs,
    color: colors.muted,
    fontSize: typography.body,
  },
  meta: {
    marginTop: spacing.xs,
    color: colors.muted,
    fontSize: typography.caption,
  },
  totalBadge: {
    backgroundColor: colors.primarySoft,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  totalText: {
    color: colors.primary,
    fontWeight: '700',
  },
  gallery: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  galleryImage: {
    flex: 1,
    height: 90,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    resizeMode: 'contain',
  },
  galleryPlaceholder: {
    height: 90,
    flex: 1,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  label: {
    color: colors.muted,
    fontSize: typography.caption,
  },
  value: {
    color: colors.text,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.heading,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  itemsCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    paddingRight: spacing.md,
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    resizeMode: 'contain',
  },
  itemImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.border,
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  itemMeta: {
    marginTop: spacing.xs,
    color: colors.muted,
    fontSize: typography.caption,
  },
  itemTotal: {
    fontWeight: '700',
    color: colors.text,
  },
});