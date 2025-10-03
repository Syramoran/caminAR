import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useUser } from '../../context/UserContext'; // 1. Importamos el hook del contexto

// Eliminamos la necesidad de pasar props, el componente ahora es autosuficiente
export const HomeHeader = () => {
  const theme = useTheme();
  const { userName } = useUser(); // 2. Obtenemos el nombre del usuario del contexto

  // Datos de ejemplo que podrían venir del contexto en el futuro
  const points = 1250;
  const level = 5;
  const weather = { temp: '21', condition: 'Soleado' };

  return (
    <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
      <View style={styles.row}>
        <View>
          {/* 3. Mostramos el nombre del contexto */}
          <Text variant="headlineMedium" style={styles.headerTitle}>Hola, {userName}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icon name="trophy-variant-outline" size={16} color="white" />
              <Text style={styles.statText}>{points} puntos</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="star-outline" size={16} color="white" />
              <Text style={styles.statText}>Nivel {level}</Text>
            </View>
          </View>
        </View>
        <View style={styles.weatherContainer}>
          <Icon name="white-balance-sunny" size={24} color="white" />
          <Text style={styles.weatherTemp}>{weather.temp}°C</Text>
          <Text style={styles.weatherCondition}>{weather.condition}</Text>
        </View>
      </View>
    </View>
  );
};

// ... (los estilos se mantienen igual)
const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
  statsRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: 'white',
    marginLeft: 4,
  },
  weatherContainer: {
    alignItems: 'center',
  },
  weatherTemp: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  weatherCondition: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
  },
});

