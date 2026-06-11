import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { computePhase, deriveCycleSettings } from '../lib/cycleEngine';
import type { CyclePhaseInfo, CycleSettings, OnboardingInput, UserProfile, ViewMode } from '../types';

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
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
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
          onboardedAt: profileRow.onboarded_at,
        }
      : null;
    setProfile(prof);
    // Un profil existe dès l'inscription (trigger) ; l'onboarding reste à faire
    // tant que onboarded_at est null.
    setNeedsOnboarding(!!prof && !prof.onboardedAt);

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
        // Historique récent pour le moteur adaptatif (assez de logs pour RECENT_CYCLES).
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
        // Se corrige depuis les dates réelles loggées, repli sur les moyennes saisies.
        const settings = deriveCycleSettings(logs ?? [], fallback);
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
    phaseInfo,
    partnerName,
    needsSetup,
    userId,
    logPeriod,
    refresh: load,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
