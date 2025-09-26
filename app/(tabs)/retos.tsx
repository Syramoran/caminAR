import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, useTheme } from 'react-native-paper';
import ChallengeSections from '../../components/challenges/ChallengeSections';
import { useChallenges } from '../../hooks/useChallenges';

export default function RetosScreen() {
  const { challenges } = useChallenges();
  const theme = useTheme();

  return (
    // SafeAreaView ahora usa el color primario para el área del notch/status bar
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.primary }}>
      {/* El encabezado tiene el estilo del de Perfil para consistencia */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text variant="headlineMedium" style={styles.headerTitle}>Desafíos Ecológicos</Text>
        <Text variant="bodyLarge" style={styles.headerSubtitle}>
          Completa desafíos para ganar puntos y ayudar al planeta
        </Text>
      </View>
      {/* El ScrollView contiene el resto de la pantalla con el color de fondo correcto */}
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={styles.container}
      >
        <ChallengeSections data={challenges} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingTop: 50,
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
    paddingBottom: 32, // Añadimos más espacio al final de la lista
  },
});

