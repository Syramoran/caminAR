import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface WeatherCardProps {
  weather: {
    condition: string;
    tempRange: string;
    temp: string; // Añadimos la temperatura actual
  };
  streak: number;
  isNight: boolean;
}

export default function WeatherCard({ weather, streak, isNight }: WeatherCardProps) {
  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.weatherInfo}>
            <Icon name={isNight ? "moon-waning-crescent" : "white-balance-sunny"} size={40} color="#333" />
            <Text style={styles.temp}>{weather.temp}°C</Text>
        </View>
        <View style={styles.textContainer}>
          <Text variant="titleLarge" style={styles.title}>
            {isNight ? "¡Noche tranquila!" : "¡Día perfecto para actuar!"}
          </Text>
          <Text style={styles.subtitle}>Llevas {streak} días consecutivos completando retos</Text>
          <Text style={styles.condition}>{weather.condition}</Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    marginBottom: 24,
    // Eliminamos el marginTop negativo y el marginHorizontal
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  weatherInfo: {
      alignItems: 'center',
      marginRight: 20,
  },
  temp: {
      fontSize: 20,
      fontWeight: 'bold',
      marginTop: 8,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    lineHeight: 28,
  },
  subtitle: {
    color: '#666',
    marginTop: 4,
  },
  condition: {
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  }
});

