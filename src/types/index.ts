export type UserRole = 'primary' | 'partner';

export type CyclePhase = 'winter' | 'spring' | 'summer' | 'autumn';

export interface CyclePhaseInfo {
  phase: CyclePhase;
  dayOfCycle: number;
  cycleLength: number;
  nextPhaseInDays: number;
  fertilityWindowActive: boolean;
  fertilityDays: string[] | null;
}

export interface UserProfile {
  id: string;
  role: UserRole;
  name: string | null;
  partnerLinkedId: string | null;
  fertilityTrackingEnabled: boolean;
}

export interface CycleSettings {
  lastPeriodStart: string;
  averageCycleLength: number;
  averagePeriodLength: number;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  content: string;
  is_private: boolean;
  phase: CyclePhase | null;
  created_at: string;
}
