import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/src/constants/theme';

export type QuantityStepperProps = {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
};

export const QuantityStepper = ({
  quantity,
  onIncrease,
  onDecrease,
  min = 1,
}: QuantityStepperProps) => {
  const decreaseDisabled = quantity <= min;

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.button, decreaseDisabled && styles.buttonDisabled]}
        onPress={onDecrease}
        disabled={decreaseDisabled}>
        <Text style={styles.buttonText}>-</Text>
      </Pressable>
      <Text style={styles.quantity}>{quantity}</Text>
      <Pressable style={styles.button} onPress={onIncrease}>
        <Text style={styles.buttonText}>+</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    fontSize: typography.heading,
    fontWeight: '600',
    color: colors.text,
  },
  quantity: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.text,
    minWidth: 20,
    textAlign: 'center',
  },
});