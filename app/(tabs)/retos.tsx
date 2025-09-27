import React from 'react';
import { ScrollView, StyleSheet, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, useTheme } from 'react-native-paper';
import ChallengeSections from '../../components/challenges/ChallengeSections';
import { useChallenges } from '../../hooks/useChallenges';

export default function RetosScreen() {
  const { challenges } = useChallenges();
  const theme = useTheme();

  return (
    // SafeAreaView gestiona el espacio superior (notch/isla dinámica)
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.primary }]}>
      {/* Controlamos el color de los iconos de la barra de estado */}
      <StatusBar barStyle="light-content" />

      {/* El encabezado mantiene su estilo para dar consistencia a la app */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text variant="headlineMedium" style={styles.headerTitle}>Desafíos Ecológicos</Text>
        <Text variant="bodyLarge" style={styles.headerSubtitle}>
          Completa desafíos para ganar puntos y ayudar al planeta
        </Text>
      </View>

      {/* Este View adicional con flex: 1 soluciona el problema de la barra verde */}
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ScrollView contentContainerStyle={styles.container}>
          <ChallengeSections data={challenges} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    // Eliminamos el paddingTop para que SafeAreaView lo controle
    paddingBottom: 24,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    marginTop: 4,
    color: 'white',
    opacity: 0.9,
  },
  container: {
    padding: 16,
    paddingBottom: 48, // Más espacio al final para que no se pegue a la TabBar
  },
});

