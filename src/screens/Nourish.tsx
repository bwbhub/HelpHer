import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { typography, spacing, radius, base, phaseThemes } from '../styles/theme';
import type { CyclePhase, UserRole } from '../types';

interface Props { phase: CyclePhase; userRole: UserRole }

export default function Nourish({ phase, userRole }: Props) {
  const theme = phaseThemes[phase];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.inner}>
      <Text style={[styles.header, { color: theme.primary }]}>Nourish</Text>
      <Text style={styles.subtitle}>
        {userRole === 'partner' ? 'Cuisinez ensemble ce soir ?' : `Les saveurs de votre ${theme.label.toLowerCase()}`}
      </Text>

      <Text style={styles.sectionLabel}>Recettes du moment</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll} contentContainerStyle={{ paddingHorizontal: spacing.md }}>
        {RECIPES[phase].map(r => (
          <View key={r.name} style={styles.recipeCard}>
            <View style={[styles.recipeImg, { backgroundColor: theme.primaryMuted }]} />
            <Text style={styles.recipeName}>{r.name}</Text>
            <Text style={styles.recipeDuration}>{r.duration} min</Text>
          </View>
        ))}
      </ScrollView>

      <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>Plan de la semaine</Text>
      {WEEK_PLAN[phase].map(d => (
        <View key={d.day} style={styles.dayRow}>
          <Text style={styles.dayName}>{d.day}</Text>
          <Text style={styles.dayMeal}>{d.meal}</Text>
        </View>
      ))}

      <TouchableOpacity style={[styles.ctaBtn, { backgroundColor: theme.primary }]}>
        <Text style={styles.ctaBtnText}>Générer ma liste de courses</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const RECIPES: Record<CyclePhase, { name: string; duration: number }[]> = {
  winter: [{ name: 'Soupe de lentilles corail', duration: 25 }, { name: 'Porridge fruits rouges', duration: 10 }, { name: 'Curry patate douce', duration: 35 }],
  spring: [{ name: 'Buddha bowl vert', duration: 20 }, { name: 'Quinoa aux herbes', duration: 15 }, { name: 'Smoothie bowl', duration: 5 }],
  summer: [{ name: 'Gaspacho tomates', duration: 10 }, { name: 'Tartare de légumes', duration: 15 }, { name: 'Salade niçoise', duration: 20 }],
  autumn: [{ name: 'Curry de pois chiches', duration: 30 }, { name: 'Soupe courge butternut', duration: 25 }, { name: 'Riz aux champignons', duration: 20 }],
};

const WEEK_PLAN: Record<CyclePhase, { day: string; meal: string }[]> = {
  winter: [{ day: 'Lundi', meal: 'Soupe de lentilles' }, { day: 'Mardi', meal: 'Curry patate douce' }, { day: 'Mercredi', meal: 'Bouillon maison' }, { day: 'Jeudi', meal: 'Porridge salé' }, { day: 'Vendredi', meal: 'Pâtes sauce tomate' }],
  spring: [{ day: 'Lundi', meal: 'Buddha bowl' }, { day: 'Mardi', meal: 'Salade quinoa' }, { day: 'Mercredi', meal: 'Omelette herbes' }, { day: 'Jeudi', meal: 'Wok printanier' }, { day: 'Vendredi', meal: 'Poisson vapeur' }],
  summer: [{ day: 'Lundi', meal: 'Gaspacho + crudités' }, { day: 'Mardi', meal: 'Salade niçoise' }, { day: 'Mercredi', meal: 'Tartare saumon' }, { day: 'Jeudi', meal: 'Bowl pastèque feta' }, { day: 'Vendredi', meal: 'Brochettes grillées' }],
  autumn: [{ day: 'Lundi', meal: 'Curry pois chiches' }, { day: 'Mardi', meal: 'Soupe butternut' }, { day: 'Mercredi', meal: 'Riz champignons' }, { day: 'Jeudi', meal: 'Gratin légumes racines' }, { day: 'Vendredi', meal: 'Dal de lentilles' }],
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { paddingVertical: spacing.md, paddingBottom: 100 },
  header: { ...typography.displayLg, marginBottom: 4, paddingHorizontal: spacing.md },
  subtitle: { ...typography.bodyLg, color: base.textSecondary, marginBottom: spacing.lg, paddingHorizontal: spacing.md },
  sectionLabel: { ...typography.labelSm, color: base.textTertiary, marginBottom: spacing.sm, paddingHorizontal: spacing.md },
  hScroll: { marginHorizontal: -spacing.md },
  recipeCard: { width: 160, marginRight: spacing.sm, borderRadius: radius.lg, backgroundColor: base.surface, overflow: 'hidden' },
  recipeImg: { width: '100%', height: 100 },
  recipeName: { ...typography.labelMd, color: base.textPrimary, padding: spacing.xs, paddingBottom: 2 },
  recipeDuration: { ...typography.labelSm, color: base.textTertiary, paddingHorizontal: spacing.xs, paddingBottom: spacing.xs },
  dayRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: base.outline, paddingHorizontal: spacing.md },
  dayName: { ...typography.labelMd, color: base.textTertiary },
  dayMeal: { ...typography.bodyMd, color: base.textPrimary },
  ctaBtn: { borderRadius: radius.full, paddingVertical: 16, alignItems: 'center', marginTop: spacing.lg, marginHorizontal: spacing.md },
  ctaBtnText: { ...typography.labelMd, color: '#fff' },
});
