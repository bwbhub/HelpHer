import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useAppData } from '../../data/AppDataProvider';
import { useT } from '../../i18n/LocaleProvider';
import ProgressDots from './ProgressDots';
import RoleStep from './RoleStep';
import CycleStep, { CycleDraft } from './CycleStep';
import PartnerStep from './PartnerStep';
import { styles } from './Onboarding.styles';

export type RoleChoice = 'self' | 'partner' | 'both';

type StepId = 'role' | 'cycle' | 'partner';

const todayISO = () => new Date().toISOString().split('T')[0];

/**
 * Orchestrateur d'onboarding : gère l'index d'étape local, le branchement
 * conditionnel selon le rôle, et l'écriture finale en base (via le contexte).
 */
export default function Onboarding() {
  const { completeOnboarding } = useAppData();
  const { t } = useT();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [role, setRole] = useState<RoleChoice | null>(null);
  const [name, setName] = useState('');
  const [cycle, setCycle] = useState<CycleDraft>({
    lastPeriodStart: todayISO(),
    averageCycleLength: 28,
    averagePeriodLength: 5,
    fertilityTracking: false,
  });

  const isPrimary = role === 'self' || role === 'both';
  const isPartner = role === 'partner' || role === 'both';

  // Le parcours dépend du rôle : un partner seul saute l'étape cycle.
  const steps: StepId[] = useMemo(() => {
    const s: StepId[] = ['role'];
    if (isPrimary) s.push('cycle');
    if (isPartner) s.push('partner');
    return s;
  }, [isPrimary, isPartner]);

  const safeStep = Math.min(step, steps.length - 1);
  const current = steps[safeStep];
  const isLast = safeStep >= steps.length - 1;

  const canContinue =
    current === 'role' ? role !== null
    : current === 'partner' ? name.trim().length > 0
    : true;

  async function handleNext() {
    if (!canContinue || submitting) return;
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }
    setSubmitting(true);
    try {
      await completeOnboarding({
        isPrimary,
        isPartner,
        name: name.trim() || null,
        cycle: isPrimary ? cycle : null,
      });
      // Plus de reset nécessaire : le rafraîchissement bascule vers les onglets.
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.inner}
      keyboardShouldPersistTaps="handled"
    >
      <ProgressDots total={steps.length} current={safeStep} />

      {current === 'role' && <RoleStep value={role} onSelect={setRole} />}
      {current === 'cycle' && (
        <CycleStep value={cycle} onChange={(patch) => setCycle((c) => ({ ...c, ...patch }))} />
      )}
      {current === 'partner' && <PartnerStep name={name} onChangeName={setName} />}

      <View style={styles.footer}>
        {safeStep > 0 && (
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep((s) => Math.max(0, s - 1))}>
            <Text style={styles.backBtnText}>{t('onboarding.back')}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.primaryBtn, (!canContinue || submitting) && styles.primaryBtnDisabled]}
          onPress={handleNext}
          disabled={!canContinue || submitting}
        >
          <Text style={styles.primaryBtnText}>
            {isLast ? (submitting ? t('onboarding.finishing') : t('onboarding.finish')) : t('onboarding.continue')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
