import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { StatGridItem } from './StatGridItem';

export const StatisticsSection = () => {
  const theme = useTheme();

  return (
    <Card style={styles.container}>
      <Card.Title
        title="Mis Estadísticas"
        titleVariant="titleLarge"
        left={(props) => <Text {...props} style={{ fontSize: 24, marginLeft: 8 }}>📈</Text>}
      />
      <Card.Content>
        {/* Contenedor de la grilla */}
        <View style={styles.gridContainer}>
          <StatGridItem icon="map-marker-distance" value="127.5 km" label="Distancia total" />
          <StatGridItem icon="recycle-variant" value="89" label="Elementos reciclados" />
          <StatGridItem icon="star-outline" value="3" label="Árboles plantados" />
          <StatGridItem icon="calendar-check" value="12" label="Eventos asistidos" />
        </View>

        {/* Tarjeta de CO2 Ahorrado */}
        <Card style={[styles.co2Card, { backgroundColor: theme.colors.secondary + '40' }]}>
           <Card.Content style={styles.co2Content}>
            <Text variant='bodyMedium' style={{color: theme.colors.primary}}>CO₂ Ahorrado</Text>
            <Text variant='headlineLarge' style={{color: theme.colors.primary, fontWeight: 'bold'}}>45.2 kg</Text>
            <Text variant='bodySmall' style={{color: theme.colors.onSurfaceVariant}}>Equivalente a plantar 2 árboles</Text>
           </Card.Content>
        </Card>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  co2Card: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#bed77c'
  },
  co2Content: {
      alignItems: 'center',
  }
});
