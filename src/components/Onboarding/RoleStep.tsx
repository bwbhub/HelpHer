import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useT } from '../../i18n/LocaleProvider';
import { styles } from './Onboarding.styles';
import type { RoleChoice } from './Onboarding';

const KEYS: RoleChoice[] = ['self', 'partner', 'both'];

interface Props {
  value: RoleChoice | null;
  onSelect: (role: RoleChoice) => void;
}

/** Étape 1 — choix du rôle. Écrit ensuite is_primary / is_partner sur le profil. */
export default function RoleStep({ value, onSelect }: Props) {
  const { t } = useT();
  return (
    <View style={{ gap: 16 }}>
      <Text style={styles.title}>{t('onboarding.role.title')}</Text>
      <Text style={styles.subtitle}>{t('onboarding.role.subtitle')}</Text>

      {KEYS.map((key) => (
        <TouchableOpacity
          key={key}
          style={[styles.choiceCard, value === key && styles.choiceCardActive]}
          onPress={() => onSelect(key)}
          accessibilityRole="radio"
          accessibilityState={{ selected: value === key }}
        >
          <Text style={styles.choiceTitle}>{t(`onboarding.role.${key}.title`)}</Text>
          <Text style={styles.choiceDesc}>{t(`onboarding.role.${key}.desc`)}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
