/**
 * Mode d'affichage d'un écran : son propre cycle (`self`) ou celui du
 * partenaire lié (`partner`). Dérivé du profil — ce n'est PAS un rôle stocké :
 * un utilisateur peut être à la fois isPrimary et isPartner (voir UserProfile).
 */
export type ViewMode = 'self' | 'partner';

export type CyclePhase = 'winter' | 'spring' | 'summer' | 'autumn';

export interface CyclePhaseInfo {
  phase: CyclePhase;
  dayOfCycle: number;
  cycleLength: number;
  nextPhaseInDays: number;
  fertilityWindowActive: boolean;
  fertilityDays: string[] | null;
}

/** Préférences de notification, indépendantes entre primary et partner. */
export interface NotificationPrefs {
  period_upcoming_d2: boolean;
  period_upcoming_d1: boolean;
  period_day_j: boolean;
  period_end_reminder: boolean;
}

export interface UserProfile {
  id: string;
  /** Suit son propre cycle. */
  isPrimary: boolean;
  /** Consulte le cycle d'un partenaire lié. Indépendant de isPrimary. */
  isPartner: boolean;
  name: string | null;
  partnerLinkedId: string | null;
  /** Le primary suit-il sa fenêtre de fertilité. */
  fertilityTrackingEnabled: boolean;
  /** Le primary expose-t-il sa fenêtre de fertilité au partenaire (off par défaut). */
  fertilityVisibleToPartner: boolean;
  notificationPrefs: NotificationPrefs;
  /** Soft-delete : non-null si le compte est désactivé (réactivable). */
  deactivatedAt: string | null;
}

export interface CycleSettings {
  lastPeriodStart: string;
  averageCycleLength: number;
  averagePeriodLength: number;
}

export interface PeriodLog {
  id: string;
  user_id: string;
  start_date: string;
  /** Date de fin des règles, null tant que non confirmée (repli 5 jours). */
  end_date: string | null;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  content: string;
  is_private: boolean;
  phase: CyclePhase | null;
  created_at: string;
}
