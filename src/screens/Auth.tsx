import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { typography, spacing, radius, base } from '../styles/theme';

export default function Auth() {
  const { signIn, signUp } = useAuth();
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
      setError(e instanceof Error ? e.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <Text style={styles.title}>Luna</Text>
        <Text style={styles.subtitle}>Votre compagne de cycle, bienveillante et intuitive.</Text>

        <Text style={styles.label}>Adresse e-mail</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="vous@exemple.com" placeholderTextColor={base.textTertiary} />

        <Text style={[styles.label, { marginTop: spacing.sm }]}>Mot de passe</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" placeholderTextColor={base.textTertiary} />

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>{mode === 'signin' ? 'Se connecter' : 'Créer un compte'}</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
          <Text style={styles.switchText}>{mode === 'signin' ? "Pas encore de compte ?" : 'Déjà un compte ?'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: base.background },
  inner: { flex: 1, paddingHorizontal: spacing.md, justifyContent: 'center', gap: spacing.xs },
  title: { ...typography.displayLg, color: base.textPrimary, textAlign: 'center', marginBottom: spacing.xs },
  subtitle: { ...typography.bodyMd, color: base.textSecondary, textAlign: 'center', marginBottom: spacing.lg },
  label: { ...typography.labelSm, color: base.textTertiary },
  input: { backgroundColor: base.surface, borderRadius: radius.md, paddingHorizontal: spacing.sm, paddingVertical: 14, ...typography.bodyMd, color: base.textPrimary },
  error: { ...typography.labelMd, color: base.error },
  primaryBtn: { backgroundColor: base.textPrimary, borderRadius: radius.full, paddingVertical: 16, alignItems: 'center', marginTop: spacing.sm },
  primaryBtnText: { ...typography.labelMd, color: '#fff' },
  switchText: { ...typography.bodyMd, color: base.textSecondary, textAlign: 'center', marginTop: spacing.sm },
});
