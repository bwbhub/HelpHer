import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { Text, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { typography, spacing, radius, base } from '../styles/theme';
import Auth from '../screens/Auth';
import Phase from '../screens/Phase';
import Rituals from '../screens/Rituals';
import Nourish from '../screens/Nourish';
import Journal from '../screens/Journal';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen name="Phase" component={Phase as React.ComponentType} options={{ tabBarIcon: ({ focused }) => <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>Phase</Text> }} />
      <Tab.Screen name="Rituels" component={Rituals as React.ComponentType} options={{ tabBarIcon: ({ focused }) => <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>Rituels</Text> }} />
      <Tab.Screen name="Nourish" component={Nourish as React.ComponentType} options={{ tabBarIcon: ({ focused }) => <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>Nourish</Text> }} />
      <Tab.Screen name="Journal" component={Journal as React.ComponentType} options={{ tabBarIcon: ({ focused }) => <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>Journal</Text> }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { session, loading } = useAuth();
  if (loading) return null;
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? <Stack.Screen name="Main" component={MainTabs} /> : <Stack.Screen name="Auth" component={Auth} />}
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
});
