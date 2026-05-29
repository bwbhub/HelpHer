import { StyleSheet } from 'react-native';
import { typography, spacing, radius, base } from '../../styles/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: base.background },
  inner: { padding: spacing.md, paddingBottom: 48, gap: spacing.sm },
  title: { ...typography.headlineLg, color: base.textPrimary },
  subtitle: { ...typography.bodyMd, color: base.textSecondary, marginBottom: spacing.sm },
  card: { backgroundColor: base.surface, borderRadius: radius.lg, padding: spacing.sm },
  row: { flexDirection: 'row' as const, alignItems: 'center' as const },
  question: { ...typography.bodyMd, color: base.textPrimary, marginBottom: spacing.xs },
  value: { ...typography.headlineMd, color: base.textPrimary },
  hint: { ...typography.labelSm, color: base.textTertiary, marginTop: 4 },
  stepper: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: spacing.sm },
  stepBtn: { width: 40, height: 40, borderRadius: radius.full, backgroundColor: base.background, alignItems: 'center' as const, justifyContent: 'center' as const },
  stepBtnText: { ...typography.headlineMd, color: base.textPrimary },
  stepValue: { ...typography.headlineMd, color: base.textPrimary, minWidth: 80, textAlign: 'center' as const },
  primaryBtn: { backgroundColor: base.textPrimary, borderRadius: radius.full, paddingVertical: 16, alignItems: 'center' as const, marginTop: spacing.sm },
  primaryBtnText: { ...typography.labelMd, color: '#fff' },
});
