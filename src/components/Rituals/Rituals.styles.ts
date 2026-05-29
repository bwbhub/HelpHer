import { StyleSheet } from 'react-native';
import { typography, spacing, radius, base } from '../../styles/theme';

export const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { padding: spacing.md, paddingBottom: 100 },
  header: { ...typography.displayLg, marginBottom: 4 },
  season: { ...typography.bodyLg, color: base.textSecondary, marginBottom: spacing.lg },
  section: { marginBottom: spacing.lg },
  sectionLabel: { ...typography.labelSm, color: base.textTertiary, marginBottom: spacing.sm },
  card: { backgroundColor: base.surface, borderRadius: radius.lg, padding: spacing.sm, marginBottom: spacing.xs },
  cardTitle: { ...typography.labelMd, color: base.textPrimary, marginBottom: 4 },
  cardBody: { ...typography.bodyMd, color: base.textSecondary },
});
