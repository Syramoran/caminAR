import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { Text, Appbar, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GestionCuponesScreen() {
  const theme = useTheme();

  // Aquí irá la lógica para crear, ver y editar cupones

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.primary }]} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        {/* Podrías añadir Appbar.BackAction si esta pantalla no estuviera en Tabs */}
        <Appbar.Content title="Gestionar Cupones" titleStyle={{ color: '#fff' }}/>
      </Appbar.Header>

      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text variant="headlineMedium" style={styles.title}>Mis Cupones Creados</Text>
        <Text style={styles.subtitle}>Aquí podrás crear y administrar los cupones para los usuarios.</Text>
        {/* Más adelante aquí mostraremos la lista de cupones creados y un botón para crear nuevos */}
        <Text style={{ marginTop: 20, textAlign: 'center', color: theme.colors.backdrop }}>
          (Funcionalidad en desarrollo)
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    marginBottom: 24,
    color: '#666', // Podrías usar theme.colors.onSurfaceVariant
  },
});
