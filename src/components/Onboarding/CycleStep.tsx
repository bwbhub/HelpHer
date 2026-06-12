import React from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import Calendar from '../Calendar/Calendar';
import { useT } from '../../i18n/LocaleProvider';
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
  const { t } = useT();
  return (
    <View style={{ gap: 16 }}>
      <Text style={styles.title}>{t('onboarding.cycle.title')}</Text>
      <Text style={styles.subtitle}>{t('onboarding.cycle.subtitle')}</Text>

      <Text style={styles.question}>{t('onboarding.cycle.lastPeriodQ')}</Text>
      <Calendar value={value.lastPeriodStart} onChange={(iso) => onChange({ lastPeriodStart: iso })} />

      <View style={styles.card}>
        <Text style={styles.question}>{t('onboarding.cycle.cycleLengthQ')}</Text>
        <View style={styles.stepper}>
          <TouchableOpacity
            onPress={() => onChange({ averageCycleLength: Math.max(21, value.averageCycleLength - 1) })}
            style={styles.stepBtn}
          >
            <Text style={styles.stepBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.stepValue}>{t('common.days', { n: value.averageCycleLength })}</Text>
          <TouchableOpacity
            onPress={() => onChange({ averageCycleLength: Math.min(40, value.averageCycleLength + 1) })}
            style={styles.stepBtn}
          >
            <Text style={styles.stepBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>{t('onboarding.cycle.cycleHint')}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.question}>{t('onboarding.cycle.periodLengthQ')}</Text>
        <View style={styles.stepper}>
          <TouchableOpacity
            onPress={() => onChange({ averagePeriodLength: Math.max(2, value.averagePeriodLength - 1) })}
            style={styles.stepBtn}
          >
            <Text style={styles.stepBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.stepValue}>{t('common.days', { n: value.averagePeriodLength })}</Text>
          <TouchableOpacity
            onPress={() => onChange({ averagePeriodLength: Math.min(10, value.averagePeriodLength + 1) })}
            style={styles.stepBtn}
          >
            <Text style={styles.stepBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>{t('onboarding.cycle.periodHint')}</Text>
      </View>

      <View style={[styles.card, styles.row]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.question}>{t('onboarding.cycle.fertilityQ')}</Text>
          <Text style={styles.hint}>{t('onboarding.cycle.fertilityHint')}</Text>
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
