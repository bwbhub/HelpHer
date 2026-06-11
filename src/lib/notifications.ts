import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { CycleSettings, NotificationPrefs } from '../types';
import { predictNextPeriodStart } from './cycleEngine';

// Affiche les notifications même quand l'app est au premier plan.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** Heure locale de déclenchement des rappels. */
const HOUR_OF_DAY = 10;

interface CycleNotif {
  key: string;
  date: Date;
  title: string;
  body: string;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function atHour(date: Date, hour: number): Date {
  const d = new Date(date);
  d.setHours(hour, 0, 0, 0);
  return d;
}

/**
 * Construit la liste des rappels de cycle à venir, en respectant les préférences.
 * Fonction pure → testable et rejouable. Ne renvoie que les dates futures.
 */
export function buildCycleNotifications(
  settings: CycleSettings,
  prefs: NotificationPrefs,
  today: Date
): CycleNotif[] {
  const next = predictNextPeriodStart(settings, today);
  const items: CycleNotif[] = [];

  if (prefs.period_upcoming_d2) {
    items.push({
      key: 'd2',
      date: atHour(addDays(next, -2), HOUR_OF_DAY),
      title: 'Ton cycle approche',
      body: 'Tes prochaines règles devraient arriver dans environ 2 jours.',
    });
  }
  if (prefs.period_upcoming_d1) {
    items.push({
      key: 'd1',
      date: atHour(addDays(next, -1), HOUR_OF_DAY),
      title: 'Ton cycle approche',
      body: 'Tes prochaines règles devraient arriver demain.',
    });
  }
  if (prefs.period_day_j) {
    items.push({
      key: 'j',
      date: atHour(next, HOUR_OF_DAY),
      title: 'Premier jour ?',
      body: 'Tes règles ont commencé ? Pense à le logger.',
    });
  }
  if (prefs.period_end_reminder) {
    items.push({
      key: 'end',
      date: atHour(addDays(next, settings.averagePeriodLength), HOUR_OF_DAY),
      title: "C'est terminé ?",
      body: 'Renseigne la date de fin pour affiner tes prochains cycles.',
    });
  }

  return items.filter((i) => i.date.getTime() > today.getTime());
}

async function ensurePermissions(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false; // refusé définitivement : on ne reprompt pas
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

/**
 * Reprogramme les notifications locales du cycle depuis zéro (à appeler après
 * chaque chargement / nouveau log). Silencieux et non bloquant : une erreur de
 * notification ne doit jamais interrompre l'app.
 */
export async function syncCycleNotifications(
  settings: CycleSettings,
  prefs: NotificationPrefs,
  today: Date = new Date()
): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const items = buildCycleNotifications(settings, prefs, today);
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (items.length === 0) return;
    if (!(await ensurePermissions())) return;
    for (const item of items) {
      await Notifications.scheduleNotificationAsync({
        content: { title: item.title, body: item.body },
        trigger: { date: item.date },
      });
    }
  } catch {
    // Notifications non critiques.
  }
}

/** Annule tous les rappels (ex. déconnexion, désactivation du compte). */
export async function cancelCycleNotifications(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // ignore
  }
}
