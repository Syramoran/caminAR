import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';

export default function MapPreview() {
  const theme = useTheme();
  const router = useRouter();
  const [region, setRegion] = useState<Region | null>(null);

  useEffect(() => {
    (async () => {
      // 1. Pide permiso para acceder a la ubicación
      let { status } = await Location.requestForegroundPermissionsAsync();

      let currentRegion: Region;

      if (status !== 'granted') {
        // 2. Si no hay permiso, usa una ubicación por defecto
        console.log('Permiso de ubicación denegado, usando ubicación por defecto.');
        currentRegion = {
          latitude: -31.394,
          longitude: -58.018,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        };
      } else {
        // 3. Si hay permiso, obtiene la ubicación actual del usuario
        try {
            const location = await Location.getCurrentPositionAsync({});
            currentRegion = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
            };
        } catch (error) {
            console.error("No se pudo obtener la ubicación, usando la de por defecto", error);
            currentRegion = { // Fallback por si falla la obtención de la ubicación
                latitude: -31.394,
                longitude: -58.018,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
            };
        }
      }
      setRegion(currentRegion);
    })();
  }, []);

  return (
    // El TouchableOpacity hace que toda la tarjeta sea un botón para navegar al mapa completo
    <TouchableOpacity onPress={() => router.push('/mapa')}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>Mapa Interactivo</Text>
          <Text style={styles.subtitle}>Explora rutas y puntos de interés cerca de ti</Text>
          <View style={styles.mapContainer}>
            {/* 4. Muestra un indicador de carga mientras se obtiene la ubicación */}
            {!region ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator animating={true} />
              </View>
            ) : (
              <MapView
                style={styles.map}
                initialRegion={region}
                pitchEnabled={false}
                rotateEnabled={false}
                scrollEnabled={false}
                zoomEnabled={false}
              >
                {/* Marcador para la ubicación actual del usuario */}
                <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} title="Tu ubicación" />
                {/* Puedes agregar otros marcadores de interés si lo deseas */}
                <Marker coordinate={{ latitude: -31.405, longitude: -58.016 }} pinColor={theme.colors.primary} />
              </MapView>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 24, // Aumentamos el margen inferior
    backgroundColor: 'white',
  },
  title: {
    fontWeight: 'bold',
  },
  subtitle: {
    marginBottom: 16,
    color: '#666',
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0', // Un color de fondo mientras carga el mapa
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

