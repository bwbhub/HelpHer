import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAppData } from '../../data/AppDataProvider';
import { base } from '../../styles/theme';
import { styles } from './PartnerLink.styles';

/**
 * Flux de liaison partenaire : génération/partage d'un code, saisie d'un code
 * reçu (lien mutuel), et déliaison unilatérale. S'appuie sur les RPC Supabase.
 */
export default function PartnerLink() {
  const {
    profile,
    partnerName,
    fetchActivePartnerCode,
    generatePartnerCode,
    redeemPartnerCode,
    unlinkPartner,
  } = useAppData();

  const linked = !!profile?.partnerLinkedId;

  const [code, setCode] = useState<string | null>(null);
  const [loadingCode, setLoadingCode] = useState(true);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (linked) {
      setLoadingCode(false);
      return;
    }
    fetchActivePartnerCode()
      .then((c) => active && setCode(c))
      .finally(() => active && setLoadingCode(false));
    return () => {
      active = false;
    };
  }, [linked, fetchActivePartnerCode]);

  async function handleGenerate() {
    setBusy(true);
    setError(null);
    try {
      setCode(await generatePartnerCode());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de générer un code');
    } finally {
      setBusy(false);
    }
  }

  async function handleRedeem() {
    if (input.trim().length === 0 || busy) return;
    setBusy(true);
    setError(null);
    try {
      await redeemPartnerCode(input);
      // Le rafraîchissement bascule l'écran vers l'état « lié ».
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Code invalide');
    } finally {
      setBusy(false);
    }
  }

  function confirmUnlink() {
    Alert.alert(
      'Délier le partenaire',
      'Vous ne verrez plus vos cycles respectifs. Vous pourrez vous relier à tout moment.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Délier',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              await unlinkPartner();
            } finally {
              setBusy(false);
            }
          },
        },
      ]
    );
  }

  if (linked) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
        <Text style={styles.title}>Vous êtes lié·e</Text>
        <Text style={styles.subtitle}>
          Connecté·e à {partnerName ?? 'votre partenaire'}. Vous voyez la phase et le jour de son cycle.
        </Text>
        <TouchableOpacity style={[styles.dangerBtn, busy && styles.btnDisabled]} onPress={confirmUnlink} disabled={busy}>
          <Text style={styles.dangerBtnText}>Délier ce partenaire</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Lier un partenaire</Text>
      <Text style={styles.subtitle}>Partagez votre code, ou saisissez celui que l'on vous a transmis.</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Mon code</Text>
        {loadingCode ? (
          <ActivityIndicator color={base.textSecondary} style={{ marginVertical: 12 }} />
        ) : code ? (
          <>
            <Text style={styles.code}>{code}</Text>
            <Text style={styles.hint}>Partagez-le avec votre partenaire. Valable 7 jours.</Text>
            <TouchableOpacity onPress={handleGenerate} disabled={busy}>
              <Text style={styles.linkText}>Générer un nouveau code</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={[styles.primaryBtn, busy && styles.btnDisabled]} onPress={handleGenerate} disabled={busy}>
            <Text style={styles.primaryBtnText}>Générer mon code</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.divider}>ou</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Saisir un code</Text>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={(t) => setInput(t.toUpperCase())}
          placeholder="Ex. A1B2C3D4"
          placeholderTextColor={base.textTertiary}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={8}
          returnKeyType="done"
          onSubmitEditing={handleRedeem}
        />
        {error && <Text style={styles.error}>{error}</Text>}
        <TouchableOpacity
          style={[styles.primaryBtn, (busy || input.trim().length === 0) && styles.btnDisabled]}
          onPress={handleRedeem}
          disabled={busy || input.trim().length === 0}
        >
          <Text style={styles.primaryBtnText}>{busy ? 'Liaison…' : 'Lier'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
