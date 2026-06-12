import { useEffect, useState } from 'react';
import { Linking } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

/** Lien de redirection (deep link) pour la réinitialisation de mot de passe. */
const RESET_REDIRECT = 'luna://reset-password';

/** Extrait les paramètres du fragment (#...) d'une URL de deep link. */
function getHashParams(url: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  const hash = url?.split('#')[1];
  if (!hash) return out;
  for (const pair of hash.split('&')) {
    const [key, value] = pair.split('=');
    if (key) out[decodeURIComponent(key)] = decodeURIComponent(value ?? '');
  }
  return out;
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [recoveryMode, setRecoveryMode] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'PASSWORD_RECOVERY') setRecoveryMode(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Deep link de réinitialisation : établit la session de récupération depuis l'URL.
  useEffect(() => {
    async function handleUrl(url: string | null) {
      const params = getHashParams(url);
      if (params.type === 'recovery' && params.access_token && params.refresh_token) {
        await supabase.auth.setSession({ access_token: params.access_token, refresh_token: params.refresh_token });
        setRecoveryMode(true);
      }
    }
    Linking.getInitialURL().then(handleUrl);
    const sub = Linking.addEventListener('url', (e) => handleUrl(e.url));
    return () => sub.remove();
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  /** Renvoie needsConfirmation=true si aucune session n'est ouverte (confirmation requise). */
  async function signUp(email: string, password: string): Promise<{ needsConfirmation: boolean }> {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return { needsConfirmation: !data.session };
  }

  async function resendConfirmation(email: string) {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw error;
  }

  async function requestPasswordReset(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: RESET_REDIRECT });
    if (error) throw error;
  }

  async function updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    setRecoveryMode(false);
  }

  /** Annule la récupération en cours (et déconnecte la session temporaire). */
  async function exitRecovery() {
    setRecoveryMode(false);
    await supabase.auth.signOut();
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  return {
    session,
    loading,
    recoveryMode,
    signIn,
    signUp,
    resendConfirmation,
    requestPasswordReset,
    updatePassword,
    exitRecovery,
    signOut,
  };
}
