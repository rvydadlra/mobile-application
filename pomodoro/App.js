import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import { initDatabase } from './src/database/database';
import { AuthContext } from './src/context/AuthContext';

const Tab = createBottomTabNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');

  useEffect(() => {
    initDatabase();
  }, []);

  const handleLogout = () => setUser(null);

  if (!user) {
    return (
      <AuthContext.Provider value={{ user, setUser, logout: handleLogout }}>
        <NavigationContainer>
          <StatusBar style="light" />
          {authMode === 'login' ? (
            <LoginScreen
              onSuccess={setUser}
              onSwitchToRegister={() => setAuthMode('register')}
            />
          ) : (
            <RegisterScreen
              onSuccess={setUser}
              onSwitchToLogin={() => setAuthMode('login')}
            />
          )}
        </NavigationContainer>
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout: handleLogout }}>
      <NavigationContainer>
        <StatusBar style="light" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: { backgroundColor: '#121821', borderTopColor: '#1f2a37' },
            tabBarActiveTintColor: '#1E88E5',
            tabBarInactiveTintColor: '#97a6b2',
            tabBarIcon: ({ color, size, focused }) => {
              if (route.name === 'AnaSayfa') {
                return <Ionicons name={focused ? 'timer' : 'timer-outline'} size={size} color={color} />;
              }
              if (route.name === 'Raporlar') {
                return <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} size={size} color={color} />;
              }
              return null;
            },
          })}
        >
          <Tab.Screen
            name="AnaSayfa"
            component={HomeScreen}
            key={`home-${user?.id}`}
            options={{ title: 'Zamanlayıcı' }}
          />
          <Tab.Screen
            name="Raporlar"
            component={ReportsScreen}
            key={`reports-${user?.id}`}
            options={{ title: 'Raporlar' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
