import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
// Quitamos la importación de Icon si no se usa aquí directamente
import { useUser } from '../../context/UserContext'; // Importamos el hook useUser

export const HomeHeader = () => {
  const theme = useTheme();
  // Usamos el hook para obtener los datos necesarios del usuario logueado
  const { username, totalScore, loadingProfile } = useUser(); // Obtenemos username y totalScore

  // Podemos usar loadingProfile para mostrar un placeholder si es necesario
  // const level = 5; // Mantenemos el nivel como local por ahora

  return (
    <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
      <View style={styles.row}>
        <View>
          {/* Muestra el username del contexto */}
          <Text variant="headlineMedium" style={styles.headerTitle}>Hola, {username}</Text>
          <Text style={styles.headerSubtitle}>¿Listo para la eco-aventura de hoy?</Text>
        </View>
        <View style={styles.pointsContainer}>
          {/* Muestra el totalScore del contexto. Usamos ?? 0 por si acaso es null/undefined inicialmente */}
          <Text style={styles.pointsValue}>{loadingProfile ? '...' : (totalScore ?? 0)}</Text>
          <Text style={styles.pointsLabel}>Puntos Eco</Text>
        </View>
      </View>
    </View>
  );
};

// Los estilos se mantienen igual
const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingTop: 60, // Espacio para la barra de estado
    paddingBottom: 24, // Reducimos el padding inferior
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    color: 'white',
    opacity: 0.9,
    marginTop: 4,
  },
  pointsContainer: {
    alignItems: 'flex-end',
  },
  pointsValue: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 24,
  },
  pointsLabel: {
    color: 'white',
    opacity: 0.9,
    fontSize: 12,
  },
});

