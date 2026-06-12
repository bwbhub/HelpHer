import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { useT } from '../../i18n/LocaleProvider';
import { base } from '../../styles/theme';
import { styles } from './Onboarding.styles';

interface Props {
  name: string;
  onChangeName: (value: string) => void;
}

/** Étape 3 — présentation partenaire (nom). Pas de données de cycle. */
export default function PartnerStep({ name, onChangeName }: Props) {
  const { t } = useT();
  return (
    <View style={{ gap: 16 }}>
      <Text style={styles.title}>{t('onboarding.partner.title')}</Text>
      <Text style={styles.subtitle}>{t('onboarding.partner.subtitle')}</Text>

      <View>
        <Text style={styles.question}>{t('onboarding.partner.nameQ')}</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={onChangeName}
          placeholder={t('onboarding.partner.namePlaceholder')}
          placeholderTextColor={base.textTertiary}
          autoCapitalize="words"
          returnKeyType="done"
        />
      </View>
    </View>
  );
}
