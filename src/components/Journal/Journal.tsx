import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { phaseThemes, base } from '../../styles/theme';
import { useJournal } from './useJournal';
import { useT } from '../../i18n/LocaleProvider';
import type { CyclePhase, ViewMode } from '../../types';
import { styles } from './Journal.styles';

interface Props {
  phase: CyclePhase;
  viewMode: ViewMode;
  userId: string;
  onLogPeriod: () => void;
}

export default function Journal({ phase, viewMode, userId, onLogPeriod }: Props) {
  const { t, locale } = useT();
  const theme = phaseThemes[phase];
  const { entries, addEntry } = useJournal(userId);
  const [text, setText] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const dateLocale = locale === 'en' ? 'en-US' : 'fr-FR';

  async function handleSave() {
    if (!text.trim()) return;
    await addEntry(text.trim(), isPrivate);
    setText('');
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.inner}>
      <View style={styles.header}>
        <Text style={styles.date}>{new Date().toLocaleDateString(dateLocale, { day: 'numeric', month: 'long' })}</Text>
        <Text style={[styles.phase, { color: theme.primary }]}>{t(`phases.label.${phase}`)}</Text>
      </View>

      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        multiline
        placeholder={t('journal.placeholder')}
        placeholderTextColor={base.textTertiary}
      />

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => setIsPrivate(!isPrivate)}>
          <Text style={styles.privacyText}>{isPrivate ? t('journal.private') : t('journal.shared')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={handleSave} disabled={!text.trim()}>
          <Text style={styles.saveBtnText}>{t('journal.save')}</Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'self' && (
        <TouchableOpacity style={styles.periodBtn} onPress={onLogPeriod}>
          <Text style={styles.periodBtnText}>{t('journal.periodStarted')}</Text>
        </TouchableOpacity>
      )}

      {entries.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>{t('journal.recentNotes')}</Text>
          {entries.slice(0, 4).map((entry) => (
            <View key={entry.id} style={styles.entryCard}>
              <View style={styles.entryMeta}>
                <Text style={styles.entryDate}>{new Date(entry.created_at).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short' })}</Text>
                {entry.is_private && <Text style={styles.entryLock}>🔒</Text>}
              </View>
              <Text style={styles.entryContent} numberOfLines={2}>{entry.content}</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}
