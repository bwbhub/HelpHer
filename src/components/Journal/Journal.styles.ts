import { StyleSheet } from 'react-native';
import { typography, spacing, radius, base } from '../../styles/theme';

export const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { padding: spacing.md, paddingBottom: 100 },
  header: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'baseline' as const, marginBottom: spacing.sm },
  date: { ...typography.headlineMd, color: base.textPrimary },
  phase: { ...typography.labelSm },
  input: { backgroundColor: base.surface, borderRadius: radius.lg, padding: spacing.sm, ...typography.bodyMd, color: base.textPrimary, minHeight: 120, textAlignVertical: 'top' as const, marginBottom: spacing.xs },
  actions: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, marginBottom: spacing.sm },
  privacyText: { ...typography.labelMd, color: base.textSecondary },
  saveBtn: { borderRadius: radius.full, paddingVertical: 12, paddingHorizontal: spacing.sm },
  saveBtnText: { ...typography.labelMd, color: '#fff' },
  periodBtn: { backgroundColor: base.surface, borderRadius: radius.lg, padding: spacing.sm, alignItems: 'center' as const, marginBottom: spacing.lg },
  periodBtnText: { ...typography.bodyMd, color: base.textPrimary },
  sectionLabel: { ...typography.labelSm, color: base.textTertiary, marginBottom: spacing.xs },
  entryCard: { backgroundColor: base.surface, borderRadius: radius.lg, padding: spacing.sm, marginBottom: spacing.xs },
  entryMeta: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, marginBottom: 4 },
  entryDate: { ...typography.labelSm, color: base.textTertiary },
  entryLock: { fontSize: 12 },
  entryContent: { ...typography.bodyMd, color: base.textPrimary },
});
