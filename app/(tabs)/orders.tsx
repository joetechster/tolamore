import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { EmptyState } from '@/src/components/EmptyState';
import { ErrorState } from '@/src/components/ErrorState';
import { LoadingState } from '@/src/components/LoadingState';
import { colors, radius, spacing, typography } from '@/src/constants/theme';
import { useOrders } from '@/src/features/orders/useOrders';
import { formatCurrency } from '@/src/utils/currency';

const MAX_THUMBS = 3;

export default function OrdersScreen() {
  const { orders, isLoading, error, refresh } = useOrders();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <LoadingState message="Loading orders" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ErrorState message={error} onRetry={refresh} />
      </SafeAreaView>
    );
  }

  if (orders.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <EmptyState
          title="No orders yet"
          message="Place an order to see it here."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Orders</Text>
          <Text style={styles.subtitle}>Recent purchases and receipts</Text>
        </View>
        <FlatList
          contentContainerStyle={styles.list}
          data={orders}
          keyExtractor={(item) => item.id}
          refreshing={isLoading}
          onRefresh={refresh}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          renderItem={({ item }) => {
            const date = new Date(item.createdAt).toLocaleDateString();
            const images = item.items
              .map((orderItem) => orderItem.image)
              .filter(Boolean)
              .slice(0, MAX_THUMBS) as string[];

            return (
              <Pressable
                style={styles.card}
                onPress={() =>
                  router.push({ pathname: '/order/[id]', params: { id: item.id } })
                }>
                <View style={styles.cardTop}>
                  <View>
                    <Text style={styles.orderId}>Order {item.id}</Text>
                    <Text style={styles.date}>{date}</Text>
                  </View>
                  <View style={styles.totalPill}>
                    <Text style={styles.totalText}>
                      {formatCurrency(item.total)}
                    </Text>
                  </View>
                </View>

                <View style={styles.thumbRow}>
                  {images.length > 0 ? (
                    images.map((src, index) => (
                      <Image
                        key={`${item.id}-${index}`}
                        source={{ uri: src }}
                        style={styles.thumb}
                      />
                    ))
                  ) : (
                    <View style={styles.thumbPlaceholder} />
                  )}
                  {item.itemsCount > images.length ? (
                    <View style={styles.moreBadge}>
                      <Text style={styles.moreText}>
                        +{item.itemsCount - images.length}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.cardBottom}>
                  <Text style={styles.customer}>{item.customerName}</Text>
                  <Text style={styles.meta}>{item.itemsCount} items</Text>
                  <Text style={styles.meta}>Tap to view details</Text>
                </View>
              </Pressable>
            );
          }}
        />
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
  header: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.title + 4,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    marginTop: spacing.xs,
    color: colors.muted,
    fontSize: typography.body,
  },
  list: {
    paddingBottom: spacing.xxl,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  orderId: {
    fontWeight: '700',
    color: colors.text,
  },
  date: {
    marginTop: spacing.xs,
    color: colors.muted,
    fontSize: typography.caption,
  },
  totalPill: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  totalText: {
    color: colors.primary,
    fontWeight: '700',
  },
  thumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    resizeMode: 'contain',
  },
  thumbPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: radius.sm,
    backgroundColor: colors.border,
  },
  moreBadge: {
    minWidth: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  moreText: {
    fontWeight: '700',
    color: colors.text,
    fontSize: typography.caption,
  },
  cardBottom: {
    gap: spacing.xs,
  },
  customer: {
    fontWeight: '600',
    color: colors.text,
  },
  meta: {
    color: colors.muted,
    fontSize: typography.caption,
  },
});