import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  // 1. Obtenemos el tema que definimos en el layout principal
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // 2. Usamos los colores del tema para los íconos
        tabBarActiveTintColor: theme.primary, // Color primario (tu verde oscuro)
        tabBarInactiveTintColor: 'gray', // Un color neutral para los inactivos
        // 3. Usamos el color del tema para el fondo de la barra
        tabBarStyle: {
          backgroundColor: theme.surface, // El color de fondo de las cards (blanco)
          borderTopWidth: 0,
          elevation: 4, // Le damos una pequeña sombra para que se distinga
          shadowOpacity: 0.1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="retos"
        options={{
          title: 'Retos',
          tabBarIcon: ({ color, size }) => <Ionicons name="trophy-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="premios"
        options={{
          title: 'Premios',
          tabBarIcon: ({ color, size }) => <Ionicons name="gift-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}