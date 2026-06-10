import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { base } from '../../styles/theme';
import { styles } from './Onboarding.styles';

interface Props {
  name: string;
  onChangeName: (value: string) => void;
}

/** Étape 3 — présentation partenaire (nom). Pas de données de cycle. */
export default function PartnerStep({ name, onChangeName }: Props) {
  return (
    <View style={{ gap: 16 }}>
      <Text style={styles.title}>Faisons connaissance</Text>
      <Text style={styles.subtitle}>Votre prénom apparaîtra auprès de votre partenaire.</Text>

      <View>
        <Text style={styles.question}>Comment vous appelez-vous ?</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={onChangeName}
          placeholder="Votre prénom"
          placeholderTextColor={base.textTertiary}
          autoCapitalize="words"
          returnKeyType="done"
        />
      </View>
    </View>
  );
}
