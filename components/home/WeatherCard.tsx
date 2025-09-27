import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface WeatherCardProps {
  weather: {
    condition: string;
    tempRange: string;
  };
  streak: number;
}

export default function WeatherCard({ weather, streak }: WeatherCardProps) {
  const theme = useTheme();
  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.tertiary }]}>
      <Card.Content style={styles.content}>
        <View style={styles.textContainer}>
          <Text variant="titleLarge" style={styles.title}>¡Día perfecto para actuar!</Text>
          <Text style={styles.subtitle}>Llevas {streak} días consecutivos completando retos</Text>
        </View>
        <View style={styles.weatherInfo}>
          <Icon name="white-balance-sunny" size={32} color="white" />
          <Text style={styles.weatherText}>{weather.condition}</Text>
          <Text style={styles.weatherText}>{weather.tempRange}°C</Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 16,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'white',
    opacity: 0.9,
    marginTop: 4,
  },
  weatherInfo: {
    alignItems: 'center',
    marginLeft: 16,
  },
  weatherText: {
    color: 'white',
  },
});
