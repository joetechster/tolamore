import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Product } from '@/src/types';
import { colors, radius, spacing, typography } from '@/src/constants/theme';
import { formatCurrency } from '@/src/utils/currency';

export type ProductCardProps = {
  product: Product;
  onPress: () => void;
};

export const ProductCard = ({ product, onPress }: ProductCardProps) => (
  <Pressable style={styles.card} onPress={onPress}>
    <Image source={{ uri: product.image }} style={styles.image} />
    <View style={styles.content}>
      <Text numberOfLines={2} style={styles.title}>
        {product.title}
      </Text>
      <Text style={styles.category}>{product.category}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.price}>{formatCurrency(product.price)}</Text>
        {typeof product.rating === 'number' ? (
          <Text style={styles.rating}>? {product.rating.toFixed(1)}</Text>
        ) : null}
      </View>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    resizeMode: 'contain',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: typography.heading,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  category: {
    fontSize: typography.caption,
    color: colors.muted,
    textTransform: 'capitalize',
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.text,
  },
  rating: {
    fontSize: typography.caption,
    color: colors.muted,
  },
});
