import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../components/Auth/useAuth';
import { AppDataProvider, useAppData } from '../data/AppDataProvider';
import { typography, spacing, radius, base } from '../styles/theme';
import Auth from '../components/Auth/Auth';
import Phase from '../components/Phase/Phase';
import Rituals from '../components/Rituals/Rituals';
import Nourish from '../components/Nourish/Nourish';
import Journal from '../components/Journal/Journal';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/** État neutre affiché tant que les données ne sont pas prêtes ou que le cycle n'est pas configuré. */
function ScreenMessage({ message, spinner }: { message: string; spinner?: boolean }) {
  return (
    <View style={styles.message}>
      {spinner && <ActivityIndicator color={base.textSecondary} style={{ marginBottom: spacing.sm }} />}
      <Text style={styles.messageText}>{message}</Text>
    </View>
  );
}

function PhaseScreen() {
  const { loading, needsSetup, phaseInfo, profile, viewMode, partnerName } = useAppData();
  if (loading) return <ScreenMessage message="Chargement…" spinner />;
  if (needsSetup) return <ScreenMessage message="Configurez votre cycle pour démarrer." />;
  if (!phaseInfo || !profile) return <ScreenMessage message="Aucune donnée de cycle à afficher pour le moment." />;
  return <Phase phaseInfo={phaseInfo} userRole={viewMode} partnerName={partnerName ?? undefined} />;
}

function RitualsScreen() {
  const { loading, phaseInfo, profile, viewMode } = useAppData();
  if (loading) return <ScreenMessage message="Chargement…" spinner />;
  if (!phaseInfo || !profile) return <ScreenMessage message="Aucune donnée de cycle à afficher pour le moment." />;
  return <Rituals phase={phaseInfo.phase} userRole={viewMode} />;
}

function NourishScreen() {
  const { loading, phaseInfo, profile, viewMode } = useAppData();
  if (loading) return <ScreenMessage message="Chargement…" spinner />;
  if (!phaseInfo || !profile) return <ScreenMessage message="Aucune donnée de cycle à afficher pour le moment." />;
  return <Nourish phase={phaseInfo.phase} userRole={viewMode} />;
}

function JournalScreen() {
  const { loading, phaseInfo, profile, viewMode, userId, logPeriod } = useAppData();
  if (loading) return <ScreenMessage message="Chargement…" spinner />;
  if (!phaseInfo || !profile || !userId) return <ScreenMessage message="Aucune donnée de cycle à afficher pour le moment." />;
  return <Journal phase={phaseInfo.phase} userRole={viewMode} userId={userId} onLogPeriod={logPeriod} />;
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen name="Phase" component={PhaseScreen} options={{ tabBarIcon: ({ focused }) => <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>Phase</Text> }} />
      <Tab.Screen name="Rituels" component={RitualsScreen} options={{ tabBarIcon: ({ focused }) => <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>Rituels</Text> }} />
      <Tab.Screen name="Nourish" component={NourishScreen} options={{ tabBarIcon: ({ focused }) => <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>Nourish</Text> }} />
      <Tab.Screen name="Journal" component={JournalScreen} options={{ tabBarIcon: ({ focused }) => <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>Journal</Text> }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { session, loading } = useAuth();
  if (loading) return null;
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <Stack.Screen name="Main">
            {() => (
              <AppDataProvider>
                <MainTabs />
              </AppDataProvider>
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Auth" component={Auth} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.md,
    right: spacing.md,
    borderRadius: radius.full,
    backgroundColor: base.textPrimary,
    height: 64,
    paddingBottom: 0,
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  tabLabel: { ...typography.labelMd, color: 'rgba(255,255,255,0.45)' },
  tabLabelActive: { color: '#fff' },
  message: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, backgroundColor: base.background },
  messageText: { ...typography.bodyMd, color: base.textSecondary, textAlign: 'center' },
});
