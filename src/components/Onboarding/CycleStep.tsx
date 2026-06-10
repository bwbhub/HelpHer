import React from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import Calendar from '../Calendar/Calendar';
import { base } from '../../styles/theme';
import { styles } from './Onboarding.styles';
import type { CycleSettings } from '../../types';

export type CycleDraft = CycleSettings & { fertilityTracking: boolean };

interface Props {
  value: CycleDraft;
  onChange: (patch: Partial<CycleDraft>) => void;
}

/** Étape 2 — setup cycle (primary), avec calendrier maison au lieu d'une date figée. */
export default function CycleStep({ value, onChange }: Props) {
  return (
    <View style={{ gap: 16 }}>
      <Text style={styles.title}>Parlons de votre cycle</Text>
      <Text style={styles.subtitle}>Quelques repères pour personnaliser — rien n'est figé.</Text>

      <Text style={styles.question}>Quand ont commencé vos dernières règles ?</Text>
      <Calendar value={value.lastPeriodStart} onChange={(iso) => onChange({ lastPeriodStart: iso })} />

      <View style={styles.card}>
        <Text style={styles.question}>Durée habituelle de votre cycle</Text>
        <View style={styles.stepper}>
          <TouchableOpacity
            onPress={() => onChange({ averageCycleLength: Math.max(21, value.averageCycleLength - 1) })}
            style={styles.stepBtn}
          >
            <Text style={styles.stepBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.stepValue}>{value.averageCycleLength} jours</Text>
          <TouchableOpacity
            onPress={() => onChange({ averageCycleLength: Math.min(40, value.averageCycleLength + 1) })}
            style={styles.stepBtn}
          >
            <Text style={styles.stepBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>Autour de 28 jours en moyenne</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.question}>Durée habituelle de vos règles</Text>
        <View style={styles.stepper}>
          <TouchableOpacity
            onPress={() => onChange({ averagePeriodLength: Math.max(2, value.averagePeriodLength - 1) })}
            style={styles.stepBtn}
          >
            <Text style={styles.stepBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.stepValue}>{value.averagePeriodLength} jours</Text>
          <TouchableOpacity
            onPress={() => onChange({ averagePeriodLength: Math.min(10, value.averagePeriodLength + 1) })}
            style={styles.stepBtn}
          >
            <Text style={styles.stepBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>Environ 5 jours en moyenne</Text>
      </View>

      <View style={[styles.card, styles.row]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.question}>J'essaie de concevoir</Text>
          <Text style={styles.hint}>Affiche un encart indicatif sur la fertilité</Text>
        </View>
        <Switch
          value={value.fertilityTracking}
          onValueChange={(v) => onChange({ fertilityTracking: v })}
          trackColor={{ false: base.outline, true: '#456646' }}
        />
      </View>
    </View>
  );
}
