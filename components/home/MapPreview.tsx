import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';

export default function MapPreview() {
  const theme = useTheme();
  const router = useRouter();

  // Coordenadas fijas para la vista previa
  const previewRegion = {
    latitude: -31.394,
    longitude: -58.018,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  return (
    <TouchableOpacity onPress={() => router.push('/mapa')}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>Mapa Interactivo</Text>
          <Text style={styles.subtitle}>Explora rutas y puntos de interés cerca de ti</Text>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={previewRegion}
              pitchEnabled={false}
              rotateEnabled={false}
              scrollEnabled={false}
              zoomEnabled={false}
            >
                <Marker coordinate={{ latitude: -31.394, longitude: -58.018 }} pinColor={theme.colors.tertiary} />
                <Marker coordinate={{ latitude: -31.405, longitude: -58.016 }} pinColor={theme.colors.primary} />
            </MapView>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
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
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
