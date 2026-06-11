import { StyleSheet } from 'react-native';
import { typography, spacing, radius, base } from '../../styles/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: base.background },
  inner: { padding: spacing.md, paddingTop: spacing.lg, paddingBottom: 48, gap: spacing.sm },
  title: { ...typography.headlineLg, color: base.textPrimary },
  subtitle: { ...typography.bodyMd, color: base.textSecondary, marginBottom: spacing.sm },

  card: { backgroundColor: base.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  cardLabel: { ...typography.labelSm, color: base.textTertiary },
  code: {
    ...typography.displayLg,
    color: base.textPrimary,
    textAlign: 'center' as const,
    letterSpacing: 4,
  },
  hint: { ...typography.labelSm, color: base.textTertiary, textAlign: 'center' as const, textTransform: 'none' as const },
  linkText: { ...typography.labelMd, color: base.textSecondary, textAlign: 'center' as const },

  divider: { ...typography.labelSm, color: base.textTertiary, textAlign: 'center' as const, marginVertical: spacing.xs },

  input: {
    backgroundColor: base.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 14,
    ...typography.headlineMd,
    color: base.textPrimary,
    textAlign: 'center' as const,
    letterSpacing: 2,
  },
  error: { ...typography.bodyMd, color: base.error },

  primaryBtn: { backgroundColor: base.textPrimary, borderRadius: radius.full, paddingVertical: 16, alignItems: 'center' as const },
  primaryBtnText: { ...typography.labelMd, color: '#fff' },
  dangerBtn: {
    borderRadius: radius.full,
    paddingVertical: 16,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: base.error,
  },
  dangerBtnText: { ...typography.labelMd, color: base.error },
  btnDisabled: { opacity: 0.45 },
});
