import React, { useEffect, useState } from "react";
import { Alert, Image, StyleSheet, View, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import MapView, { Marker, Region } from "react-native-maps";
// *** Importar TextInput de react-native-paper ***
import { Appbar, Button, Card, Dialog, Portal, Text, TextInput, useTheme, IconButton } from "react-native-paper";
import { useRouter } from "expo-router";
import { useUser, Reto } from '../context/UserContext';
import { useAuth } from "../context/AuthContext";

export default function MapaScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [region, setRegion] = useState<Region | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<Reto | null>(null);
  // *** Añadir estado para la descripción ***
  const [description, setDescription] = useState('');
  // *** Obtener completedChallengeIds y loadingCompletedChallenges ***
  const { challenges, loadingChallenges, completeChallenge, completedChallengeIds, loadingCompletedChallenges } = useUser();
  const { user } = useAuth();
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    (async () => {
        // ... (lógica de permisos y obtención de ubicación sin cambios) ...
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
          setRegion({ // Fallback a Concordia
            latitude: -31.394,
            longitude: -58.018,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          });
      }
    })();
  }, []);

  const openCamera = async () => {
    // ... (lógica de cámara sin cambios) ...
     const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
     if (!cameraPermission.granted) {
       Alert.alert("Cámara", "Necesitamos permisos de cámara para subir evidencia.");
       return;
     }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7, // Calidad moderada para reducir tamaño
      base64: false, // No necesitamos base64 si usamos la URI
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhoto(result.assets[0].uri);
      setDescription(''); // Limpiar descripción al tomar nueva foto
    }
  };

  // Llama a la función del contexto para completar el reto
  const confirmEvidence = async () => {
    if (!selectedChallenge || !photo || !user) {
        Alert.alert("Error", "Faltan datos para completar el reto.");
        return;
    }

    setIsCompleting(true);
    try {
        console.log(`[MapaScreen] Intentando completar reto ${selectedChallenge.id} con foto ${photo} y descripción "${description}"`);
        // *** Pasar la descripción a completeChallenge ***
        const result = await completeChallenge(selectedChallenge, photo, description);

        if (result.success) {
            Alert.alert(
                "¡Reto Completado!",
                `Has ganado ${selectedChallenge.puntos_otorgados} puntos por completar "${selectedChallenge.titulo}".`
            );
            setPhoto(null);
            setSelectedChallenge(null);
            setDescription(''); // Limpiar descripción
        } else {
            // *** Mostrar mensaje de error del contexto si existe ***
            Alert.alert("Error al completar", result.message || "No se pudo completar el reto. Revisa tu conexión e inténtalo de nuevo.");
        }
    } catch (error: any) {
        console.error("[MapaScreen] Error en confirmEvidence:", error);
        Alert.alert("Error Inesperado", `Ocurrió un problema: ${error.message}`);
    } finally {
        setIsCompleting(false);
    }
  };

   const getPinColor = (challenge: Reto) => {
     // *** NUEVO: Usar gris si ya está completado ***
     if (completedChallengeIds.has(challenge.id)) {
        return theme.colors.backdrop; // Gris o un color que indique completado
     }
     if (challenge.puntos_otorgados >= 200) return theme.colors.error;
     if (challenge.puntos_otorgados >= 100) return theme.colors.primary;
     return theme.colors.secondary;
   };

  // *** Mostrar carga si aún no se cargaron los retos completados ***
  if (!region || loadingChallenges || loadingCompletedChallenges) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating size="large" color={theme.colors.primary}/>
        <Text style={{ marginTop: 16 }}>
            { !region ? "Obteniendo ubicación..." : "Cargando datos..." }
        </Text>
      </View>
    );
  }

  const challengesWithLocation = challenges.filter(c => c.latitud != null && c.longitud != null);

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.BackAction onPress={() => router.back()} color="#fff"/>
        <Appbar.Content title="Mapa Interactivo" titleStyle={{ color: '#fff' }}/>
      </Appbar.Header>
      <MapView style={{ flex: 1 }} initialRegion={region}>
        {challengesWithLocation.map((challenge) => (
          <Marker
            key={challenge.id}
            coordinate={{ latitude: challenge.latitud!, longitude: challenge.longitud! }}
            title={challenge.titulo}
            description={
                completedChallengeIds.has(challenge.id)
                ? '¡Ya completado!'
                : `${challenge.puntos_otorgados} pts`
            }
            pinColor={getPinColor(challenge)}
            // *** Deshabilitar onPress si ya está completado ***
            onPress={() => {
                if (!completedChallengeIds.has(challenge.id)) {
                    setSelectedChallenge(challenge);
                    setPhoto(null); // Asegurar que no hay foto al seleccionar
                    setDescription(''); // Limpiar descripción
                } else {
                    Alert.alert("Reto Completado", "Ya has completado este reto.");
                }
            }}
          />
        ))}
         <Marker coordinate={region} pinColor="blue" title="Tu Ubicación" />
      </MapView>

      {selectedChallenge && !photo && (
        <Card style={styles.bottomCard}>
          <Card.Title
            title={`¿Estás en "${selectedChallenge.titulo}"?`}
            titleVariant="titleMedium"
            subtitle={`${selectedChallenge.puntos_otorgados} Puntos`}
            right={(props) => <IconButton {...props} icon="close-circle" onPress={() => setSelectedChallenge(null)} />}
           />
          <Card.Content>
            <Text variant="bodyMedium">
              Toma una foto como evidencia para completar el reto.
            </Text>
            {selectedChallenge.direccion && (
                 <Text variant="bodySmall" style={{color: theme.colors.backdrop, marginTop: 4 }}>
                     📍 {selectedChallenge.direccion}
                 </Text>
            )}
          </Card.Content>
          <Card.Actions>
            <Button mode="contained" onPress={openCamera} icon="camera" style={{flex: 1}} labelStyle={{fontSize: 16}}>
                Tomar Foto
            </Button>
          </Card.Actions>
        </Card>
      )}

      {/* Modal de confirmación con TextInput para descripción */}
      <Portal>
        <Dialog visible={!!photo} onDismiss={() => { if (!isCompleting) setPhoto(null); }}>
            <Dialog.Title>Confirmar evidencia</Dialog.Title>
            <Dialog.Content>
                {photo && <Image source={{ uri: photo }} style={styles.modalImage} />}
                {/* *** Añadir TextInput para descripción *** */}
                <TextInput
                    label="Añadir comentario (opcional)"
                    value={description}
                    onChangeText={setDescription}
                    mode="outlined"
                    style={styles.descriptionInput}
                    multiline
                    numberOfLines={2}
                    disabled={isCompleting}
                />
                {isCompleting && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={{marginTop: 10}}>Completando reto...</Text>
                    </View>
                )}
            </Dialog.Content>
            <Dialog.Actions>
                <Button onPress={() => setPhoto(null)} disabled={isCompleting}>Cancelar</Button>
                <Button mode="contained" onPress={confirmEvidence} disabled={isCompleting} loading={isCompleting}>
                    {isCompleting ? 'Enviando...' : 'Confirmar'}
                </Button>
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
    left: 10,
    right: 10,
    bottom: 10,
    elevation: 8,
    borderRadius: 15,
    backgroundColor: 'white',
  },
  modalImage: {
    width: '100%',
    height: 200, // Reducir un poco para dar espacio al input
    borderRadius: 8,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  // *** Estilo para el TextInput de descripción ***
  descriptionInput: {
      marginTop: 10,
      marginBottom: 15,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  }
});

