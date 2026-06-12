import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppData } from '../../data/AppDataProvider';
import { useT } from '../../i18n/LocaleProvider';
import { supabase } from '../../lib/supabase';
import { typography, spacing, radius, base } from '../../styles/theme';

/** Écran présenté à la reconnexion d'un compte désactivé (soft-delete). */
export default function Reactivate() {
  const { reactivateAccount } = useAppData();
  const { t } = useT();
  const [busy, setBusy] = useState(false);

  async function handleReactivate() {
    setBusy(true);
    try {
      await reactivateAccount();
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('reactivate.title')}</Text>
      <Text style={styles.body}>{t('reactivate.body')}</Text>
      <TouchableOpacity
        style={[styles.primaryBtn, busy && styles.disabled]}
        onPress={handleReactivate}
        disabled={busy}
      >
        <Text style={styles.primaryBtnText}>{busy ? t('reactivate.reactivating') : t('reactivate.reactivate')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryBtn} onPress={() => void supabase.auth.signOut()}>
        <Text style={styles.secondaryBtnText}>{t('reactivate.logout')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: base.background, padding: spacing.md, justifyContent: 'center', gap: spacing.sm },
  title: { ...typography.headlineLg, color: base.textPrimary },
  body: { ...typography.bodyMd, color: base.textSecondary, marginBottom: spacing.sm },
  primaryBtn: { backgroundColor: base.textPrimary, borderRadius: radius.full, paddingVertical: 16, alignItems: 'center' },
  primaryBtnText: { ...typography.labelMd, color: '#fff' },
  secondaryBtn: { paddingVertical: 14, alignItems: 'center' },
  secondaryBtnText: { ...typography.labelMd, color: base.textSecondary },
  disabled: { opacity: 0.5 },
});
