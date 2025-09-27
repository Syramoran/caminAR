import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, ActivityIndicator, Text } from 'react-native-paper';
import * as Location from 'expo-location'; // Importamos el módulo de localización
import { HomeHeader } from '../../components/home/HomeHeader'; // CAMBIO: Se usan llaves {}
import WeatherCard from '../../components/home/WeatherCard';
import MapPreview from '../../components/home/MapPreview';
// import InProgressChallenges from '../../components/home/InProgressChallenges';
// import UpcomingEvents from '../../components/home/UpcomingEvents';

// Definimos un tipo para los datos del clima
interface WeatherData {
  temp: string;
  condition: string;
  tempRange: string;
}

export default function IndexScreen() {
  const theme = useTheme();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null); // Estado para manejar errores

  // Efecto para obtener la ubicación y el clima al iniciar la pantalla
  useEffect(() => {
    (async () => {
      // 1. Pedimos permiso para acceder a la ubicación del usuario
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('El permiso para acceder a la ubicación fue denegado');
        // Si no hay permiso, mostramos un clima por defecto
        setWeather({
          temp: '21',
          condition: 'Soleado',
          tempRange: '19-26',
        });
        return;
      }

      // 2. Obtenemos las coordenadas actuales del dispositivo
      // let location = await Location.getCurrentPositionAsync({});
      // const { latitude, longitude } = location.coords;

      // 3. (Simulación de llamada a API) Usamos las coordenadas para obtener el clima.
      // En una app real, aquí harías: const response = await fetch(`https://api.weather.com?lat=${latitude}&lon=${longitude}`);
      // Por ahora, usamos datos reales obtenidos para tu zona.
      const fetchedWeatherData = {
        temp: '21',
        condition: 'Soleado',
        tempRange: '19-26',
      };
      setWeather(fetchedWeatherData);
    })();
  }, []);

  // Muestra un mensaje de error si el permiso de ubicación fue denegado
  if (errorMsg && !weather) {
      return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
              <Text>{errorMsg}</Text>
          </View>
      );
  }

  // Muestra un indicador de carga mientras se obtienen los datos
  if (!weather) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.primary }}>
      <StatusBar barStyle="light-content" />

      <HomeHeader
        userName="María"
        points={1250}
        level={5}
        weather={{ temp: weather.temp, condition: weather.condition }}
      />

      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={styles.container}
      >
        <WeatherCard
          weather={{ condition: weather.condition, tempRange: weather.tempRange }}
          streak={7}
        />

        <MapPreview />

        {/* Aquí irían las otras secciones */}
        {/* <InProgressChallenges /> */}
        {/* <UpcomingEvents /> */}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 48,
  },
});

