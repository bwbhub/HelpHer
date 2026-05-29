import type { CyclePhase } from '../types';

export const typography = {
  displayLg: { fontFamily: 'Literata_600SemiBold', fontSize: 40, lineHeight: 48, letterSpacing: -0.8 },
  headlineLg: { fontFamily: 'Literata_600SemiBold', fontSize: 28, lineHeight: 34 },
  headlineMd: { fontFamily: 'Literata_500Medium', fontSize: 24, lineHeight: 32 },
  bodyLg: { fontFamily: 'HankenGrotesk_400Regular', fontSize: 18, lineHeight: 29 },
  bodyMd: { fontFamily: 'HankenGrotesk_400Regular', fontSize: 16, lineHeight: 26 },
  labelMd: { fontFamily: 'HankenGrotesk_600SemiBold', fontSize: 14, lineHeight: 20, letterSpacing: 0.28 },
  labelSm: { fontFamily: 'HankenGrotesk_600SemiBold', fontSize: 12, lineHeight: 17, letterSpacing: 0.6, textTransform: 'uppercase' as const },
} as const;

export const spacing = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 40,
} as const;

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  full: 9999,
} as const;

export const base = {
  background: '#FDFBF7',
  surface: '#F0EEE9',
  textPrimary: '#1B1C1A',
  textSecondary: '#424841',
  textTertiary: '#737970',
  outline: '#C2C8BE',
  error: '#BA1A1A',
} as const;

export const phaseThemes: Record<CyclePhase, {
  primary: string;
  primaryMuted: string;
  background: string;
  label: string;
  season: string;
}> = {
  winter: {
    primary: '#4A6FA5',
    primaryMuted: '#E6F1FB',
    background: '#F0F4FA',
    label: 'Hiver',
    season: 'Menstruation',
  },
  spring: {
    primary: '#456646',
    primaryMuted: '#E1F5EE',
    background: '#F0F7F1',
    label: 'Printemps',
    season: 'Phase folliculaire',
  },
  summer: {
    primary: '#A0762A',
    primaryMuted: '#FAEEDA',
    background: '#FBF5E6',
    label: 'Été',
    season: 'Ovulation',
  },
  autumn: {
    primary: '#8C4D38',
    primaryMuted: '#FFDBD0',
    background: '#FAF0EB',
    label: 'Automne',
    season: 'Phase lutéale',
  },
};
