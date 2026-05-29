import type { CyclePhase, CyclePhaseInfo, CycleSettings } from '../types';

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
