import { StyleSheet } from 'react-native';
import { typography, spacing, radius, base } from '../../styles/theme';

export const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { paddingVertical: spacing.md, paddingBottom: 100 },
  header: { ...typography.displayLg, marginBottom: 4, paddingHorizontal: spacing.md },
  subtitle: { ...typography.bodyLg, color: base.textSecondary, marginBottom: spacing.lg, paddingHorizontal: spacing.md },
  sectionLabel: { ...typography.labelSm, color: base.textTertiary, marginBottom: spacing.sm, paddingHorizontal: spacing.md },
  hScroll: { marginHorizontal: -spacing.md },
  recipeCard: { width: 160, marginRight: spacing.sm, borderRadius: radius.lg, backgroundColor: base.surface, overflow: 'hidden' as const },
  recipeImg: { width: '100%' as const, height: 100 },
  recipeName: { ...typography.labelMd, color: base.textPrimary, padding: spacing.xs, paddingBottom: 2 },
  recipeDuration: { ...typography.labelSm, color: base.textTertiary, paddingHorizontal: spacing.xs, paddingBottom: spacing.xs },
  dayRow: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: base.outline, paddingHorizontal: spacing.md },
  dayName: { ...typography.labelMd, color: base.textTertiary },
  dayMeal: { ...typography.bodyMd, color: base.textPrimary },
  ctaBtn: { borderRadius: radius.full, paddingVertical: 16, alignItems: 'center' as const, marginTop: spacing.lg, marginHorizontal: spacing.md },
  ctaBtnText: { ...typography.labelMd, color: '#fff' },
});
