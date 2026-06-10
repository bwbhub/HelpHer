import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { phaseThemes } from '../../styles/theme';
import type { CyclePhase, ViewMode } from '../../types';
import { styles } from './Rituals.styles';

interface Props { phase: CyclePhase; userRole: ViewMode }

type Section = { title: string; cards: { title: string; body: string }[] };

export default function Rituals({ phase, userRole }: Props) {
  const theme = phaseThemes[phase];
  const sections: Section[] = userRole === 'primary' ? PRIMARY[phase] : PARTNER[phase];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.inner}>
      <Text style={[styles.header, { color: theme.primary }]}>{theme.label}</Text>
      <Text style={styles.season}>{theme.season}</Text>
      {sections.map(section => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionLabel}>{section.title}</Text>
          {section.cards.map(card => (
            <View key={card.title} style={styles.card}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardBody}>{card.body}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const PRIMARY: Record<CyclePhase, Section[]> = {
  winter: [
    { title: 'Sport & Mouvement', cards: [
      { title: 'Yoga restauratif', body: 'Des postures douces pour soulager les tensions du bas-ventre.' },
      { title: 'Marche consciente', body: '20 minutes à votre rythme, sans pression.' },
    ]},
    { title: 'Bien-être', cards: [{ title: 'Chaleur & repos', body: 'Bouillotte, tisane, couverture. Vous avez la permission de ralentir.' }]},
    { title: 'À savoir cette semaine', cards: [{ title: 'Votre corps se régénère', body: 'Les règles marquent le renouveau de votre cycle. C\'est un moment de lâcher-prise.' }]},
  ],
  spring: [
    { title: 'Sport & Mouvement', cards: [
      { title: 'Pilates', body: 'Renforcez votre centre de façon progressive.' },
      { title: 'Vélo ou natation', body: 'Votre corps est prêt pour plus d\'énergie.' },
    ]},
    { title: 'Bien-être', cards: [{ title: 'Commencer quelque chose', body: 'C\'est le bon moment pour initier un projet ou une nouvelle habitude.' }]},
    { title: 'À savoir cette semaine', cards: [{ title: 'L\'œstrogène monte', body: 'Clarté mentale, optimisme, sociabilité — votre phase de renouveau bat son plein.' }]},
  ],
  summer: [
    { title: 'Sport & Mouvement', cards: [
      { title: 'HIIT ou running', body: 'Votre résistance est à son pic. C\'est le moment d\'aller chercher vos limites.' },
      { title: 'Danse ou sport collectif', body: 'Canalisez votre énergie sociale dans le mouvement.' },
    ]},
    { title: 'Bien-être', cards: [{ title: 'Connexion & partage', body: 'Vous êtes magnétique. Entourez-vous de personnes qui vous nourrissent.' }]},
    { title: 'À savoir cette semaine', cards: [{ title: 'Pic d\'énergie', body: 'Communication, créativité et confiance sont à leur maximum.' }]},
  ],
  autumn: [
    { title: 'Sport & Mouvement', cards: [
      { title: 'Yoga ou stretching', body: 'Favorisez la mobilité plutôt que la performance.' },
      { title: 'Marche en nature', body: 'La nature en automne invite à la contemplation.' },
    ]},
    { title: 'Bien-être', cards: [{ title: 'Journaling', body: 'Mettre des mots sur ce que vous ressentez peut libérer une tension intérieure.' }]},
    { title: 'À savoir cette semaine', cards: [{ title: 'La progestérone prend le relais', body: 'Vous pouvez vous sentir plus sensible. C\'est normal et temporaire.' }]},
  ],
};

const PARTNER: Record<CyclePhase, Section[]> = {
  winter: [
    { title: 'Comment être là', cards: [{ title: 'Moins, c\'est plus', body: 'Proposez votre présence sans attendre grand chose en retour. Un câlin, un repas préparé.' }]},
    { title: 'Idées de moments ensemble', cards: [{ title: 'Film & canapé', body: 'Un moment calme à la maison, sans agenda.' }]},
    { title: 'À comprendre', cards: [{ title: 'Ce n\'est pas contre vous', body: 'La fatigue et la sensibilité de cette période sont physiologiques, pas émotionnelles.' }]},
  ],
  spring: [
    { title: 'Comment être là', cards: [{ title: 'Encouragez ses élans', body: 'Elle revient à la vie — soutenez ses initiatives avec enthousiasme.' }]},
    { title: 'Idées de moments ensemble', cards: [{ title: 'Nouvelle activité', body: 'Proposez quelque chose que vous n\'avez jamais fait ensemble.' }]},
    { title: 'À comprendre', cards: [{ title: 'L\'énergie revient', body: 'C\'est une bonne période pour les conversations importantes.' }]},
  ],
  summer: [
    { title: 'Comment être là', cards: [{ title: 'Être présent(e) dans l\'échange', body: 'Elle est à son meilleur — connectez-vous vraiment avec elle.' }]},
    { title: 'Idées de moments ensemble', cards: [{ title: 'Sortie sociale ou romantique', body: 'Dîner, concert, soirée — elle aime se montrer et partager.' }]},
    { title: 'À comprendre', cards: [{ title: 'Son pic d\'énergie', body: 'L\'ovulation amplifie la communication et la sociabilité.' }]},
  ],
  autumn: [
    { title: 'Comment être là', cards: [{ title: 'Patience & écoute', body: 'Elle peut être plus sensible. Ne prenez pas les sautes d\'humeur personnellement.' }]},
    { title: 'Idées de moments ensemble', cards: [{ title: 'Soirée calme à deux', body: 'Cuisinez ensemble, regardez quelque chose qu\'elle aime.' }]},
    { title: 'À comprendre', cards: [{ title: 'L\'introspection monte', body: 'Ce n\'est pas un rejet, c\'est un besoin physiologique.' }]},
  ],
};

