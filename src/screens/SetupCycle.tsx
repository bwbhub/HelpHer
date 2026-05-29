import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';
import { typography, spacing, radius, base } from '../styles/theme';
import type { CycleSettings } from '../types';

interface Props {
  onComplete: (settings: CycleSettings & { fertilityTracking: boolean }) => void;
}

export default function SetupCycle({ onComplete }: Props) {
  const [lastPeriodStart] = useState(new Date().toISOString().split('T')[0]);
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [fertilityTracking, setFertilityTracking] = useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.title}>Parlons de votre cycle</Text>
      <Text style={styles.subtitle}>Quelques infos pour personnaliser votre expérience.</Text>

      <View style={styles.card}>
        <Text style={styles.question}>Quand ont commencé vos dernières règles ?</Text>
        <Text style={styles.value}>{lastPeriodStart}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.question}>Durée habituelle de votre cycle</Text>
        <View style={styles.stepper}>
          <TouchableOpacity onPress={() => setCycleLength(l => Math.max(21, l - 1))} style={styles.stepBtn}><Text style={styles.stepBtnText}>−</Text></TouchableOpacity>
          <Text style={styles.stepValue}>{cycleLength} jours</Text>
          <TouchableOpacity onPress={() => setCycleLength(l => Math.min(40, l + 1))} style={styles.stepBtn}><Text style={styles.stepBtnText}>+</Text></TouchableOpacity>
        </View>
        <Text style={styles.hint}>28 jours en moyenne</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.question}>Durée habituelle de vos règles</Text>
        <View style={styles.stepper}>
          <TouchableOpacity onPress={() => setPeriodLength(l => Math.max(2, l - 1))} style={styles.stepBtn}><Text style={styles.stepBtnText}>−</Text></TouchableOpacity>
          <Text style={styles.stepValue}>{periodLength} jours</Text>
          <TouchableOpacity onPress={() => setPeriodLength(l => Math.min(10, l + 1))} style={styles.stepBtn}><Text style={styles.stepBtnText}>+</Text></TouchableOpacity>
        </View>
        <Text style={styles.hint}>5 jours en moyenne</Text>
      </View>

      <View style={[styles.card, styles.row]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.question}>J'essaie de concevoir</Text>
          <Text style={styles.hint}>Active un encart indicatif sur la fertilité</Text>
        </View>
        <Switch value={fertilityTracking} onValueChange={setFertilityTracking} trackColor={{ false: base.outline, true: '#456646' }} />
      </View>

      <TouchableOpacity style={styles.primaryBtn} onPress={() => onComplete({ lastPeriodStart, averageCycleLength: cycleLength, averagePeriodLength: periodLength, fertilityTracking })}>
        <Text style={styles.primaryBtnText}>Continuer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: base.background },
  inner: { padding: spacing.md, paddingBottom: 48, gap: spacing.sm },
  title: { ...typography.headlineLg, color: base.textPrimary },
  subtitle: { ...typography.bodyMd, color: base.textSecondary, marginBottom: spacing.sm },
  card: { backgroundColor: base.surface, borderRadius: radius.lg, padding: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center' },
  question: { ...typography.bodyMd, color: base.textPrimary, marginBottom: spacing.xs },
  value: { ...typography.headlineMd, color: base.textPrimary },
  hint: { ...typography.labelSm, color: base.textTertiary, marginTop: 4 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepBtn: { width: 40, height: 40, borderRadius: radius.full, backgroundColor: base.background, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { ...typography.headlineMd, color: base.textPrimary },
  stepValue: { ...typography.headlineMd, color: base.textPrimary, minWidth: 80, textAlign: 'center' },
  primaryBtn: { backgroundColor: base.textPrimary, borderRadius: radius.full, paddingVertical: 16, alignItems: 'center', marginTop: spacing.sm },
  primaryBtnText: { ...typography.labelMd, color: '#fff' },
});
