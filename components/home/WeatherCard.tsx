import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper'; // Importa useTheme
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface WeatherCardProps {
  weather: {
    condition: string; // Ej: "Parcialmente nublado"
    tempRange: string; // Ej: "15° - 22°"
    temp: string;      // Ej: "18"
  };
  streak: number;
  isNight: boolean;
}

// Mapeo de condiciones (simplificado) a iconos
// Puedes expandir esto o usar los códigos WMO si los pasas como prop
const getWeatherIcon = (condition: string, isNight: boolean): string => {
  const lowerCaseCondition = condition.toLowerCase();
  if (lowerCaseCondition.includes('despejado')) return isNight ? 'weather-night' : 'weather-sunny';
  if (lowerCaseCondition.includes('nube') || lowerCaseCondition.includes('nublado')) return isNight ? 'weather-night-partly-cloudy' : 'weather-partly-cloudy';
  if (lowerCaseCondition.includes('lluvia') || lowerCaseCondition.includes('llovizna') || lowerCaseCondition.includes('chubasco')) return 'weather-rainy';
  if (lowerCaseCondition.includes('tormenta')) return 'weather-lightning';
  if (lowerCaseCondition.includes('nieve')) return 'weather-snowy';
  if (lowerCaseCondition.includes('niebla')) return 'weather-fog';
  return isNight ? 'weather-night' : 'weather-sunny'; // Icono por defecto
};


export default function WeatherCard({ weather, streak, isNight }: WeatherCardProps) {
  // 1. Obtenemos el tema
  const theme = useTheme();
  const weatherIcon = getWeatherIcon(weather.condition, isNight);

  return (
    // 2. Usamos el color 'surface' del tema para el fondo de la Card
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content style={styles.content}>
        {/* Columna Izquierda: Icono y Temperatura Actual */}
        <View style={styles.weatherInfo}>
          {/* 3. Usamos el color primario del tema para el icono */}
          <Icon name={weatherIcon} size={50} color={theme.colors.primary} />
          {/* 4. Usamos el color primario para la temperatura */}
          <Text style={[styles.temp, { color: theme.colors.primary }]}>{weather.temp}°C</Text>
        </View>

        {/* Columna Derecha: Textos */}
        <View style={styles.textContainer}>
          <Text variant="titleLarge" style={styles.title}>
            {isNight ? "¡Noche tranquila!" : "¡Día perfecto para CaminAR!"}
          </Text>
          {/* 5. Usamos onSurfaceVariant para textos secundarios */}
          <Text style={[styles.condition, { color: theme.colors.onSurfaceVariant }]}>{weather.condition}</Text>
          {/* Mostramos el rango de temperatura */}
          <Text style={[styles.tempRange, { color: theme.colors.onSurfaceVariant }]}>Min/Max: {weather.tempRange}</Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 24,
    elevation: 3, // Sombra sutil
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  weatherInfo: {
    alignItems: 'center',
    marginRight: 20,
    minWidth: 60, // Ancho mínimo para alinear
  },
  temp: {
    fontSize: 24, // Temperatura más grande
    fontWeight: 'bold',
    marginTop: 8,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center', // Centrar verticalmente los textos
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4, // Espacio después del título
  },
  condition: {
    fontSize: 16, // Condición un poco más grande
    marginBottom: 4, // Espacio antes del rango
    textTransform: 'capitalize', // Primera letra mayúscula
  },
   tempRange: {
      fontSize: 14,
      marginBottom: 8, // Espacio antes de la racha
   },
  subtitle: {
    fontSize: 14, // Racha un poco más pequeña
  },
});
