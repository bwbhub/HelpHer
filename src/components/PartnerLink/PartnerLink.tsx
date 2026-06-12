import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAppData } from '../../data/AppDataProvider';
import { useT } from '../../i18n/LocaleProvider';
import { base } from '../../styles/theme';
import { styles } from './PartnerLink.styles';

/**
 * Flux de liaison partenaire : génération/partage d'un code, saisie d'un code
 * reçu (lien mutuel), et déliaison unilatérale. S'appuie sur les RPC Supabase.
 */
export default function PartnerLink() {
  const { profile, partnerName, fetchActivePartnerCode, generatePartnerCode, redeemPartnerCode, unlinkPartner } = useAppData();
  const { t } = useT();

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
      setError(e instanceof Error ? e.message : t('partnerLink.errorGenerate'));
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
    } catch (e) {
      setError(e instanceof Error ? e.message : t('partnerLink.errorInvalid'));
    } finally {
      setBusy(false);
    }
  }

  function confirmUnlink() {
    Alert.alert(t('partnerLink.unlink'), t('partnerLink.linkedSubtitle', { name: partnerName ?? t('phaseScreen.partnerFallback') }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('partnerLink.unlink'),
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
    ]);
  }

  if (linked) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
        <Text style={styles.title}>{t('partnerLink.linkedTitle')}</Text>
        <Text style={styles.subtitle}>{t('partnerLink.linkedSubtitle', { name: partnerName ?? t('phaseScreen.partnerFallback') })}</Text>
        <TouchableOpacity style={[styles.dangerBtn, busy && styles.btnDisabled]} onPress={confirmUnlink} disabled={busy}>
          <Text style={styles.dangerBtnText}>{t('partnerLink.unlink')}</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{t('partnerLink.title')}</Text>
      <Text style={styles.subtitle}>{t('partnerLink.subtitle')}</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>{t('partnerLink.myCode')}</Text>
        {loadingCode ? (
          <ActivityIndicator color={base.textSecondary} style={{ marginVertical: 12 }} />
        ) : code ? (
          <>
            <Text style={styles.code}>{code}</Text>
            <Text style={styles.hint}>{t('partnerLink.codeHint')}</Text>
            <TouchableOpacity onPress={handleGenerate} disabled={busy}>
              <Text style={styles.linkText}>{t('partnerLink.regenerate')}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={[styles.primaryBtn, busy && styles.btnDisabled]} onPress={handleGenerate} disabled={busy}>
            <Text style={styles.primaryBtnText}>{t('partnerLink.generate')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.divider}>{t('partnerLink.or')}</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>{t('partnerLink.enterLabel')}</Text>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={(t2) => setInput(t2.toUpperCase())}
          placeholder={t('partnerLink.enterPlaceholder')}
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
          <Text style={styles.primaryBtnText}>{busy ? t('partnerLink.linking') : t('partnerLink.link')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
