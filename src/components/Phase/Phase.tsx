import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { phaseThemes, spacing } from '../../styles/theme';
import { useT } from '../../i18n/LocaleProvider';
import type { CyclePhaseInfo, ViewMode } from '../../types';
import { styles } from './Phase.styles';

interface Props {
  phaseInfo: CyclePhaseInfo;
  viewMode: ViewMode;
  partnerName?: string;
  /** Ouvre l'écran de réglages (optionnel). */
  onOpenSettings?: () => void;
}

export default function Phase({ phaseInfo, viewMode, partnerName, onOpenSettings }: Props) {
  const { t } = useT();
  const theme = phaseThemes[phaseInfo.phase];
  const phase = phaseInfo.phase;
  const isPrimary = viewMode === 'self';
  const label = t(`phases.label.${phase}`);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.inner}>
      <View style={styles.header}>
        <Text style={[styles.season, { color: theme.primary }]}>{t(`phases.season.${phase}`)}</Text>
        <Text style={[styles.phaseLabel, { color: theme.primary }]}>
          {isPrimary
            ? label
            : t('phaseScreen.partnerInPhase', { name: partnerName ?? t('phaseScreen.partnerFallback'), label })}
        </Text>
        {isPrimary && (
          <>
            <Text style={styles.day}>{t('phaseScreen.dayOfCycle', { day: phaseInfo.dayOfCycle })}</Text>
            <Text style={styles.next}>{t('phaseScreen.nextPhase', { days: phaseInfo.nextPhaseInDays })}</Text>
          </>
        )}
        {onOpenSettings && (
          <TouchableOpacity onPress={onOpenSettings} style={{ marginTop: spacing.xs }}>
            <Text style={[styles.cardLabel, { color: theme.primary }]}>{t('phaseScreen.settings')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {isPrimary && phaseInfo.fertilityWindowActive && phaseInfo.fertilityDays && (
        <View style={[styles.card, { backgroundColor: theme.primaryMuted }]}>
          <Text style={[styles.cardLabel, { color: theme.primary }]}>{t('phaseScreen.fertilityLabel')}</Text>
          <Text style={styles.cardBody}>{t('phaseScreen.fertilityDays', { days: phaseInfo.fertilityDays.join(', ') })}</Text>
          <Text style={styles.disclaimer}>{t('phaseScreen.fertilityDisclaimer')}</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardLabel}>{isPrimary ? t('phaseScreen.focusLabel') : t('phaseScreen.partnerTodayLabel')}</Text>
        <Text style={styles.cardBody}>{isPrimary ? t(`phaseScreen.focus.${phase}`) : t(`phaseScreen.partnerSuggestion.${phase}`)}</Text>
      </View>

      <View style={styles.row}>
        <View style={[styles.card, styles.half]}>
          <Text style={styles.cardLabel}>{t('phaseScreen.movementLabel')}</Text>
          <Text style={styles.cardBody}>{t(`phaseScreen.movement.${phase}`)}</Text>
        </View>
        <View style={[styles.card, styles.half]}>
          <Text style={styles.cardLabel}>{t('phaseScreen.recipeLabel')}</Text>
          <Text style={styles.cardBody}>{t(`phaseScreen.recipe.${phase}`)}</Text>
        </View>
      </View>
    </ScrollView>
  );
}
