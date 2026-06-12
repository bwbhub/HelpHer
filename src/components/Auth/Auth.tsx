import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useAuth } from './useAuth';
import { useT } from '../../i18n/LocaleProvider';
import { base, spacing } from '../../styles/theme';
import { styles } from './Auth.styles';

type AuthView = 'signin' | 'signup' | 'forgot' | 'confirm';

export default function Auth() {
  const { signIn, signUp, resendConfirmation, requestPasswordReset } = useAuth();
  const { t } = useT();
  const [view, setView] = useState<AuthView>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function go(next: AuthView) {
    setError(null);
    setInfo(null);
    setView(next);
  }

  async function run(action: () => Promise<void>) {
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }

  const handleSignIn = () => run(() => signIn(email, password));
  const handleSignUp = () =>
    run(async () => {
      const { needsConfirmation } = await signUp(email, password);
      if (needsConfirmation) go('confirm');
    });
  const handleForgot = () =>
    run(async () => {
      await requestPasswordReset(email);
      setInfo(t('auth.reset.sent', { email }));
    });
  const handleResend = () =>
    run(async () => {
      await resendConfirmation(email);
      setInfo(t('auth.confirm.resent'));
    });

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <Text style={styles.title}>Luna</Text>

        {view === 'confirm' ? (
          <>
            <Text style={styles.subtitle}>{t('auth.confirm.title')}</Text>
            <Text style={styles.label}>{t('auth.confirm.body', { email })}</Text>
            {info && <Text style={styles.error}>{info}</Text>}
            {error && <Text style={styles.error}>{error}</Text>}
            <TouchableOpacity style={styles.primaryBtn} onPress={handleResend} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>{t('auth.confirm.resend')}</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => go('signin')}>
              <Text style={styles.switchText}>{t('auth.backToSignin')}</Text>
            </TouchableOpacity>
          </>
        ) : view === 'forgot' ? (
          <>
            <Text style={styles.subtitle}>{t('auth.reset.body')}</Text>
            <Text style={styles.label}>{t('auth.emailLabel')}</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder={t('auth.emailPlaceholder')} placeholderTextColor={base.textTertiary} />
            {info && <Text style={styles.error}>{info}</Text>}
            {error && <Text style={styles.error}>{error}</Text>}
            <TouchableOpacity style={styles.primaryBtn} onPress={handleForgot} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>{t('auth.reset.send')}</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => go('signin')}>
              <Text style={styles.switchText}>{t('auth.backToSignin')}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.subtitle}>{t('auth.subtitle')}</Text>

            <Text style={styles.label}>{t('auth.emailLabel')}</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder={t('auth.emailPlaceholder')} placeholderTextColor={base.textTertiary} />

            <Text style={[styles.label, { marginTop: spacing.sm }]}>{t('auth.passwordLabel')}</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" placeholderTextColor={base.textTertiary} />

            {error && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity style={styles.primaryBtn} onPress={view === 'signin' ? handleSignIn : handleSignUp} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>{view === 'signin' ? t('auth.signIn') : t('auth.signUp')}</Text>}
            </TouchableOpacity>

            {view === 'signin' && (
              <TouchableOpacity onPress={() => go('forgot')}>
                <Text style={styles.switchText}>{t('auth.forgotPassword')}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => go(view === 'signin' ? 'signup' : 'signin')}>
              <Text style={styles.switchText}>{view === 'signin' ? t('auth.toSignup') : t('auth.toSignin')}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
