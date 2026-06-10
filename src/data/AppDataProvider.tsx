import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { computePhase } from '../lib/cycleEngine';
import type { CyclePhaseInfo, CycleSettings, UserProfile, ViewMode } from '../types';

interface AppData {
  loading: boolean;
  profile: UserProfile | null;
  /** Mode d'affichage dérivé du profil : son cycle (primary) ou celui du partenaire. */
  viewMode: ViewMode;
  /** Phase du cycle affiché (le sien si primary, celui du partenaire lié si partner). Null si indisponible. */
  phaseInfo: CyclePhaseInfo | null;
  partnerName: string | null;
  /** True quand l'utilisateur primary n'a pas encore renseigné ses paramètres de cycle. */
  needsSetup: boolean;
  userId: string | null;
  logPeriod: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AppDataContext = createContext<AppData | null>(null);

export function useAppData(): AppData {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData doit être utilisé dans AppDataProvider');
  return ctx;
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [phaseInfo, setPhaseInfo] = useState<CyclePhaseInfo | null>(null);
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('self');

  const load = useCallback(async () => {
    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData.session?.user.id ?? null;
    setUserId(uid);
    if (!uid) {
      setProfile(null);
      setPhaseInfo(null);
      setLoading(false);
      return;
    }

    const { data: profileRow } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
    const prof: UserProfile | null = profileRow
      ? {
          id: profileRow.id,
          isPrimary: profileRow.is_primary,
          isPartner: profileRow.is_partner,
          name: profileRow.name,
          partnerLinkedId: profileRow.partner_linked_id,
          fertilityTrackingEnabled: profileRow.fertility_tracking_enabled,
          fertilityVisibleToPartner: profileRow.fertility_visible_to_partner,
          notificationPrefs: profileRow.notification_prefs,
          deactivatedAt: profileRow.deactivated_at,
        }
      : null;
    setProfile(prof);

    // Quel cycle afficher : le sien si primary, sinon celui du partenaire lié.
    // Un utilisateur primary (même s'il est aussi partner) voit d'abord son propre cycle.
    const mode: ViewMode = prof?.isPrimary ? 'self' : 'partner';
    setViewMode(mode);
    const cycleOwnerId = mode === 'partner' ? prof?.partnerLinkedId : uid;

    let info: CyclePhaseInfo | null = null;
    let needs = false;

    if (cycleOwnerId) {
      const { data: settingsRow } = await supabase
        .from('cycle_settings')
        .select('*')
        .eq('user_id', cycleOwnerId)
        .maybeSingle();

      if (settingsRow) {
        const { data: lastLog } = await supabase
          .from('period_logs')
          .select('start_date')
          .eq('user_id', cycleOwnerId)
          .order('start_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        const settings: CycleSettings = {
          lastPeriodStart: lastLog?.start_date ?? settingsRow.last_period_start,
          averageCycleLength: settingsRow.average_cycle_length,
          averagePeriodLength: settingsRow.average_period_length,
        };
        const fertility = mode === 'self' ? !!prof?.fertilityTrackingEnabled : false;
        info = computePhase(settings, new Date(), fertility);
      } else if (mode === 'self') {
        needs = true;
      }
    }

    let pName: string | null = null;
    if (prof?.partnerLinkedId) {
      const { data: partnerRow } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', prof.partnerLinkedId)
        .maybeSingle();
      pName = partnerRow?.name ?? null;
    }

    setPhaseInfo(info);
    setNeedsSetup(needs);
    setPartnerName(pName);
    setLoading(false);
  }, []);

  const logPeriod = useCallback(async () => {
    if (!userId) return;
    const today = new Date().toISOString().split('T')[0];
    await supabase.from('period_logs').insert({ user_id: userId, start_date: today });
    await load();
  }, [userId, load]);

  useEffect(() => {
    load();
  }, [load]);

  const value: AppData = {
    loading,
    profile,
    viewMode,
    phaseInfo,
    partnerName,
    needsSetup,
    userId,
    logPeriod,
    refresh: load,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
