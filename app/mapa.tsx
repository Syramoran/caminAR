import React, { useEffect, useState } from "react";
import { Alert, Image, StyleSheet, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import MapView, { Marker, Region } from "react-native-maps";
import { ActivityIndicator, Appbar, Button, Card, Dialog, Portal, Text, useTheme } from "react-native-paper";
import { useRouter } from "expo-router";

import { useChallenges } from "../hooks/useChallenges";
import { MOCK_POINTS } from "../models/mocks";
import { MapPoint } from "../models/types";

export default function MapaScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [region, setRegion] = useState<Region | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
  const { updateProgress, challenges, completeWithPhoto } = useChallenges();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso requerido", "Necesitamos tu ubicación para mostrarte puntos cercanos.");
        // Si se deniega el permiso, se centra en una ubicación por defecto
        setRegion({
          latitude: -31.394,
          longitude: -58.018,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        });
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    })();
  }, []);

  const openCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert("Cámara", "Necesitamos permisos de cámara para subir evidencia.");
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!res.canceled) {
      const uri = res.assets?.[0]?.uri;
      setPhoto(uri ?? null);
    }
  };

  const confirmEvidence = () => {
    if (!selectedPoint) return;
    if (selectedPoint.challengeIds?.length) {
      selectedPoint.challengeIds.forEach((cid) => updateProgress(cid, 1));
    }
    challenges.filter(c => c.type === "photo_task").forEach(c => completeWithPhoto(c.id));

    setPhoto(null);
    setSelectedPoint(null);
    Alert.alert("¡Listo!", "Se registró tu evidencia y se actualizó el progreso.");
  };

  /**
   * Asigna un color a cada chincheta según su tipo.
   * @param kind - El tipo de punto de interés ('recycle_bin', 'event', 'poi').
   * @returns Un color del tema de la aplicación.
   */
  const getPinColor = (kind: MapPoint["kind"]) => {
    switch (kind) {
      case "recycle_bin":
        return theme.colors.primary; // Verde oscuro para reciclaje
      case "event":
        return theme.colors.tertiary; // Naranja para eventos
      case "poi":
        return theme.colors.secondary; // Verde claro para otros puntos
      default:
        return "red"; // Color por defecto si no se especifica
    }
  };

  if (!region) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating size="large" />
        <Text style={{ marginTop: 16 }}>Cargando mapa...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Mapa Interactivo" />
      </Appbar.Header>
      <MapView style={{ flex: 1 }} initialRegion={region}>
        {MOCK_POINTS.map((p) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.latitude, longitude: p.longitude }}
            title={p.title}
            description={p.description}
            pinColor={getPinColor(p.kind)} // Aplicamos el color dinámico aquí
            onPress={() => setSelectedPoint(p)}
          />
        ))}
      </MapView>

      {/* Tarjeta inferior rediseñada con componentes de Paper */}
      {selectedPoint && (
        <Card style={styles.bottomCard}>
          <Card.Title title={`¿Estás en "${selectedPoint.title}"?`} titleVariant="titleMedium" />
          <Card.Content>
            <Text variant="bodyMedium">
              Subí una foto como evidencia para sumar progreso.
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => setSelectedPoint(null)}>Cancelar</Button>
            <Button mode="contained" onPress={openCamera} icon="camera">Abrir cámara</Button>
          </Card.Actions>
        </Card>
      )}

      {/* Modal de confirmación rediseñado con Dialog de Paper */}
      <Portal>
        <Dialog visible={!!photo} onDismiss={() => setPhoto(null)}>
            <Dialog.Title>Confirmar evidencia</Dialog.Title>
            <Dialog.Content>
                {photo && <Image source={{ uri: photo }} style={styles.modalImage} />}
            </Dialog.Content>
            <Dialog.Actions>
                <Button onPress={() => setPhoto(null)}>Cancelar</Button>
                <Button mode="contained" onPress={confirmEvidence}>Confirmar</Button>
            </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 32,
    elevation: 4,
  },
  modalImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
});
