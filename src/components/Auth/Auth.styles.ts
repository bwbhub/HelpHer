import { StyleSheet } from 'react-native';
import { typography, spacing, radius, base } from '../../styles/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: base.background },
  inner: { flex: 1, paddingHorizontal: spacing.md, justifyContent: 'center', gap: spacing.xs },
  title: { ...typography.displayLg, color: base.textPrimary, textAlign: 'center', marginBottom: spacing.xs },
  subtitle: { ...typography.bodyMd, color: base.textSecondary, textAlign: 'center', marginBottom: spacing.lg },
  label: { ...typography.labelSm, color: base.textTertiary },
  input: { backgroundColor: base.surface, borderRadius: radius.md, paddingHorizontal: spacing.sm, paddingVertical: 14, ...typography.bodyMd, color: base.textPrimary },
  error: { ...typography.labelMd, color: base.error },
  primaryBtn: { backgroundColor: base.textPrimary, borderRadius: radius.full, paddingVertical: 16, alignItems: 'center' as const, marginTop: spacing.sm },
  primaryBtnText: { ...typography.labelMd, color: '#fff' },
  switchText: { ...typography.bodyMd, color: base.textSecondary, textAlign: 'center' as const, marginTop: spacing.sm },
});
