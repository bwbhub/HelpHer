import React, { useState } from 'react';
import { ScrollView, View, Text, Switch, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppData } from '../../data/AppDataProvider';
import { useT } from '../../i18n/LocaleProvider';
import { supabase } from '../../lib/supabase';
import type { AppLocale } from '../../i18n/locale';
import { base } from '../../styles/theme';
import type { NotificationPrefs } from '../../types';
import { styles } from './Settings.styles';

const NOTIF_KEYS: { key: keyof NotificationPrefs; labelKey: string }[] = [
  { key: 'period_upcoming_d2', labelKey: 'settings.notif.d2' },
  { key: 'period_upcoming_d1', labelKey: 'settings.notif.d1' },
  { key: 'period_day_j', labelKey: 'settings.notif.dayJ' },
  { key: 'period_end_reminder', labelKey: 'settings.notif.end' },
];

const DEFAULT_PREFS: NotificationPrefs = {
  period_upcoming_d2: true,
  period_upcoming_d1: true,
  period_day_j: true,
  period_end_reminder: true,
};

export default function Settings() {
  const { profile, updateNotificationPrefs, updateFertility, deactivateAccount, deleteAccount } = useAppData();
  const { t, locale, setLocale } = useT();
  const navigation = useNavigation();

  const [prefs, setPrefs] = useState<NotificationPrefs>(profile?.notificationPrefs ?? DEFAULT_PREFS);
  const [tracking, setTracking] = useState(profile?.fertilityTrackingEnabled ?? false);
  const [visible, setVisible] = useState(profile?.fertilityVisibleToPartner ?? false);

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

  function confirmDeactivate() {
    Alert.alert(t('settings.deactivateConfirm.title'), t('settings.deactivateConfirm.message'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('settings.deactivateConfirm.confirm'), style: 'destructive', onPress: () => void deactivateAccount() },
    ]);
  }

  function confirmDelete() {
    Alert.alert(t('settings.deleteConfirm.title'), t('settings.deleteConfirm.message'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.deleteConfirm.confirm'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAccount();
          } catch (e) {
            Alert.alert(t('settings.deleteError'), e instanceof Error ? e.message : t('common.error'));
          }
        },
      },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      {profile.isPrimary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.fertilitySection')}</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{t('settings.fertilityTrack')}</Text>
              <Switch value={tracking} onValueChange={setTrackingValue} trackColor={{ false: base.outline, true: '#456646' }} />
            </View>
            <View style={styles.separator} />
            <View style={styles.row}>
              <View style={styles.rowTextWrap}>
                <Text style={[styles.rowLabel, !tracking && styles.rowLabelDisabled]}>{t('settings.fertilityShare')}</Text>
                <Text style={styles.rowHint}>{t('settings.fertilityShareHint')}</Text>
              </View>
              <Switch value={visible} onValueChange={setVisibleValue} disabled={!tracking} trackColor={{ false: base.outline, true: '#456646' }} />
            </View>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.notificationsSection')}</Text>
        <View style={styles.card}>
          {NOTIF_KEYS.map((item, i) => (
            <View key={item.key}>
              {i > 0 && <View style={styles.separator} />}
              <View style={styles.row}>
                <Text style={styles.rowLabel}>{t(item.labelKey)}</Text>
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
        <Text style={styles.sectionTitle}>{t('settings.languageSection')}</Text>
        <View style={styles.pillRow}>
          {(['fr', 'en'] as AppLocale[]).map((l) => (
            <TouchableOpacity key={l} style={[styles.pill, locale === l && styles.pillActive]} onPress={() => setLocale(l)}>
              <Text style={[styles.pillText, locale === l && styles.pillTextActive]}>{l === 'fr' ? 'Français' : 'English'}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.rowHint}>{t('settings.languageHint')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.accountSection')}</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('PartnerLink' as never)}>
            <Text style={styles.rowLabel}>{t('settings.partnerLink')}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.row} onPress={() => void supabase.auth.signOut()}>
            <Text style={styles.rowLabel}>{t('settings.logout')}</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.row} onPress={confirmDeactivate}>
            <Text style={styles.rowLabel}>{t('settings.deactivate')}</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.row} onPress={confirmDelete}>
            <Text style={[styles.rowLabel, styles.danger]}>{t('settings.delete')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
