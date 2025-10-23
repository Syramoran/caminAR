import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';

// 1. Importar useUser y Reto
import { useUser, Reto } from '../../context/UserContext';

export default function MapPreview() {
  const theme = useTheme();
  const router = useRouter();
  const [region, setRegion] = useState<Region | null>(null);
  // 2. Obtener retos del contexto
  const { challenges, loadingChallenges } = useUser();

  useEffect(() => {
    (async () => {
      console.log("LOG: [MapPreview] Solicitando permiso de ubicación...");
      let { status } = await Location.requestForegroundPermissionsAsync();

      let currentRegion: Region;

      if (status !== 'granted') {
        console.warn('LOG: [MapPreview] Permiso de ubicación denegado, usando ubicación por defecto.');
        // Alert.alert("Permiso Denegado", "No se pudo acceder a tu ubicación. Mostrando mapa centrado en Concordia.");
        currentRegion = {
          latitude: -31.394, // Concordia, Entre Ríos
          longitude: -58.018,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        };
      } else {
        console.log("LOG: [MapPreview] Permiso concedido. Obteniendo ubicación actual...");
        try {
          const location = await Location.getCurrentPositionAsync({});
          currentRegion = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          };
          console.log(`LOG: [MapPreview] Ubicación obtenida: ${currentRegion.latitude}, ${currentRegion.longitude}`);
        } catch (error) {
          console.error("LOG: [MapPreview] Error al obtener ubicación:", error);
           Alert.alert("Error de Ubicación", "No se pudo obtener tu ubicación actual. Mostrando ubicación por defecto.");
          currentRegion = { // Fallback a Concordia
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

  // 3. Filtrar retos con ubicación válida
  const challengesWithLocation = challenges.filter(c => c.latitud != null && c.longitud != null);
  console.log(`LOG: [MapPreview] Número de retos con ubicación: ${challengesWithLocation.length}`);

  // Función para determinar el color del marcador (ejemplo)
   const getPinColor = (challenge: Reto) => {
     if (challenge.puntos_otorgados >= 200) return theme.colors.error; // Rojo para retos difíciles
     if (challenge.puntos_otorgados >= 100) return theme.colors.primary; // Verde para normales
     return theme.colors.secondary; // Lima para fáciles
   };


  return (
    <TouchableOpacity onPress={() => router.push('/mapa')} activeOpacity={0.7}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>Mapa Interactivo</Text>
          <Text style={styles.subtitle}>Explora rutas y puntos de interés cerca de ti</Text>
          <View style={styles.mapContainer}>
            {/* 6. Mostrar carga si la región O los retos no están listos */}
            {!region || loadingChallenges ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator animating={true} color={theme.colors.primary}/>
                <Text style={{marginTop: 8, color: theme.colors.backdrop}}>
                  { !region ? "Obteniendo ubicación..." : "Cargando retos..."}
                </Text>
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
                {/* Marcador para la ubicación actual del usuario (opcional) */}
                <Marker
                    coordinate={{ latitude: region.latitude, longitude: region.longitude }}
                    title="Tu ubicación"
                    pinColor="blue" // Un color distintivo para el usuario
                />

                {/* 4. Mapear retos con ubicación para crear Markers */}
                {challengesWithLocation.map((challenge) => (
                  <Marker
                    key={challenge.id}
                    coordinate={{ latitude: challenge.latitud!, longitude: challenge.longitud! }}
                    title={challenge.titulo}
                    description={`${challenge.puntos_otorgados} pts`} // Descripción corta
                    pinColor={getPinColor(challenge)} // Color primario del tema
                  />
                ))}
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
    marginBottom: 24,
    backgroundColor: 'white',
    elevation: 2, // Sombra sutil
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
    backgroundColor: '#e0e0e0',
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
