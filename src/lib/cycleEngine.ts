import type { CyclePhase, CyclePhaseInfo, CycleSettings } from '../types';

/** Un log de règles tel que stocké : début + fin optionnelle (non confirmée). */
export interface CycleLog {
  start_date: string;
  end_date: string | null;
}

const MS_PER_DAY = 86400000;
/** Fenêtre glissante : on n'estime que sur les N derniers cycles. */
const RECENT_CYCLES = 6;
/** Bornes alignées sur les contraintes du schéma (cycle_settings). */
const CYCLE_MIN = 21;
const CYCLE_MAX = 40;
const PERIOD_MIN = 2;
const PERIOD_MAX = 10;

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function daysBetween(from: string, to: string): number {
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / MS_PER_DAY);
}

/**
 * Dérive des paramètres de cycle adaptatifs depuis l'historique réel des règles.
 * Fonction pure (pas d'I/O) : la récupération des logs se fait dans le hook de données.
 * - `lastPeriodStart` = début le plus récent loggé.
 * - `averageCycleLength` = moyenne des écarts entre débuts consécutifs (repli sur le
 *   fallback si moins de 2 débuts loggés).
 * - `averagePeriodLength` = moyenne des durées depuis les fins confirmées (repli sur le
 *   fallback — 5 j par défaut — si aucune fin confirmée).
 * `fallback` provient des moyennes saisies à l'onboarding (cycle_settings).
 */
export function deriveCycleSettings(logs: CycleLog[], fallback: CycleSettings): CycleSettings {
  const sorted = logs
    .filter((l) => l.start_date)
    .sort((a, b) => a.start_date.localeCompare(b.start_date));

  if (sorted.length === 0) return fallback;

  const lastPeriodStart = sorted[sorted.length - 1].start_date;

  let averageCycleLength = fallback.averageCycleLength;
  if (sorted.length >= 2) {
    // N+1 débuts donnent N écarts ; on ne garde que les plus récents.
    const recentStarts = sorted.slice(-(RECENT_CYCLES + 1));
    const gaps: number[] = [];
    for (let i = 1; i < recentStarts.length; i++) {
      gaps.push(daysBetween(recentStarts[i - 1].start_date, recentStarts[i].start_date));
    }
    const mean = gaps.reduce((sum, g) => sum + g, 0) / gaps.length;
    averageCycleLength = clamp(Math.round(mean), CYCLE_MIN, CYCLE_MAX);
  }

  let averagePeriodLength = fallback.averagePeriodLength;
  const durations = sorted
    .filter((l) => l.end_date)
    .slice(-RECENT_CYCLES)
    .map((l) => daysBetween(l.start_date, l.end_date as string) + 1) // inclusif : J1..Jn
    .filter((d) => d > 0);
  if (durations.length > 0) {
    const mean = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    averagePeriodLength = clamp(Math.round(mean), PERIOD_MIN, PERIOD_MAX);
  }

  return { lastPeriodStart, averageCycleLength, averagePeriodLength };
}

/**
 * Date de début des prochaines règles prédite, toujours dans le futur (ou aujourd'hui).
 * Fonction pure, utilisée pour planifier les notifications locales.
 */
export function predictNextPeriodStart(settings: CycleSettings, today: Date): Date {
  const last = new Date(settings.lastPeriodStart);
  const diffDays = Math.floor((today.getTime() - last.getTime()) / MS_PER_DAY);
  const cycleLength = settings.averageCycleLength;
  const dayOfCycle = ((diffDays % cycleLength) + cycleLength) % cycleLength;
  const daysUntilNext = cycleLength - dayOfCycle; // 1..cycleLength (jamais 0 : aujourd'hui = J1)
  const next = new Date(today);
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() + daysUntilNext);
  return next;
}

export function computePhase(
  settings: CycleSettings,
  today: Date,
  fertilityTrackingEnabled: boolean
): CyclePhaseInfo {
  const lastPeriod = new Date(settings.lastPeriodStart);
  const diffDays = Math.floor((today.getTime() - lastPeriod.getTime()) / 86400000);
  const { cycleLength, periodLength } = {
    cycleLength: settings.averageCycleLength,
    periodLength: settings.averagePeriodLength,
  };

  const dayOfCycle = ((diffDays % cycleLength) + cycleLength) % cycleLength;
  const displayDay = dayOfCycle + 1;

  const ovulationDay = cycleLength - 14;
  const ovulationEnd = ovulationDay + 3;

  let phase: CyclePhase;
  let phaseEnd: number;

  if (dayOfCycle < periodLength) {
    phase = 'winter';
    phaseEnd = periodLength;
  } else if (dayOfCycle < ovulationDay) {
    phase = 'spring';
    phaseEnd = ovulationDay;
  } else if (dayOfCycle < ovulationEnd) {
    phase = 'summer';
    phaseEnd = ovulationEnd;
  } else {
    phase = 'autumn';
    phaseEnd = cycleLength;
  }

  const nextPhaseInDays = phaseEnd - dayOfCycle;

  let fertilityWindowActive = false;
  let fertilityDays: string[] | null = null;

  if (fertilityTrackingEnabled) {
    const windowStart = ovulationDay - 5;
    const windowEnd = ovulationDay + 1;
    fertilityWindowActive = dayOfCycle >= windowStart && dayOfCycle <= windowEnd;
    fertilityDays = Array.from({ length: windowEnd - windowStart + 1 }, (_, i) => {
      const d = new Date(lastPeriod);
      d.setDate(d.getDate() + windowStart + i);
      return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    });
  }

  return { phase, dayOfCycle: displayDay, cycleLength, nextPhaseInDays, fertilityWindowActive, fertilityDays };
}
