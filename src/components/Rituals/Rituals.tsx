import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { phaseThemes } from '../../styles/theme';
import { useT } from '../../i18n/LocaleProvider';
import type { CyclePhase, ViewMode } from '../../types';
import { styles } from './Rituals.styles';

interface Props { phase: CyclePhase; viewMode: ViewMode }

export default function Rituals({ phase, viewMode }: Props) {
  const { t, dict } = useT();
  const theme = phaseThemes[phase];
  const sections = viewMode === 'self' ? dict.rituals.self[phase] : dict.rituals.partner[phase];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.inner}>
      <Text style={[styles.header, { color: theme.primary }]}>{t(`phases.label.${phase}`)}</Text>
      <Text style={styles.season}>{t(`phases.season.${phase}`)}</Text>
      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionLabel}>{section.title}</Text>
          {section.cards.map((card) => (
            <View key={card.title} style={styles.card}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardBody}>{card.body}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}
