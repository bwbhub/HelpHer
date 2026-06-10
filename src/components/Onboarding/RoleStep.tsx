import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './Onboarding.styles';
import type { RoleChoice } from './Onboarding';

const OPTIONS: { key: RoleChoice; title: string; desc: string }[] = [
  { key: 'self', title: 'Je suis concernée par un cycle', desc: 'Suivez vos phases, votre énergie, vos règles.' },
  { key: 'partner', title: 'Je suis partenaire', desc: 'Accompagnez le cycle de votre partenaire au quotidien.' },
  { key: 'both', title: 'Les deux', desc: 'Votre cycle et celui de votre partenaire, ensemble.' },
];

interface Props {
  value: RoleChoice | null;
  onSelect: (role: RoleChoice) => void;
}

/** Étape 1 — choix du rôle. Écrit ensuite is_primary / is_partner sur le profil. */
export default function RoleStep({ value, onSelect }: Props) {
  return (
    <View style={{ gap: 16 }}>
      <Text style={styles.title}>Bienvenue sur Luna</Text>
      <Text style={styles.subtitle}>Comment souhaitez-vous utiliser l'application ?</Text>

      {OPTIONS.map((o) => (
        <TouchableOpacity
          key={o.key}
          style={[styles.choiceCard, value === o.key && styles.choiceCardActive]}
          onPress={() => onSelect(o.key)}
          accessibilityRole="radio"
          accessibilityState={{ selected: value === o.key }}
        >
          <Text style={styles.choiceTitle}>{o.title}</Text>
          <Text style={styles.choiceDesc}>{o.desc}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
