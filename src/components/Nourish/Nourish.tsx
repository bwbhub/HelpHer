import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { phaseThemes, spacing } from '../../styles/theme';
import type { CyclePhase, ViewMode } from '../../types';
import { styles } from './Nourish.styles';

interface Props { phase: CyclePhase; userRole: ViewMode }

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

