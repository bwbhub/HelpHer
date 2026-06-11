import { StyleSheet } from 'react-native';
import { typography, spacing, radius, base } from '../../styles/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: base.background },
  inner: { padding: spacing.md, paddingBottom: 48, gap: spacing.md },

  section: { gap: spacing.xs },
  sectionTitle: { ...typography.labelSm, color: base.textTertiary, marginLeft: spacing.xs },

  card: { backgroundColor: base.surface, borderRadius: radius.lg, paddingHorizontal: spacing.sm },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 14,
    gap: spacing.sm,
  },
  rowTextWrap: { flex: 1, gap: 2 },
  rowLabel: { ...typography.bodyMd, color: base.textPrimary, flexShrink: 1 },
  rowLabelDisabled: { color: base.textTertiary },
  rowHint: { ...typography.labelSm, color: base.textTertiary, textTransform: 'none' as const, marginLeft: spacing.xs },
  separator: { height: 1, backgroundColor: base.background },
  chevron: { ...typography.headlineMd, color: base.textTertiary },
  danger: { color: base.error },

  pillRow: { flexDirection: 'row' as const, gap: spacing.xs },
  pill: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: base.surface,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pillActive: { borderColor: base.textPrimary, backgroundColor: '#fff' },
  pillText: { ...typography.labelMd, color: base.textSecondary },
  pillTextActive: { color: base.textPrimary },
});
