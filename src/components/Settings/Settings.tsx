import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Switch, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppData } from '../../data/AppDataProvider';
import { supabase } from '../../lib/supabase';
import { getStoredLocale, setStoredLocale, type AppLocale } from '../../i18n/locale';
import { base } from '../../styles/theme';
import type { NotificationPrefs } from '../../types';
import { styles } from './Settings.styles';

const NOTIF_LABELS: { key: keyof NotificationPrefs; label: string }[] = [
  { key: 'period_upcoming_d2', label: 'Rappel à J-2' },
  { key: 'period_upcoming_d1', label: 'Rappel à J-1' },
  { key: 'period_day_j', label: 'Le jour J' },
  { key: 'period_end_reminder', label: 'Fin des règles' },
];

const DEFAULT_PREFS: NotificationPrefs = {
  period_upcoming_d2: true,
  period_upcoming_d1: true,
  period_day_j: true,
  period_end_reminder: true,
};

export default function Settings() {
  const { profile, updateNotificationPrefs, updateFertility, deactivateAccount } = useAppData();
  const navigation = useNavigation();

  const [prefs, setPrefs] = useState<NotificationPrefs>(profile?.notificationPrefs ?? DEFAULT_PREFS);
  const [tracking, setTracking] = useState(profile?.fertilityTrackingEnabled ?? false);
  const [visible, setVisible] = useState(profile?.fertilityVisibleToPartner ?? false);
  const [locale, setLocale] = useState<AppLocale>('fr');

  useEffect(() => {
    getStoredLocale().then(setLocale);
  }, []);

  if (!profile) return null;

  function togglePref(key: keyof NotificationPrefs) {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    void updateNotificationPrefs(next);
  }

  function setTrackingValue(value: boolean) {
    setTracking(value);
    if (!value) setVisible(false);
    void updateFertility({ tracking: value, visibleToPartner: value ? visible : false });
  }

  function setVisibleValue(value: boolean) {
    setVisible(value);
    void updateFertility({ visibleToPartner: value });
  }

  function chooseLocale(value: AppLocale) {
    setLocale(value);
    void setStoredLocale(value);
  }

  function confirmDeactivate() {
    Alert.alert(
      'Supprimer mon compte',
      'Votre compte sera désactivé et vos données masquées. Vous pourrez le réactiver en vous reconnectant. Cela ne touche pas votre partenaire.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Désactiver', style: 'destructive', onPress: () => void deactivateAccount() },
      ]
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      {profile.isPrimary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cycle & fertilité</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Suivre ma fenêtre de fertilité</Text>
              <Switch value={tracking} onValueChange={setTrackingValue} trackColor={{ false: base.outline, true: '#456646' }} />
            </View>
            <View style={styles.separator} />
            <View style={styles.row}>
              <View style={styles.rowTextWrap}>
                <Text style={[styles.rowLabel, !tracking && styles.rowLabelDisabled]}>La partager avec mon partenaire</Text>
                <Text style={styles.rowHint}>Off par défaut. Sinon, votre partenaire ne voit que phase et jour.</Text>
              </View>
              <Switch value={visible} onValueChange={setVisibleValue} disabled={!tracking} trackColor={{ false: base.outline, true: '#456646' }} />
            </View>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.card}>
          {NOTIF_LABELS.map((item, i) => (
            <View key={item.key}>
              {i > 0 && <View style={styles.separator} />}
              <View style={styles.row}>
                <Text style={styles.rowLabel}>{item.label}</Text>
                <Switch
                  value={prefs[item.key]}
                  onValueChange={() => togglePref(item.key)}
                  trackColor={{ false: base.outline, true: '#456646' }}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Langue</Text>
        <View style={styles.pillRow}>
          {(['fr', 'en'] as AppLocale[]).map((l) => (
            <TouchableOpacity
              key={l}
              style={[styles.pill, locale === l && styles.pillActive]}
              onPress={() => chooseLocale(l)}
            >
              <Text style={[styles.pillText, locale === l && styles.pillTextActive]}>
                {l === 'fr' ? 'Français' : 'English'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.rowHint}>La traduction complète des écrans arrive prochainement.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compte</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('PartnerLink' as never)}>
            <Text style={styles.rowLabel}>Lien partenaire</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.row} onPress={() => void supabase.auth.signOut()}>
            <Text style={styles.rowLabel}>Se déconnecter</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.row} onPress={confirmDeactivate}>
            <Text style={[styles.rowLabel, styles.danger]}>Supprimer mon compte</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
