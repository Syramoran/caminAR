import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, ActivityIndicator, Text } from 'react-native-paper';
import * as Location from 'expo-location';
import { HomeHeader } from '../../components/home/HomeHeader';
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

  if (!weather) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.primary }}>
      <StatusBar barStyle="light-content" />

      <HomeHeader />

      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ScrollView contentContainerStyle={styles.container}>

          <WeatherCard weather={weather} streak={7} isNight={isNight} />
          <MapPreview />
          <EcologicalRoutes />
          <ActiveChallenges />

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
});

