import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { phaseThemes, spacing } from '../../styles/theme';
import { useT } from '../../i18n/LocaleProvider';
import type { CyclePhase, ViewMode } from '../../types';
import { styles } from './Nourish.styles';

interface Props { phase: CyclePhase; viewMode: ViewMode }

export default function Nourish({ phase, viewMode }: Props) {
  const { t, dict } = useT();
  const theme = phaseThemes[phase];
  const recipes = dict.nourish.recipes[phase];
  const weekPlan = dict.nourish.weekPlan[phase];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.inner}>
      <Text style={[styles.header, { color: theme.primary }]}>{t('nourish.title')}</Text>
      <Text style={styles.subtitle}>
        {viewMode === 'partner'
          ? t('nourish.subtitlePartner')
          : t('nourish.subtitleSelf', { season: t(`phases.label.${phase}`).toLowerCase() })}
      </Text>

      <Text style={styles.sectionLabel}>{t('nourish.recipesLabel')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll} contentContainerStyle={{ paddingHorizontal: spacing.md }}>
        {recipes.map((r) => (
          <View key={r.name} style={styles.recipeCard}>
            <View style={[styles.recipeImg, { backgroundColor: theme.primaryMuted }]} />
            <Text style={styles.recipeName}>{r.name}</Text>
            <Text style={styles.recipeDuration}>{t('nourish.minutes', { n: r.duration })}</Text>
          </View>
        ))}
      </ScrollView>

      <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>{t('nourish.weekLabel')}</Text>
      {weekPlan.map((d) => (
        <View key={d.day} style={styles.dayRow}>
          <Text style={styles.dayName}>{d.day}</Text>
          <Text style={styles.dayMeal}>{d.meal}</Text>
        </View>
      ))}

      <TouchableOpacity style={[styles.ctaBtn, { backgroundColor: theme.primary }]}>
        <Text style={styles.ctaBtnText}>{t('nourish.cta')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
