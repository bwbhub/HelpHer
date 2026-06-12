import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { computePhase, deriveCycleSettings } from '../lib/cycleEngine';
import { syncCycleNotifications, cancelCycleNotifications } from '../lib/notifications';
import {
  loadCache,
  saveCache,
  clearCache,
  queuePeriodLog,
  getQueuedPeriodLogs,
  clearQueuedPeriodLogs,
} from '../lib/offlineCache';
import type {
  CyclePhaseInfo,
  CycleSettings,
  NotificationPrefs,
  OnboardingInput,
  UserProfile,
  ViewMode,
} from '../types';

interface AppData {
  loading: boolean;
  profile: UserProfile | null;
  /** Mode d'affichage dérivé du profil : son cycle (primary) ou celui du partenaire. */
  viewMode: ViewMode;
  /** Vrai tant que l'utilisateur connecté n'a pas terminé l'onboarding. */
  needsOnboarding: boolean;
  /** Persiste le résultat de l'onboarding (profil + cycle) et rafraîchit. */
  completeOnboarding: (input: OnboardingInput) => Promise<void>;
  /** Récupère un code de liaison actif déjà généré, ou null. */
  fetchActivePartnerCode: () => Promise<string | null>;
  /** Génère un nouveau code de liaison et le renvoie. */
  generatePartnerCode: () => Promise<string>;
  /** Consomme un code : pose le lien mutuel des deux côtés. Throw si invalide. */
  redeemPartnerCode: (code: string) => Promise<void>;
  /** Délie le partenaire (unilatéral, immédiat des deux côtés). */
  unlinkPartner: () => Promise<void>;
  /** Met à jour les préférences de notification. */
  updateNotificationPrefs: (prefs: NotificationPrefs) => Promise<void>;
  /** Met à jour le suivi / la visibilité de la fenêtre de fertilité. */
  updateFertility: (opts: { tracking?: boolean; visibleToPartner?: boolean }) => Promise<void>;
  /** Vrai si le compte connecté est désactivé (soft-delete) et attend réactivation. */
  isDeactivated: boolean;
  /** Soft-delete : désactive + anonymise (name null), unlink, déconnecte. Réactivable. */
  deactivateAccount: () => Promise<void>;
  /** Hard-delete : suppression définitive via l'Edge Function, puis déconnexion. */
  deleteAccount: () => Promise<void>;
  /** Réactive un compte soft-deleted (efface deactivated_at). */
  reactivateAccount: () => Promise<void>;
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

/** Instantané sérialisable des données de cycle, pour le cache de lecture offline. */
interface Snapshot {
  profile: UserProfile;
  settings: CycleSettings | null;
  fertility: boolean;
  viewMode: ViewMode;
  partnerName: string | null;
  needsSetup: boolean;
  needsOnboarding: boolean;
}

/** Rejoue les logs de règles mis en file hors-ligne, en évitant les doublons. */
async function flushPeriodLogQueue(userId: string): Promise<void> {
  const queued = await getQueuedPeriodLogs(userId);
  if (queued.length === 0) return;
  const { data: existing, error } = await supabase
    .from('period_logs')
    .select('start_date')
    .eq('user_id', userId)
    .in('start_date', queued);
  if (error) return; // toujours hors-ligne : on réessaiera au prochain load
  const have = new Set((existing ?? []).map((r) => r.start_date));
  for (const date of queued) {
    if (have.has(date)) continue;
    const { error: insErr } = await supabase.from('period_logs').insert({ user_id: userId, start_date: date });
    if (insErr) return; // encore hors-ligne : garder la file
  }
  await clearQueuedPeriodLogs(userId);
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [phaseInfo, setPhaseInfo] = useState<CyclePhaseInfo | null>(null);
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('self');

  // Applique un instantané (réseau ou cache) à l'état + recalcule la phase pour
  // aujourd'hui (le cache ne stocke pas phaseInfo, qui dépend de la date du jour).
  const applySnapshot = useCallback((s: Snapshot) => {
    setProfile(s.profile);
    setViewMode(s.viewMode);
    setPartnerName(s.partnerName);
    setNeedsSetup(s.needsSetup);
    setNeedsOnboarding(s.needsOnboarding);
    setPhaseInfo(s.settings ? computePhase(s.settings, new Date(), s.fertility) : null);
    if (s.viewMode === 'self' && s.settings && s.profile.notificationPrefs) {
      void syncCycleNotifications(s.settings, s.profile.notificationPrefs);
    }
  }, []);

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

    // 1. Cache : affichage immédiat de la phase, même hors-ligne.
    const cached = await loadCache<Snapshot>(uid);
    if (cached) {
      applySnapshot(cached);
      setLoading(false);
    }

    // 2. Rejoue les logs de règles faits hors-ligne.
    await flushPeriodLogQueue(uid);

    // 3. Re-fetch réseau. En cas d'échec (hors-ligne), on conserve le cache.
    const { data: profileRow, error: profileErr } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
    if (profileErr || !profileRow) {
      setLoading(false);
      return;
    }

    const prof: UserProfile = {
      id: profileRow.id,
      isPrimary: profileRow.is_primary,
      isPartner: profileRow.is_partner,
      name: profileRow.name,
      partnerLinkedId: profileRow.partner_linked_id,
      fertilityTrackingEnabled: profileRow.fertility_tracking_enabled,
      fertilityVisibleToPartner: profileRow.fertility_visible_to_partner,
      notificationPrefs: profileRow.notification_prefs,
      deactivatedAt: profileRow.deactivated_at,
      onboardedAt: profileRow.onboarded_at,
    };

    // Le sien si primary (même s'il est aussi partner), sinon celui du partenaire lié.
    const mode: ViewMode = prof.isPrimary ? 'self' : 'partner';
    const cycleOwnerId = mode === 'partner' ? prof.partnerLinkedId : uid;

    let settings: CycleSettings | null = null;
    let fertility = false;
    let needs = false;

    if (cycleOwnerId) {
      const { data: settingsRow } = await supabase
        .from('cycle_settings')
        .select('*')
        .eq('user_id', cycleOwnerId)
        .maybeSingle();

      if (settingsRow) {
        const { data: logs } = await supabase
          .from('period_logs')
          .select('start_date, end_date')
          .eq('user_id', cycleOwnerId)
          .order('start_date', { ascending: false })
          .limit(12);

        const fallback: CycleSettings = {
          lastPeriodStart: settingsRow.last_period_start,
          averageCycleLength: settingsRow.average_cycle_length,
          averagePeriodLength: settingsRow.average_period_length,
        };
        settings = deriveCycleSettings(logs ?? [], fallback);
        fertility = mode === 'self' ? !!prof.fertilityTrackingEnabled : false;
      } else if (mode === 'self') {
        needs = true;
      }
    }

    let pName: string | null = null;
    if (prof.partnerLinkedId) {
      const { data: partnerRow } = await supabase.from('profiles').select('name').eq('id', prof.partnerLinkedId).maybeSingle();
      pName = partnerRow?.name ?? null;
    }

    const snapshot: Snapshot = {
      profile: prof,
      settings,
      fertility,
      viewMode: mode,
      partnerName: pName,
      needsSetup: needs,
      needsOnboarding: !prof.onboardedAt,
    };
    applySnapshot(snapshot);
    await saveCache(uid, snapshot);
    setLoading(false);
  }, [applySnapshot]);

  const logPeriod = useCallback(async () => {
    if (!userId) return;
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase.from('period_logs').insert({ user_id: userId, start_date: today });
    if (error) {
      // Hors-ligne : mise en file + mise à jour optimiste depuis le cache.
      await queuePeriodLog(userId, today);
      const cached = await loadCache<Snapshot>(userId);
      if (cached?.settings) {
        const updated: Snapshot = {
          ...cached,
          settings: { ...cached.settings, lastPeriodStart: today },
          needsSetup: false,
        };
        applySnapshot(updated);
        await saveCache(userId, updated);
      }
      return;
    }
    await load();
  }, [userId, load, applySnapshot]);

  const completeOnboarding = useCallback(
    async (input: OnboardingInput) => {
      if (!userId) return;
      await supabase
        .from('profiles')
        .update({
          is_primary: input.isPrimary,
          is_partner: input.isPartner,
          name: input.name,
          fertility_tracking_enabled: input.cycle?.fertilityTracking ?? false,
          onboarded_at: new Date().toISOString(),
        })
        .eq('id', userId);

      // Le primary renseigne son cycle ; on amorce le 1er log de règles.
      if (input.cycle) {
        await supabase.from('cycle_settings').upsert({
          user_id: userId,
          last_period_start: input.cycle.lastPeriodStart,
          average_cycle_length: input.cycle.averageCycleLength,
          average_period_length: input.cycle.averagePeriodLength,
        });
        await supabase
          .from('period_logs')
          .insert({ user_id: userId, start_date: input.cycle.lastPeriodStart });
      }
      await load();
    },
    [userId, load]
  );

  const fetchActivePartnerCode = useCallback(async (): Promise<string | null> => {
    if (!userId) return null;
    const { data } = await supabase
      .from('partner_links')
      .select('code')
      .eq('created_by', userId)
      .is('consumed_by', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    return data?.code ?? null;
  }, [userId]);

  const generatePartnerCode = useCallback(async (): Promise<string> => {
    if (!userId) throw new Error('Session expirée');
    const { data, error } = await supabase
      .from('partner_links')
      .insert({ created_by: userId })
      .select('code')
      .single();
    if (error) throw new Error(error.message);
    return data.code as string;
  }, [userId]);

  const redeemPartnerCode = useCallback(
    async (code: string) => {
      const { error } = await supabase.rpc('redeem_partner_code', { p_code: code.trim() });
      if (error) throw new Error(error.message);
      await load();
    },
    [load]
  );

  const unlinkPartner = useCallback(async () => {
    const { error } = await supabase.rpc('unlink_partner');
    if (error) throw new Error(error.message);
    await load();
  }, [load]);

  const updateNotificationPrefs = useCallback(
    async (prefs: NotificationPrefs) => {
      if (!userId) return;
      await supabase.from('profiles').update({ notification_prefs: prefs }).eq('id', userId);
      await load();
    },
    [userId, load]
  );

  const updateFertility = useCallback(
    async (opts: { tracking?: boolean; visibleToPartner?: boolean }) => {
      if (!userId) return;
      const columns: Record<string, boolean> = {};
      if (opts.tracking !== undefined) columns.fertility_tracking_enabled = opts.tracking;
      if (opts.visibleToPartner !== undefined) columns.fertility_visible_to_partner = opts.visibleToPartner;
      if (Object.keys(columns).length === 0) return;
      await supabase.from('profiles').update(columns).eq('id', userId);
      await load();
    },
    [userId, load]
  );

  const deactivateAccount = useCallback(async () => {
    if (!userId) return;
    await supabase.rpc('unlink_partner'); // unlink mutuel, sans toucher au partenaire
    await supabase
      .from('profiles')
      .update({ deactivated_at: new Date().toISOString(), name: null })
      .eq('id', userId);
    await cancelCycleNotifications();
    await clearCache(userId);
    await supabase.auth.signOut();
  }, [userId]);

  const deleteAccount = useCallback(async () => {
    // Le hard-delete exige les droits admin : délégué à l'Edge Function delete-account.
    const { error } = await supabase.functions.invoke('delete-account', { body: { mode: 'hard' } });
    if (error) throw new Error(error.message);
    await cancelCycleNotifications();
    if (userId) await clearCache(userId);
    await supabase.auth.signOut();
  }, [userId]);

  const reactivateAccount = useCallback(async () => {
    if (!userId) return;
    await supabase.from('profiles').update({ deactivated_at: null }).eq('id', userId);
    await load();
  }, [userId, load]);

  useEffect(() => {
    load();
  }, [load]);

  const value: AppData = {
    loading,
    profile,
    viewMode,
    needsOnboarding,
    completeOnboarding,
    fetchActivePartnerCode,
    generatePartnerCode,
    redeemPartnerCode,
    unlinkPartner,
    updateNotificationPrefs,
    updateFertility,
    isDeactivated: !!profile?.deactivatedAt,
    deactivateAccount,
    deleteAccount,
    reactivateAccount,
    phaseInfo,
    partnerName,
    needsSetup,
    userId,
    logPeriod,
    refresh: load,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
