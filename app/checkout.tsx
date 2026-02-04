import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';

import { EmptyState } from '@/src/components/EmptyState';
import { colors, radius, spacing, typography } from '@/src/constants/theme';
import { useCart } from '@/src/context/useCart';
import { appendOrder } from '@/src/features/orders/storage';
import {
  clearShippingDetails,
  loadShippingDetails,
  saveShippingDetails,
} from '@/src/features/checkout/storage';
import { submitOrder } from '@/src/api/orders';
import type { CustomerInfo, OrderInput, OrderDetail } from '@/src/types';
import { formatCurrency } from '@/src/utils/currency';
import { checkoutSchema, type CheckoutFormValues } from '@/src/utils/validation';

export default function CheckoutScreen() {
  const { items, totals, clear } = useCart();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      addressLine1: '',
      city: '',
      postalCode: '',
    },
  });

  const mutation = useMutation({
    mutationFn: submitOrder,
  });

  const [savedShipping, setSavedShipping] = useState<CustomerInfo | null>(null);

  useEffect(() => {
    const hydrateShipping = async () => {
      const saved = await loadShippingDetails();
      setSavedShipping(saved);
    };
    hydrateShipping();
  }, []);

  const orderItems = useMemo(
    () =>
      items.map((item) => ({
        productId: item.product.id,
        title: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image,
      })),
    [items]
  );

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <EmptyState
          title="Your cart is empty"
          message="Add items before checking out."
          actionLabel="Browse products"
          onAction={() => router.push('/')}
        />
      </SafeAreaView>
    );
  }

  const applySavedShipping = () => {
    if (!savedShipping) {
      return;
    }
    reset({
      fullName: savedShipping.fullName,
      email: savedShipping.email ?? '',
      phone: savedShipping.phone ?? '',
      addressLine1: savedShipping.addressLine1,
      city: savedShipping.city,
      postalCode: savedShipping.postalCode,
    });
  };

  const onClearSaved = async () => {
    await clearShippingDetails();
    setSavedShipping(null);
  };

  const onSubmit = async (values: CheckoutFormValues) => {
    const payload: OrderInput = {
      customer: {
        fullName: values.fullName,
        email: values.email || undefined,
        phone: values.phone || undefined,
        addressLine1: values.addressLine1,
        city: values.city,
        postalCode: values.postalCode,
      },
      items: orderItems,
      total: totals.subtotal,
    };

    try {
      const response = await mutation.mutateAsync(payload);
      const orderSummary: OrderDetail = {
        id: response.id,
        total: totals.subtotal,
        itemsCount: totals.itemsCount,
        createdAt: response.createdAt,
        customerName: values.fullName,
        customer: payload.customer,
        items: payload.items,
      };
      await saveShippingDetails(payload.customer);
      setSavedShipping(payload.customer);
      await appendOrder(orderSummary);
      clear();
      router.replace({
        pathname: '/confirmation',
        params: {
          orderId: response.id,
          total: totals.subtotal.toFixed(2),
          itemsCount: String(totals.itemsCount),
        },
      });
    } catch {
      // Error handled by mutation state below.
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.safeArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Shipping details</Text>

          {savedShipping ? (
            <View style={styles.savedCard}>
              <View style={styles.savedHeader}>
                <Text style={styles.savedTitle}>Saved address</Text>
                <Pressable onPress={onClearSaved}>
                  <Text style={styles.savedClear}>Clear</Text>
                </Pressable>
              </View>
              <Text style={styles.savedName}>{savedShipping.fullName}</Text>
              <Text style={styles.savedText}>
                {savedShipping.addressLine1}
              </Text>
              <Text style={styles.savedText}>
                {savedShipping.city} {savedShipping.postalCode}
              </Text>
              {savedShipping.email ? (
                <Text style={styles.savedText}>{savedShipping.email}</Text>
              ) : null}
              {savedShipping.phone ? (
                <Text style={styles.savedText}>{savedShipping.phone}</Text>
              ) : null}
              <Pressable style={styles.savedButton} onPress={applySavedShipping}>
                <Text style={styles.savedButtonText}>Use saved details</Text>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Full name</Text>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Jane Doe"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="words"
                />
              )}
            />
            {errors.fullName ? (
              <Text style={styles.errorText}>{errors.fullName.message}</Text>
            ) : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email (or phone)</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="jane@email.com"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
            />
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email.message}</Text>
            ) : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Phone (optional)</Text>
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="+1 555 123 4567"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="phone-pad"
                />
              )}
            />
            {errors.phone ? (
              <Text style={styles.errorText}>{errors.phone.message}</Text>
            ) : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Address line 1</Text>
            <Controller
              control={control}
              name="addressLine1"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="123 Main St"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="words"
                />
              )}
            />
            {errors.addressLine1 ? (
              <Text style={styles.errorText}>
                {errors.addressLine1.message}
              </Text>
            ) : null}
          </View>

          <View style={styles.row}>
            <View style={styles.fieldHalf}>
              <Text style={styles.label}>City</Text>
              <Controller
                control={control}
                name="city"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Austin"
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="words"
                  />
                )}
              />
              {errors.city ? (
                <Text style={styles.errorText}>{errors.city.message}</Text>
              ) : null}
            </View>
            <View style={styles.fieldHalf}>
              <Text style={styles.label}>Postal code</Text>
              <Controller
                control={control}
                name="postalCode"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="78701"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
              {errors.postalCode ? (
                <Text style={styles.errorText}>
                  {errors.postalCode.message}
                </Text>
              ) : null}
            </View>
          </View>

          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Order summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items</Text>
              <Text style={styles.summaryValue}>{totals.itemsCount}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(totals.subtotal)}
              </Text>
            </View>
          </View>

          {mutation.error ? (
            <View style={styles.inlineError}>
              <Text style={styles.inlineErrorText}>
                {mutation.error instanceof Error
                  ? mutation.error.message
                  : 'Order failed. Please try again.'}
              </Text>
            </View>
          ) : null}

          <Pressable
            style={[styles.primaryButton, mutation.isPending && styles.disabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={mutation.isPending}>
            <Text style={styles.primaryButtonText}>
              {mutation.isPending ? 'Placing order...' : 'Place Order'}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
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
  title: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  fieldGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.caption,
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  errorText: {
    marginTop: spacing.xs,
    color: colors.danger,
    fontSize: typography.caption,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  fieldHalf: {
    flex: 1,
  },
  summary: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  savedCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
  },
  savedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  savedTitle: {
    fontWeight: '600',
    color: colors.text,
  },
  savedClear: {
    color: colors.danger,
    fontSize: typography.caption,
    fontWeight: '600',
  },
  savedName: {
    fontWeight: '600',
    color: colors.text,
  },
  savedText: {
    color: colors.muted,
    marginTop: spacing.xs,
  },
  savedButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  savedButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
  summaryTitle: {
    fontWeight: '600',
    marginBottom: spacing.sm,
    color: colors.text,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    color: colors.muted,
  },
  summaryValue: {
    color: colors.text,
    fontWeight: '600',
  },
  primaryButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  inlineError: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: '#FEE2E2',
  },
  inlineErrorText: {
    color: colors.danger,
    fontSize: typography.caption,
  },
  disabled: {
    opacity: 0.7,
  },
});
