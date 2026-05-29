import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { typography, spacing, radius, base, phaseThemes } from '../styles/theme';
import { useJournal } from '../hooks/useJournal';
import type { CyclePhase, UserRole } from '../types';

interface Props {
  phase: CyclePhase;
  userRole: UserRole;
  userId: string;
  onLogPeriod: () => void;
}

export default function Journal({ phase, userRole, userId, onLogPeriod }: Props) {
  const theme = phaseThemes[phase];
  const { entries, addEntry } = useJournal(userId);
  const [text, setText] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  async function handleSave() {
    if (!text.trim()) return;
    await addEntry(text.trim(), isPrivate);
    setText('');
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.inner}>
      <View style={styles.header}>
        <Text style={styles.date}>{new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</Text>
        <Text style={[styles.phase, { color: theme.primary }]}>{theme.label}</Text>
      </View>

      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        multiline
        placeholder="Comment vous sentez-vous aujourd'hui ?"
        placeholderTextColor={base.textTertiary}
      />

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => setIsPrivate(!isPrivate)}>
          <Text style={styles.privacyText}>{isPrivate ? '🔒 Privé' : '👁 Partagé'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={handleSave} disabled={!text.trim()}>
          <Text style={styles.saveBtnText}>Enregistrer</Text>
        </TouchableOpacity>
      </View>

      {userRole === 'primary' && (
        <TouchableOpacity style={styles.periodBtn} onPress={onLogPeriod}>
          <Text style={styles.periodBtnText}>Mes règles ont commencé aujourd'hui</Text>
        </TouchableOpacity>
      )}

      {entries.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>Notes récentes</Text>
          {entries.slice(0, 4).map(entry => (
            <View key={entry.id} style={styles.entryCard}>
              <View style={styles.entryMeta}>
                <Text style={styles.entryDate}>{new Date(entry.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { padding: spacing.md, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: spacing.sm },
  date: { ...typography.headlineMd, color: base.textPrimary },
  phase: { ...typography.labelSm },
  input: { backgroundColor: base.surface, borderRadius: radius.lg, padding: spacing.sm, ...typography.bodyMd, color: base.textPrimary, minHeight: 120, textAlignVertical: 'top', marginBottom: spacing.xs },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  privacyText: { ...typography.labelMd, color: base.textSecondary },
  saveBtn: { borderRadius: radius.full, paddingVertical: 12, paddingHorizontal: spacing.sm },
  saveBtnText: { ...typography.labelMd, color: '#fff' },
  periodBtn: { backgroundColor: base.surface, borderRadius: radius.lg, padding: spacing.sm, alignItems: 'center', marginBottom: spacing.lg },
  periodBtnText: { ...typography.bodyMd, color: base.textPrimary },
  sectionLabel: { ...typography.labelSm, color: base.textTertiary, marginBottom: spacing.xs },
  entryCard: { backgroundColor: base.surface, borderRadius: radius.lg, padding: spacing.sm, marginBottom: spacing.xs },
  entryMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  entryDate: { ...typography.labelSm, color: base.textTertiary },
  entryLock: { fontSize: 12 },
  entryContent: { ...typography.bodyMd, color: base.textPrimary },
});
