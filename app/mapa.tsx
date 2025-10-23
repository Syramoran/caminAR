import React, { useEffect, useState } from "react";
import { Alert, Image, StyleSheet, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import MapView, { Marker, Region } from "react-native-maps";
import { ActivityIndicator, Appbar, Button, Card, Dialog, Portal, Text, useTheme } from "react-native-paper";
import { useRouter } from "expo-router";

// Importa useUser y la interfaz Reto del contexto global
import { useUser, Reto } from '../context/UserContext';
// Ya no necesitamos MOCK_POINTS ni MapPoint

export default function MapaScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [region, setRegion] = useState<Region | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  // Cambiamos selectedPoint por selectedChallenge
  const [selectedChallenge, setSelectedChallenge] = useState<Reto | null>(null);
  // Obtenemos los retos y el estado de carga del UserContext
  const { challenges, loadingChallenges } = useUser();
  // Ya no necesitamos updateProgress ni completeWithPhoto directamente aquí

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso requerido", "Necesitamos tu ubicación para mostrarte puntos cercanos.");
        setRegion({
          latitude: -31.394, // Concordia, Entre Ríos (default)
          longitude: -58.018,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        });
        return;
      }
      try {
        const loc = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        });
      } catch (error) {
         console.error("Error getting current location:", error);
         Alert.alert("Error de Ubicación", "No se pudo obtener tu ubicación actual. Mostrando ubicación por defecto.");
          setRegion({ // Fallback a Concordia si falla getCurrentPositionAsync
            latitude: -31.394,
            longitude: -58.018,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          });
      }
    })();
  }, []);

  const openCamera = async () => {
    // Permisos y lógica de cámara sin cambios
     const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
     if (!cameraPermission.granted) {
       Alert.alert("Cámara", "Necesitamos permisos de cámara para subir evidencia.");
       return;
     }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaType.Images, // API Moderna
      allowsEditing: true,
      aspect: [4, 3], // O ajusta según necesites
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhoto(result.assets[0].uri);
    }
  };

  // Esta función necesita lógica para actualizar el estado en Supabase (tabla retos_completados)
  // Por ahora, solo muestra un mensaje y cierra el modal/tarjeta.
  const confirmEvidence = () => {
    if (!selectedChallenge) return;

    // TODO: Implementar lógica para marcar el reto como completado en Supabase
    // 1. Obtener el ID del usuario actual (desde useAuth o useUser)
    // 2. Insertar un registro en la tabla 'retos_completados' con usuario_id y reto_id (selectedChallenge.id)
    // 3. Opcionalmente, incrementar 'completaciones_actuales' en la tabla 'retos' si max_completaciones > 1
    // 4. Opcionalmente, actualizar 'puntaje_total' en la tabla 'usuarios'
    // 5. Considerar manejo de errores y feedback al usuario
    console.log(`Simulando completar reto: ${selectedChallenge.titulo} (ID: ${selectedChallenge.id})`);
    console.log(`Foto URI: ${photo}`);

    setPhoto(null);
    setSelectedChallenge(null);
    Alert.alert("¡Evidencia Registrada!", "Tu participación ha sido registrada (simulación).");
  };

  // Función para determinar el color del marcador (ejemplo)
  // Podrías basarlo en puntos_otorgados o tipo si tuvieras tipos
   const getPinColor = (challenge: Reto) => {
     if (challenge.puntos_otorgados >= 200) return theme.colors.error; // Rojo para retos difíciles
     if (challenge.puntos_otorgados >= 100) return theme.colors.primary; // Verde para normales
     return theme.colors.secondary; // Lima para fáciles
   };


  // Muestra carga si la región o los retos aún no están listos
  if (!region || loadingChallenges) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating size="large" color={theme.colors.primary}/>
        <Text style={{ marginTop: 16 }}>
            { !region ? "Obteniendo ubicación..." : "Cargando retos..." }
        </Text>
      </View>
    );
  }

  // Filtra los retos que tienen coordenadas válidas
  const challengesWithLocation = challenges.filter(c => c.latitud != null && c.longitud != null);

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.BackAction onPress={() => router.back()} color="#fff"/>
        <Appbar.Content title="Mapa Interactivo" titleStyle={{ color: '#fff' }}/>
      </Appbar.Header>
      <MapView style={{ flex: 1 }} initialRegion={region}>
        {/* Mapea los retos con ubicación para crear los Markers */}
        {challengesWithLocation.map((challenge) => (
          <Marker
            key={challenge.id}
            coordinate={{ latitude: challenge.latitud!, longitude: challenge.longitud! }}
            title={challenge.titulo}
            description={`${challenge.puntos_otorgados} pts - ${challenge.descripcion.substring(0, 50)}...`} // Muestra puntos y descripción corta
            pinColor={getPinColor(challenge)} // Color basado en puntos (ejemplo)
            onPress={() => setSelectedChallenge(challenge)} // Guarda el reto seleccionado
          />
        ))}
         {/* Marcador opcional para la ubicación actual del usuario */}
         <Marker coordinate={region} pinColor="blue" title="Tu Ubicación" />
      </MapView>

      {/* Tarjeta inferior para el reto seleccionado */}
      {selectedChallenge && (
        <Card style={styles.bottomCard}>
          <Card.Title title={`¿Estás en "${selectedChallenge.titulo}"?`} titleVariant="titleMedium" subtitle={`${selectedChallenge.puntos_otorgados} Puntos`} />
          <Card.Content>
            <Text variant="bodyMedium">
              Subí una foto como evidencia para completar el reto.
            </Text>
            {selectedChallenge.direccion && (
                 <Text variant="bodySmall" style={{color: theme.colors.backdrop, marginTop: 4 }}>
                     📍 {selectedChallenge.direccion}
                 </Text>
            )}
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => setSelectedChallenge(null)}>Cancelar</Button>
            <Button mode="contained" onPress={openCamera} icon="camera">Abrir cámara</Button>
          </Card.Actions>
        </Card>
      )}

      {/* Modal de confirmación (sin cambios en la estructura, solo en la lógica de confirmEvidence) */}
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
    bottom: 32, // Ajusta si se superpone con la barra de pestañas
    elevation: 4,
    backgroundColor: 'white', // Asegura fondo blanco
  },
  modalImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    resizeMode: 'contain', // Ajusta cómo se muestra la imagen
  },
});
