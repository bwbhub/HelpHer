import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useT } from '../../i18n/LocaleProvider';
import { typography, spacing, radius, base } from '../../styles/theme';

interface Props {
  onSubmit: (password: string) => Promise<void>;
  onCancel: () => void;
}

/** Écran « nouveau mot de passe », présenté pendant une récupération (deep link). */
export default function UpdatePassword({ onSubmit, onCancel }: Props) {
  const { t } = useT();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tooShort = password.length < 6;

  async function handleSubmit() {
    if (tooShort) return;
    setError(null);
    setLoading(true);
    try {
      await onSubmit(password);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('auth.update.title')}</Text>
      <Text style={styles.body}>{t('auth.update.subtitle')}</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder={t('auth.update.placeholder')}
        placeholderTextColor={base.textTertiary}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <TouchableOpacity style={[styles.primaryBtn, (loading || tooShort) && styles.disabled]} onPress={handleSubmit} disabled={loading || tooShort}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>{t('auth.update.submit')}</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryBtn} onPress={onCancel}>
        <Text style={styles.secondaryBtnText}>{t('common.cancel')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: base.background, padding: spacing.md, justifyContent: 'center', gap: spacing.sm },
  title: { ...typography.headlineLg, color: base.textPrimary },
  body: { ...typography.bodyMd, color: base.textSecondary, marginBottom: spacing.sm },
  input: {
    backgroundColor: base.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 14,
    ...typography.bodyMd,
    color: base.textPrimary,
  },
  error: { ...typography.bodyMd, color: base.error },
  primaryBtn: { backgroundColor: base.textPrimary, borderRadius: radius.full, paddingVertical: 16, alignItems: 'center' },
  primaryBtnText: { ...typography.labelMd, color: '#fff' },
  secondaryBtn: { paddingVertical: 14, alignItems: 'center' },
  secondaryBtnText: { ...typography.labelMd, color: base.textSecondary },
  disabled: { opacity: 0.5 },
});
