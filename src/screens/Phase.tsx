import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { typography, spacing, radius, base, phaseThemes } from '../styles/theme';
import type { CyclePhaseInfo, UserRole } from '../types';

interface Props {
  phaseInfo: CyclePhaseInfo;
  userRole: UserRole;
  partnerName?: string;
}

export default function Phase({ phaseInfo, userRole, partnerName }: Props) {
  const theme = phaseThemes[phaseInfo.phase];
  const isPrimary = userRole === 'primary';

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.inner}>
      <View style={styles.header}>
        <Text style={[styles.season, { color: theme.primary }]}>{theme.season}</Text>
        <Text style={[styles.phaseLabel, { color: theme.primary }]}>
          {isPrimary ? theme.label : `${partnerName ?? 'Votre partenaire'} est en ${theme.label}`}
        </Text>
        {isPrimary && (
          <>
            <Text style={styles.day}>Jour {phaseInfo.dayOfCycle} du cycle</Text>
            <Text style={styles.next}>Phase suivante dans environ {phaseInfo.nextPhaseInDays} jours</Text>
          </>
        )}
      </View>

      {isPrimary && phaseInfo.fertilityWindowActive && phaseInfo.fertilityDays && (
        <View style={[styles.card, { backgroundColor: theme.primaryMuted }]}>
          <Text style={[styles.cardLabel, { color: theme.primary }]}>Fenêtre de fertilité</Text>
          <Text style={styles.cardBody}>Jours les plus propices : {phaseInfo.fertilityDays.join(', ')}</Text>
          <Text style={styles.disclaimer}>Indicatif — non contraceptif</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardLabel}>{isPrimary ? 'Le focus du jour' : 'Ce que vous pouvez faire aujourd\'hui'}</Text>
        <Text style={styles.cardBody}>{isPrimary ? FOCUS[phaseInfo.phase] : PARTNER_SUGGESTION[phaseInfo.phase]}</Text>
      </View>

      <View style={styles.row}>
        <View style={[styles.card, styles.half]}>
          <Text style={styles.cardLabel}>Mouvement</Text>
          <Text style={styles.cardBody}>{MOVEMENT[phaseInfo.phase]}</Text>
        </View>
        <View style={[styles.card, styles.half]}>
          <Text style={styles.cardLabel}>Recette</Text>
          <Text style={styles.cardBody}>{RECIPE[phaseInfo.phase]}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const FOCUS = {
  winter: 'Accordez-vous de la douceur. Reposez-vous sans culpabilité.',
  spring: 'Votre énergie revient doucement. C\'est le bon moment pour commencer quelque chose.',
  summer: 'Vous rayonnez. Profitez de cette période pour vous connecter aux autres.',
  autumn: 'Tournez-vous vers l\'intérieur. Écoutez ce dont vous avez besoin.',
};
const PARTNER_SUGGESTION = {
  winter: 'Proposez un moment calme. Votre présence compte plus que les mots.',
  spring: 'Elle retrouve de l\'énergie. Planifiez quelque chose d\'agréable ensemble.',
  summer: 'Elle est à son apogée. Partagez ce dynamisme avec elle.',
  autumn: 'Elle est peut-être plus introspective. Soyez attentif(ve) sans forcer.',
};
const MOVEMENT = { winter: 'Yoga doux ou marche', spring: 'Pilates ou jogging', summer: 'HIIT ou danse', autumn: 'Stretching ou yoga' };
const RECIPE = { winter: 'Soupe de lentilles', spring: 'Bowl quinoa vert', summer: 'Gaspacho frais', autumn: 'Curry de pois chiches' };

const styles = StyleSheet.create({
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
  row: { flexDirection: 'row', gap: spacing.xs },
  half: { flex: 1 },
});
