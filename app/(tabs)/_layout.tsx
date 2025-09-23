import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#d1ddd9ff', // Color primario de tu paleta
        tabBarStyle: styles.tabBar,
        headerShown: false, // Oculta el encabezado por defecto
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" color={color} size={28} />,
        }}
      />
      <Tabs.Screen
        name="retos"
        options={{
          title: 'Retos',
          tabBarIcon: ({ color }) => <Ionicons name="trophy-outline" color={color} size={28} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" color={color} size={28} />,
        }}
      />
      <Tabs.Screen
        name="premios"
        options={{
          title: 'Premios',
          tabBarIcon: ({ color }) => <Ionicons name="gift-outline" color={color} size={28} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#00ffb3ff', // Color de fondo de tu paleta
    borderTopWidth: 0,
    elevation: 0, // Para Android
    shadowOpacity: 0, // Para iOS
  },
});