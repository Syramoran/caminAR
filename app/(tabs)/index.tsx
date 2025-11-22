import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, ActivityIndicator, Text } from 'react-native-paper';
import * as Location from 'expo-location';
import { HomeHeader } from '../../components/home/HomeHeader';
import WeatherCard from '../../components/home/WeatherCard';
import MapPreview from '../../components/home/MapPreview';
import EcologicalRoutes from '../../components/home/EcologicalRoutes';
// Se eliminó la importación de ActiveChallenges

// Interfaz para los datos que *realmente* usaremos
interface WeatherData {
  temp: string;
  condition: string;
  tempMin: string;
  tempMax: string;
}

// Interfaz que coincide parcialmente con la respuesta de Open-Meteo
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
    0: 'Despejado',
    1: 'Principalmente despejado',
    2: 'Parcialmente nublado',
    3: 'Nublado',
    45: 'Niebla',
    48: 'Niebla engelante',
    51: 'Llovizna ligera',
    53: 'Llovizna moderada',
    55: 'Llovizna densa',
    56: 'Llovizna helada ligera',
    57: 'Llovizna helada densa',
    61: 'Lluvia ligera',
    63: 'Lluvia moderada',
    65: 'Lluvia fuerte',
    66: 'Lluvia helada ligera',
    67: 'Lluvia helada fuerte',
    71: 'Nieve ligera',
    73: 'Nieve moderada',
    75: 'Nieve fuerte',
    77: 'Granos de nieve',
    80: 'Chubascos ligeros',
    81: 'Chubascos moderados',
    82: 'Chubascos violentos',
    85: 'Chubascos de nieve ligeros',
    86: 'Chubascos de nieve fuertes',
    95: 'Tormenta ligera o moderada',
    96: 'Tormenta con granizo ligero',
    99: 'Tormenta con granizo fuerte',
  };
  return descriptions[code] || 'Desconocido';
};


export default function IndexScreen() {
  const theme = useTheme();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isNight, setIsNight] = useState(false);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const currentHour = new Date().getHours();
    setIsNight(currentHour < 6 || currentHour >= 19);

    const fetchWeatherData = async () => {
      setLoadingWeather(true);
      setErrorMsg(null);

      console.log("LOG: Pidiendo permiso de ubicación...");
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setErrorMsg('El permiso para acceder a la ubicación fue denegado.');
        console.warn("LOG: Permiso denegado, usando datos por defecto.");
        setWeather({ temp: '--', condition: 'Permiso denegado', tempMin: '--', tempMax: '--' });
        setLoadingWeather(false);
        return;
      }

      try {
        console.log("LOG: Obteniendo ubicación actual...");
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        console.log(`LOG: Ubicación obtenida: Lat ${latitude}, Lon ${longitude}`);

        // Construye la URL de la API de Open-Meteo
        const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;

        console.log("LOG: Llamando a la API de Open-Meteo...");
        const response = await fetch(apiUrl);

        if (!response.ok) {
           let errorText = `Error ${response.status}: No se pudo obtener el clima`;
           try {
              const errorData = await response.json();
              if (errorData && errorData.reason) {
                errorText += ` - ${errorData.reason}`;
              }
           } catch (jsonError) {
              errorText = `Error ${response.status}: ${response.statusText}`;
           }
           throw new Error(errorText);
        }

        const data: OpenMeteoResponse = await response.json();
        console.log("LOG: Datos del clima recibidos de Open-Meteo:", data);

        if (data.current && data.daily && data.daily.temperature_2m_max && data.daily.temperature_2m_min) {
          const newWeatherData: WeatherData = {
            temp: Math.round(data.current.temperature_2m).toString(),
            condition: getWeatherDescription(data.current.weather_code),
            tempMin: Math.round(data.daily.temperature_2m_min[0]).toString(),
            tempMax: Math.round(data.daily.temperature_2m_max[0]).toString(),
          };
          setWeather(newWeatherData);
        } else {
          throw new Error("La respuesta de la API de Open-Meteo no tiene el formato esperado.");
        }

      } catch (error: any) {
        console.error("LOG: Error al obtener el clima:", error);
        setErrorMsg(`Error al obtener el clima: ${error.message}`);
        setWeather({ temp: 'Error', condition: 'No disponible', tempMin: 'X', tempMax: 'X' });
      } finally {
        setLoadingWeather(false);
      }
    };

    fetchWeatherData();
  }, []);

  if (loadingWeather) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 10, color: theme.colors.onSurfaceVariant }}>
          Obteniendo clima...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.primary }} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <HomeHeader />
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ScrollView contentContainerStyle={styles.container}>
          {weather && (
            <WeatherCard
              weather={{
                temp: weather.temp,
                condition: weather.condition,
                tempRange: `${weather.tempMin}° - ${weather.tempMax}°`
              }}
              streak={7}
              isNight={isNight}
            />
          )}
          {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

          {/* Mapa Interactivo */}
          <MapPreview />

          {/* Rutas Ecológicas / Retos Disponibles */}
          <EcologicalRoutes />

          {/* Sección "ActiveChallenges" eliminada */}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 16,
    paddingBottom: 48,
  },
  errorText: {
      color: 'red',
      textAlign: 'center',
      marginBottom: 16,
      marginHorizontal: 16,
      fontSize: 14,
  }
});