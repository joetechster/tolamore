import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/src/constants/theme';

export type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
  actionLabel?: string;
};

export const ErrorState = ({
  message = 'Something went wrong.',
  onRetry,
  actionLabel = 'Try Again',
}: ErrorStateProps) => (
  <View style={styles.container}>
    <Text style={styles.title}>Unable to load</Text>
    <Text style={styles.message}>{message}</Text>
    {onRetry ? (
      <Pressable style={styles.button} onPress={onRetry}>
        <Text style={styles.buttonText}>{actionLabel}</Text>
      </Pressable>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: typography.heading,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: typography.body,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  button: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
