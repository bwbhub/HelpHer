import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { computePhase } from '../lib/cycleEngine';
import type { CyclePhaseInfo, CycleSettings } from '../types';

// Mock data so the app runs before Supabase is wired up
const MOCK_SETTINGS: CycleSettings = {
  lastPeriodStart: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
  averageCycleLength: 28,
  averagePeriodLength: 5,
};

export function useCycle(userId: string | undefined) {
  const [settings, setSettings] = useState<CycleSettings | null>(null);
  const [phaseInfo, setPhaseInfo] = useState<CyclePhaseInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('cycle_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const resolved: CycleSettings = data
      ? { lastPeriodStart: data.last_period_start, averageCycleLength: data.average_cycle_length, averagePeriodLength: data.average_period_length }
      : MOCK_SETTINGS;

    const { data: profile } = await supabase
      .from('profiles')
      .select('fertility_tracking_enabled')
      .eq('id', userId)
      .maybeSingle();

    setSettings(resolved);
    setPhaseInfo(computePhase(resolved, new Date(), profile?.fertility_tracking_enabled ?? false));
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  async function saveSettings(next: CycleSettings & { fertilityTracking: boolean }) {
    if (!userId) return;
    await supabase.from('cycle_settings').upsert({
      user_id: userId,
      last_period_start: next.lastPeriodStart,
      average_cycle_length: next.averageCycleLength,
      average_period_length: next.averagePeriodLength,
    });
    await supabase.from('profiles').update({ fertility_tracking_enabled: next.fertilityTracking }).eq('id', userId);
    await fetchSettings();
  }

  async function logPeriodStart(date?: string) {
    if (!userId) return;
    const periodDate = date ?? new Date().toISOString().split('T')[0];
    await supabase.from('period_logs').insert({ user_id: userId, start_date: periodDate });
    await supabase.from('cycle_settings').upsert({ user_id: userId, last_period_start: periodDate });
    await fetchSettings();
  }

  return { phaseInfo, settings, loading, saveSettings, logPeriodStart };
}
