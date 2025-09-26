
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { Alert, Image, Modal, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { theme } from "../constants/theme";
import { MOCK_POINTS } from "../models/mocks";
import { useChallenges } from "../hooks/useChallenges";

export default function MapaScreen() {
  const [region, setRegion] = useState<Region | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const { updateProgress, challenges, completeWithPhoto } = useChallenges();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso requerido", "Necesitamos tu ubicación para mostrarte puntos cercanos.");
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
    const point = MOCK_POINTS.find((p) => p.id === selectedPoint);
    if (point?.challengeIds?.length) {
      point.challengeIds.forEach((cid) => updateProgress(cid, 1));
    }
    // Opcional: si hay retos de foto disponibles, marcarlos completos al subir evidencia
    challenges.filter(c => c.type === "photo_task").forEach(c => completeWithPhoto(c.id));

    setPhoto(null);
    setSelectedPoint(null);
    Alert.alert("¡Listo!", "Se registró tu evidencia y se actualizó el progreso.");
  };

  if (!region) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: theme.colors.text }}>Cargando mapa…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }} initialRegion={region}>
        {MOCK_POINTS.map((p) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.latitude, longitude: p.longitude }}
            title={p.title}
            description={p.description}
            onPress={() => setSelectedPoint(p.id)}
          />
        ))}
      </MapView>

      {selectedPoint && (
        <View style={{
          position: "absolute", left: 16, right: 16, bottom: 16,
          backgroundColor: "#fff", borderRadius: 16, padding: 16,
          shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, elevation: 3
        }}>
          <Text style={{ fontWeight: "800", color: theme.colors.text, marginBottom: 6 }}>¿Estás en el punto?</Text>
          <Text style={{ color: theme.colors.text, marginBottom: 10 }}>
            Subí una foto como evidencia para sumar progreso.
          </Text>
          <TouchableOpacity onPress={openCamera} style={{ backgroundColor: theme.colors.primary, padding: 12, borderRadius: 12, alignItems: "center" }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>Abrir cámara</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={!!photo} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "#00000088", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, width: "90%" }}>
            <Text style={{ color: theme.colors.text, fontWeight: "800", marginBottom: 8 }}>Confirmar evidencia</Text>
            {photo ? <Image source={{ uri: photo }} style={{ width: "100%", height: 380, borderRadius: 12 }} /> : null}
            <View style={{ marginTop: 12, flexDirection: "row", gap: 12, justifyContent: "space-between" }}>
              <TouchableOpacity onPress={confirmEvidence} style={{ backgroundColor: theme.colors.primary, padding: 12, borderRadius: 12, flex: 1, alignItems: "center" }}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>Confirmar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setPhoto(null)} style={{ padding: 12, borderRadius: 12, flex: 1, alignItems: "center", borderWidth: 1, borderColor: theme.colors.tertiary }}>
                <Text style={{ color: theme.colors.tertiary, fontWeight: "800" }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
