import { StyleSheet } from 'react-native';
import { typography, spacing, radius, base } from '../../styles/theme';

const COL = `${100 / 7}%`;

export const styles = StyleSheet.create({
  container: { backgroundColor: base.surface, borderRadius: radius.lg, padding: spacing.sm },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: spacing.xs,
  },
  monthLabel: { ...typography.labelMd, color: base.textPrimary, textTransform: 'capitalize' as const },
  nav: { width: 40, height: 40, alignItems: 'center' as const, justifyContent: 'center' as const },
  navText: { ...typography.headlineMd, color: base.textPrimary },
  weekRow: { flexDirection: 'row' as const, marginBottom: 4 },
  weekday: { width: COL, textAlign: 'center' as const, ...typography.labelSm, color: base.textTertiary },
  grid: { flexDirection: 'row' as const, flexWrap: 'wrap' as const },
  cell: { width: COL, aspectRatio: 1, alignItems: 'center' as const, justifyContent: 'center' as const },
  dayCircle: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  dayCircleSelected: { backgroundColor: base.textPrimary },
  dayText: { ...typography.bodyMd, color: base.textPrimary },
  dayTextSelected: { color: '#fff' },
  dayTextDisabled: { color: base.outline },
});
