import { StyleSheet } from 'react-native';
import { typography, spacing, radius, base } from '../../styles/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: base.background },
  inner: { padding: spacing.md, paddingTop: spacing.lg, paddingBottom: 48, gap: spacing.sm, flexGrow: 1 },
  title: { ...typography.headlineLg, color: base.textPrimary },
  subtitle: { ...typography.bodyMd, color: base.textSecondary, marginBottom: spacing.sm },

  // Cartes de sélection (choix du rôle)
  choiceCard: {
    backgroundColor: base.surface,
    borderRadius: radius.lg,
    padding: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  choiceCardActive: { borderColor: base.textPrimary, backgroundColor: '#fff' },
  choiceTitle: { ...typography.headlineMd, color: base.textPrimary, fontSize: 20, lineHeight: 26 },
  choiceDesc: { ...typography.bodyMd, color: base.textSecondary, marginTop: 4 },

  // Cartes d'info (setup cycle)
  card: { backgroundColor: base.surface, borderRadius: radius.lg, padding: spacing.sm },
  row: { flexDirection: 'row' as const, alignItems: 'center' as const },
  question: { ...typography.bodyMd, color: base.textPrimary, marginBottom: spacing.xs },
  hint: { ...typography.labelSm, color: base.textTertiary, marginTop: 4 },

  stepper: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: spacing.sm },
  stepBtn: {
    width: 40, height: 40, borderRadius: radius.full,
    backgroundColor: base.background, alignItems: 'center' as const, justifyContent: 'center' as const,
  },
  stepBtnText: { ...typography.headlineMd, color: base.textPrimary },
  stepValue: { ...typography.headlineMd, color: base.textPrimary, minWidth: 90, textAlign: 'center' as const },

  input: {
    backgroundColor: base.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 14,
    ...typography.bodyMd,
    color: base.textPrimary,
  },

  // Pied de page : navigation
  footer: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: spacing.sm, marginTop: 'auto' },
  primaryBtn: {
    flex: 1,
    backgroundColor: base.textPrimary,
    borderRadius: radius.full,
    paddingVertical: 16,
    alignItems: 'center' as const,
  },
  primaryBtnDisabled: { backgroundColor: base.outline },
  primaryBtnText: { ...typography.labelMd, color: '#fff' },
  backBtn: { paddingVertical: 16, paddingHorizontal: spacing.sm, alignItems: 'center' as const },
  backBtnText: { ...typography.labelMd, color: base.textSecondary },
});
