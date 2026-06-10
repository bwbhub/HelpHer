import React from 'react';
import { View, StyleSheet } from 'react-native';
import { radius, base, spacing } from '../../styles/theme';

interface Props {
  total: number;
  /** Index de l'étape courante (0-based). */
  current: number;
}

/** Indicateur de progression de l'onboarding : la pastille active s'allonge. */
export default function ProgressDots({ total, current }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.dot, i === current && styles.dotActive, i < current && styles.dotDone]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.xs, justifyContent: 'center', marginBottom: spacing.md },
  dot: { width: 8, height: 8, borderRadius: radius.full, backgroundColor: base.outline },
  dotActive: { width: 24, backgroundColor: base.textPrimary },
  dotDone: { backgroundColor: base.textSecondary },
});
