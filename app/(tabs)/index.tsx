import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, View, StatusBar, RefreshControl, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, Text } from 'react-native-paper';
import * as Location from 'expo-location';
import { HomeHeader } from '../../components/home/HomeHeader';
import WeatherCard from '../../components/home/WeatherCard';
import MapPreview from '../../components/home/MapPreview';
import EcologicalRoutes from '../../components/home/EcologicalRoutes';

// Interfaz para los datos del clima
interface WeatherData {
  temp: string;
  condition: string;
  tempMin: string;
  tempMax: string;
}

// Interfaz que coincide con la respuesta de Open-Meteo
interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    weather_code: number;
  };
  daily: {
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

// Función para obtener la descripción del clima basada en el código WMO
const getWeatherDescription = (code: number): string => {
  const descriptions: { [key: number]: string } = {
    0: 'Despejado', 1: 'Despejado', 2: 'Parcialmente nublado', 3: 'Nublado',
    45: 'Niebla', 48: 'Niebla', 51: 'Llovizna', 53: 'Llovizna', 55: 'Llovizna',
    61: 'Lluvia', 63: 'Lluvia', 65: 'Lluvia fuerte', 71: 'Nieve', 73: 'Nieve',
    75: 'Nieve', 80: 'Chubascos', 81: 'Chubascos', 82: 'Tormenta', 95: 'Tormenta',
    96: 'Granizo', 99: 'Granizo fuerte',
  };
  return descriptions[code] || 'Desconocido';
};

export default function IndexScreen() {
  const theme = useTheme();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isNight, setIsNight] = useState(false);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [weatherError, setWeatherError] = useState(false);

  const fetchWeatherData = useCallback(async () => {
    setLoadingWeather(true);
    setWeatherError(false);

    try {
      const currentHour = new Date().getHours();
      setIsNight(currentHour < 6 || currentHour >= 19);

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setWeather({ temp: '--', condition: 'Sin permiso', tempMin: '-', tempMax: '-' });
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;

      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('Error clima');

      const data: OpenMeteoResponse = await response.json();

      if (data.current && data.daily) {
        setWeather({
          temp: Math.round(data.current.temperature_2m).toString(),
          condition: getWeatherDescription(data.current.weather_code),
          tempMin: Math.round(data.daily.temperature_2m_min[0]).toString(),
          tempMax: Math.round(data.daily.temperature_2m_max[0]).toString(),
        });
      }
    } catch (error) {
      console.log("Error obteniendo clima (posible fallo de red):", error);
      setWeatherError(true);
      // Datos placeholder para que la UI no se rompa, el componente WeatherCard manejará el estado de error visualmente si se desea
      setWeather({ temp: '--', condition: 'No disponible', tempMin: '-', tempMax: '-' });
    } finally {
      setLoadingWeather(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWeatherData();
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* CORRECCIÓN BARRA DE ESTADO:
        - backgroundColor explícito para Android para asegurar contraste.
        - barStyle="dark-content" para iconos oscuros sobre fondo claro (surface).
        - translucent={false} evita superposiciones indeseadas y asegura que el sistema pinte el fondo.
      */}
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.surface}
        translucent={false}
      />

      <SafeAreaView edges={['top']} style={{ backgroundColor: theme.colors.surface, elevation: 2, zIndex: 1 }}>
        <HomeHeader />
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
      >
        <View style={styles.sectionContainer}>
          <Text variant="titleMedium" style={{ color: theme.colors.outline, marginBottom: 8 }}>
            Tu día hoy
          </Text>

          <WeatherCard
            weather={weather}
            isNight={isNight}
            loading={loadingWeather}
            error={weatherError}
            onRetry={fetchWeatherData}
          />
        </View>

        <View style={styles.sectionContainer}>
          <Text variant="titleLarge" style={styles.sectionTitle}>Explora tu entorno</Text>
          <MapPreview />
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text variant="titleLarge" style={styles.sectionTitle}>Retos cercanos</Text>
          </View>
          <EcologicalRoutes />
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
});