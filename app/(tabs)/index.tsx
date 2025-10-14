import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, ActivityIndicator, Text } from 'react-native-paper';
import * as Location from 'expo-location';
import { HomeHeader } from '../../components/home/HomeHeader'; // CORRECCIÓN: Se añadieron las llaves {}
import WeatherCard from '../../components/home/WeatherCard';
import MapPreview from '../../components/home/MapPreview';
import EcologicalRoutes from '../../components/home/EcologicalRoutes';
import ActiveChallenges from '../../components/home/ActiveChallenges';

interface WeatherData {
  temp: string;
  condition: string;
  tempRange: string;
}

export default function IndexScreen() {
  // 1. Obtenemos el tema global. 'theme' ahora contiene todos los colores de tu archivo theme.ts.
  const theme = useTheme();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isNight, setIsNight] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const currentHour = new Date().getHours();
    setIsNight(currentHour < 6 || currentHour >= 19);

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('El permiso para acceder a la ubicación fue denegado');
        setWeather({ temp: '18', condition: 'Parcialmente nublado', tempRange: '15-22' });
        return;
      }
      const fetchedWeatherData = { temp: '18', condition: 'Parcialmente nublado', tempRange: '15-22' };
      setWeather(fetchedWeatherData);
    })();
  }, []);

  // La pantalla de carga ahora también toma su color de fondo del tema.
  if (!weather) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        {/* El ActivityIndicator de react-native-paper usa automáticamente el theme.colors.primary */}
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }

  return (
    // 2. El color de fondo del área segura (la parte superior, detrás de la barra de estado)
    //    proviene del color primario de tu tema.
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.primary } } edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* HomeHeader es un componente hijo, pero también usa useTheme() internamente
          para obtener los colores correctos, garantizando la consistencia. */}
      <HomeHeader />

      {/* 3. El contenedor principal del contenido usa el color de fondo general de tu tema. */}
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ScrollView contentContainerStyle={styles.container}>

          {/* Todos los componentes hijos (WeatherCard, MapPreview, etc.)
              también usan useTheme() para asegurar que sus colores internos
              coincidan con la paleta de theme.ts. */}
          <WeatherCard weather={weather} streak={7} isNight={isNight} />
          <MapPreview />
          <EcologicalRoutes />
          <ActiveChallenges />

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// En los estilos, no se define ningún color fijo. Todo se maneja a través del objeto 'theme'.
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
});

