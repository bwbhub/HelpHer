import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useAuth } from './useAuth';
import { useT } from '../../i18n/LocaleProvider';
import { base, spacing } from '../../styles/theme';
import { styles } from './Auth.styles';

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const { t } = useT();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      mode === 'signin' ? await signIn(email, password) : await signUp(email, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <Text style={styles.title}>Luna</Text>
        <Text style={styles.subtitle}>{t('auth.subtitle')}</Text>

        <Text style={styles.label}>{t('auth.emailLabel')}</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder={t('auth.emailPlaceholder')} placeholderTextColor={base.textTertiary} />

        <Text style={[styles.label, { marginTop: spacing.sm }]}>{t('auth.passwordLabel')}</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" placeholderTextColor={base.textTertiary} />

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>{mode === 'signin' ? t('auth.signIn') : t('auth.signUp')}</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
          <Text style={styles.switchText}>{mode === 'signin' ? t('auth.toSignup') : t('auth.toSignin')}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

