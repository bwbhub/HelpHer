import { StyleSheet } from 'react-native';
import { typography, spacing, radius, base } from '../../styles/theme';

export const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { padding: spacing.md, paddingBottom: 100 },
  header: { marginBottom: spacing.lg },
  season: { ...typography.labelSm, marginBottom: spacing.xs },
  phaseLabel: { ...typography.displayLg, marginBottom: spacing.xs },
  day: { ...typography.bodyLg, color: base.textPrimary },
  next: { ...typography.bodyMd, color: base.textSecondary, marginTop: 4 },
  card: { backgroundColor: base.surface, borderRadius: radius.lg, padding: spacing.sm, marginBottom: spacing.xs },
  cardLabel: { ...typography.labelSm, color: base.textTertiary, marginBottom: spacing.xs },
  cardBody: { ...typography.bodyMd, color: base.textPrimary },
  disclaimer: { ...typography.labelSm, color: base.textTertiary, marginTop: spacing.xs },
  row: { flexDirection: 'row' as const, gap: spacing.xs },
  half: { flex: 1 },
});
