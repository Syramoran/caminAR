import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useUser } from '../../context/UserContext';

export const HomeHeader = () => {
  const theme = useTheme();
  const { userName } = useUser();
  const points = 1247;
  const level = 5;

  return (
    <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
      <View style={styles.row}>
        <View>
          <Text variant="headlineMedium" style={styles.headerTitle}>Hola, {userName}</Text>
          <Text style={styles.headerSubtitle}>¿Listo para la eco-aventura de hoy?</Text>
        </View>
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsValue}>{points}</Text>
          <Text style={styles.pointsLabel}>Puntos Eco</Text>
        </View>
      </View>
    </View>
  );
};

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

