import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, View, StatusBar, TouchableOpacity, Dimensions, Alert, Image, ActivityIndicator as RNActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// *** Importar TextInput de react-native-paper ***
import { Text, useTheme, ActivityIndicator, Card, Chip, Modal, Portal, Button, IconButton, TextInput } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
// *** Obtener completedChallengeIds y loadingCompletedChallenges ***
import { useUser, Reto } from '../../context/UserContext';
import { useAuth } from '../../context/AuthContext';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

const screenHeight = Dimensions.get('window').height;

// --- Componente de Tarjeta de Reto ---
// *** Añadir prop isCompleted y estilo visual ***
const RetoCard = ({ reto, onPress, isCompleted }: { reto: Reto, onPress: () => void, isCompleted: boolean }) => {
  const theme = useTheme();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={isCompleted ? 1 : 0.8} disabled={isCompleted}>
      <Card style={[styles.summaryCard, { backgroundColor: theme.colors.surface }, isCompleted && styles.completedCard]} mode="elevated">
        <View style={isCompleted && styles.completedOverlay} />
        {isCompleted && <Icon name="check-decagram" size={40} color={theme.colors.primary} style={styles.completedIcon} />}
        <Card.Cover source={{ uri: `https://picsum.photos/seed/${reto.id}/700/400` }} style={isCompleted && styles.completedImage} />
        <Card.Content style={styles.summaryCardContent}>
          <View style={styles.summaryTextContainer}>
            <Text variant="titleLarge" style={styles.summaryTitle}>{reto.titulo}</Text>
            <Text variant="bodyMedium" style={{ color: isCompleted ? theme.colors.backdrop : theme.colors.onSurfaceVariant }} numberOfLines={2}>
              {reto.descripcion}
            </Text>
          </View>
          <View style={styles.chipContainer}>
            <Chip
              icon="star"
              style={[styles.summaryChip, { backgroundColor: isCompleted ? theme.colors.surfaceVariant : theme.colors.secondaryContainer }]}
              textStyle={[styles.summaryChipText, { color: isCompleted ? theme.colors.onSurfaceVariant : theme.colors.primary }]}
            >
              +{reto.puntos_otorgados} pts
            </Chip>
            {reto.latitud && reto.longitud && (
                 <Chip
                   icon="map-marker"
                   style={[styles.summaryChip, { backgroundColor: isCompleted ? theme.colors.surfaceVariant : theme.colors.tertiaryContainer, marginLeft: 5 }]}
                   textStyle={[styles.summaryChipText, { color: isCompleted ? theme.colors.onSurfaceVariant : theme.colors.onTertiaryContainer, fontSize: 11 }]}
                 >
                   Mapa
                 </Chip>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

// --- Pantalla Principal de Retos ---
export default function RetosScreen() {
  // *** Obtener completedChallengeIds y loadingCompletedChallenges ***
  const { challenges, loadingChallenges, completeChallenge, completedChallengeIds, loadingCompletedChallenges } = useUser();
  const { user } = useAuth();
  const theme = useTheme();
  const [selectedReto, setSelectedReto] = useState<Reto | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  // *** Añadir estado para descripción ***
  const [description, setDescription] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);
  const shot = useRef<ViewShot>(null);

  useEffect(() => {
    console.log("LOG: [RetosScreen] Estado inicializado.");
  }, []);

  // *** Modificar log para incluir estado de completados ***
  useEffect(() => {
    console.log("LOG: [RetosScreen] Actualización de estado:", { loadingChallenges, challengeCount: challenges?.length, loadingCompleted: loadingCompletedChallenges, completedCount: completedChallengeIds?.size });
  }, [loadingChallenges, challenges, loadingCompletedChallenges, completedChallengeIds]);

  const showModal = (reto: Reto) => {
    // *** Verificar si ya está completado antes de abrir ***
    if (completedChallengeIds.has(reto.id)) {
        Alert.alert("Reto Completado", "Ya has completado este reto anteriormente.");
        return;
    }
    console.log(`LOG: [RetosScreen] Abriendo modal para el reto: "${reto.titulo}"`);
    setSelectedReto(reto);
    setIsModalVisible(true);
    setPhoto(null);
    setDescription(''); // Limpiar descripción
    setIsCompleting(false);
  };

  const hideModal = () => {
    if (!isCompleting) {
        console.log("LOG: [RetosScreen] Cerrando modal.");
        setIsModalVisible(false);
        setSelectedReto(null);
        setPhoto(null);
        setDescription(''); // Limpiar descripción
    }
  };

  const handleComenzarReto = () => {
    if (!selectedReto) return;
    console.log(`LOG: [RetosScreen] El usuario ha comenzado el reto: "${selectedReto.titulo}"`);
    Alert.alert("¡Reto iniciado!", `Ahora puedes completar "${selectedReto.titulo}". Busca la opción al finalizar.`);
    hideModal();
  };

  // handleTomarFotoEvidencia (sin cambios)
  const handleTomarFotoEvidencia = async () => {
    if (!selectedReto) return;
    console.log(`LOG: [RetosScreen] Tomando foto para el reto: "${selectedReto.titulo}"`);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu cámara para verificar el reto.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: false,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      console.log("LOG: [RetosScreen] Foto tomada, URI:", result.assets[0].uri);
      setPhoto(result.assets[0].uri);
    } else {
      console.log("LOG: [RetosScreen] El usuario canceló la captura de foto.");
    }
  };

  // handleConfirmarEvidencia (modificado para pasar descripción)
  const handleConfirmarEvidencia = async () => {
     if (!selectedReto || !photo || !user) {
         Alert.alert("Error", "Faltan datos para completar el reto.");
         return;
     }
     setIsCompleting(true);
     try {
         console.log(`[RetosScreen] Confirmando evidencia para reto ${selectedReto.id} con foto ${photo} y descripción "${description}"`);
         // *** Pasar descripción a completeChallenge ***
         const result = await completeChallenge(selectedReto, photo, description);

         if (result.success) {
             Alert.alert(
                 "¡Reto Completado!",
                 `Has ganado ${selectedReto.puntos_otorgados} puntos por completar "${selectedReto.titulo}".`
             );
             // No cerramos modal para compartir, pero podríamos resetear descripción
             // setDescription('');
         } else {
             // *** Mostrar mensaje de error si existe ***
             Alert.alert("Error al completar", result.message || "No se pudo completar el reto.");
         }
     } catch (error: any) {
         console.error("[RetosScreen] Error en handleConfirmarEvidencia:", error);
         Alert.alert("Error Inesperado", `Ocurrió un problema: ${error.message}`);
     } finally {
         setIsCompleting(false);
     }
  };


  // shareImage (sin cambios)
  const shareImage = async () => {
    if (!photo) {
        Alert.alert("Error", "Primero debes completar el reto con una foto.");
        return;
    }
    try {
      if (shot.current) {
        const localUri = await shot.current.capture?.(); // Captura la vista del modal
        if (localUri) {
          console.log("LOG: [RetosScreen] Compartiendo imagen capturada:", localUri);
          await Sharing.shareAsync(localUri, {
             dialogTitle: `¡Completé el reto "${selectedReto?.titulo}" en CaminAR!`
            });
        } else {
             throw new Error("No se pudo capturar la vista.");
        }
      } else {
         throw new Error("Referencia a ViewShot no encontrada.");
      }
    } catch (error: any) {
      console.error("LOG: [RetosScreen] Error al compartir la imagen:", error);
      Alert.alert("Error", `No se pudo compartir la imagen: ${error.message}`);
    }
  };

  const renderContent = () => {
    // *** Incluir loadingCompletedChallenges en la condición de carga ***
    if (loadingChallenges || loadingCompletedChallenges) {
      return (
        <View style={styles.centeredContainer}>
          <ActivityIndicator animating={true} color={theme.colors.primary} size="large" />
          <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>Cargando datos...</Text>
        </View>
      );
    }

    if (!challenges || challenges.length === 0) {
      return (
        <View style={styles.centeredContainer}>
          <Icon name="leaf-off" size={48} color={theme.colors.onSurfaceVariant} />
          <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>No hay desafíos disponibles.</Text>
        </View>
      );
    }

    // *** Separar retos completados de no completados para mostrarlos diferentemente si se desea, o pasar prop a RetoCard ***
    const sortedChallenges = [...challenges].sort((a, b) => {
        const aCompleted = completedChallengeIds.has(a.id);
        const bCompleted = completedChallengeIds.has(b.id);
        if (aCompleted && !bCompleted) return 1; // Completados al final
        if (!aCompleted && bCompleted) return -1; // No completados al principio
        return 0; // Mantener orden original entre ellos
    });


    return sortedChallenges.map((reto) => (
      <RetoCard
        key={reto.id}
        reto={reto}
        onPress={() => showModal(reto)}
        // *** Pasar si está completado ***
        isCompleted={completedChallengeIds.has(reto.id)}
      />
    ));
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.primary }]} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text variant="headlineMedium" style={styles.headerTitle}>Desafíos Ecológicos</Text>
        <Text variant="bodyLarge" style={styles.headerSubtitle}>Toca un desafío para ver los detalles</Text>
      </View>

      <View style={[styles.mainContent, { backgroundColor: theme.colors.background }]}>
        <ScrollView contentContainerStyle={styles.container}>
          {renderContent()}
        </ScrollView>
      </View>

      {/* --- Modal Mejorado con TextInput --- */}
      <Portal>
        <Modal
          visible={isModalVisible}
          onDismiss={hideModal}
          contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
        >
          <ViewShot ref={shot} options={{ format: 'png', quality: 0.9 }}>
            <ScrollView style={styles.modalScrollView}>
              {selectedReto && (
                <View style={{backgroundColor: theme.colors.surface }}>
                  <Card.Cover source={{ uri: `https://picsum.photos/seed/${selectedReto.id}/700/400` }} />
                  <Card.Content style={styles.modalCardContent}>
                    <Text variant="headlineSmall" style={styles.modalTitle}>{selectedReto.titulo}</Text>
                    <Chip
                      icon="star"
                      style={[styles.summaryChip, { backgroundColor: theme.colors.secondaryContainer, alignSelf: 'flex-start' }]}
                      textStyle={[styles.summaryChipText, { color: theme.colors.primary }]}
                    >
                      +{selectedReto.puntos_otorgados} puntos
                    </Chip>
                    <Text variant="bodyLarge" style={styles.modalDescription}>{selectedReto.descripcion}</Text>

                    {/* Previsualización y TextInput para descripción */}
                    {photo && !isCompleting && (
                      <View>
                        <Text style={styles.previewLabel}>Tu Evidencia:</Text>
                        <Image source={{ uri: photo }} style={styles.previewImage} />
                        {/* *** TextInput para descripción *** */}
                        <TextInput
                            label="Añadir comentario (opcional)"
                            value={description}
                            onChangeText={setDescription}
                            mode="outlined"
                            style={styles.descriptionInput}
                            multiline
                            numberOfLines={3}
                            disabled={isCompleting} // Deshabilitar mientras carga
                        />
                      </View>
                    )}

                     {isCompleting && (
                         <View style={styles.loadingModalContent}>
                             <RNActivityIndicator size="large" color={theme.colors.primary} />
                             <Text style={{marginTop: 10}}>Completando reto...</Text>
                         </View>
                     )}

                  </Card.Content>
                </View>
              )}
            </ScrollView>
          </ViewShot>

          {/* Acciones del Modal */}
          <View style={styles.modalActions}>
             {!photo && !isCompleting && (
                 <>
                    {/* Botón Comenzar ahora es menos prominente o se puede quitar */}
                    {/* <Button onPress={handleComenzarReto} mode="outlined" style={styles.modalButton}>Marcar como iniciado</Button> */}
                    <Button onPress={handleTomarFotoEvidencia} mode="contained" icon="camera" style={styles.modalButton}>Tomar Foto Evidencia</Button>
                 </>
             )}
             {photo && !isCompleting && (
                 <>
                    <Button onPress={handleConfirmarEvidencia} mode="contained" icon="check-circle" style={styles.modalButton} loading={isCompleting} disabled={isCompleting}>Confirmar Evidencia</Button>
                    <Button onPress={shareImage} mode="outlined" icon="share-variant" style={styles.modalButton} disabled={isCompleting}>Compartir Logro</Button>
                 </>
             )}
             {/* Mostrar un estado diferente mientras carga */}
              {isCompleting && (
                  <Text style={{textAlign: 'center', paddingVertical: 10}}>Procesando...</Text>
              )}
          </View>

          <IconButton
            icon="close-circle"
            size={30}
            onPress={hideModal}
            style={styles.modalCloseIcon}
            iconColor={theme.colors.onSurface}
            disabled={isCompleting}
          />
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { paddingHorizontal: 24, paddingBottom: 24, paddingTop: 16 },
  headerTitle: { fontWeight: 'bold', color: 'white' },
  headerSubtitle: { marginTop: 4, color: 'white', opacity: 0.9 },
  mainContent: { flex: 1 },
  container: { padding: 16, paddingBottom: 48, flexGrow: 1 },
  centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, minHeight: screenHeight * 0.6 },
  infoText: { marginTop: 20, fontSize: 16, textAlign: 'center' },
  summaryCard: { marginBottom: 20, overflow: 'hidden' }, // Needed for overlay/icon positioning
  summaryCardContent: { padding: 12 },
  summaryTextContainer: { marginBottom: 12 },
  summaryTitle: { fontWeight: 'bold', marginBottom: 4 },
  chipContainer: { flexDirection: 'row', justifyContent: 'flex-start', flexWrap: 'wrap', alignItems: 'center' },
  summaryChip: { paddingHorizontal: 4, height: 28, alignItems: 'center', justifyContent: 'center', marginRight: 5, marginBottom: 5 },
  summaryChipText: { fontSize: 12, fontWeight: 'bold' },
  modalContainer: { margin: 20, borderRadius: 15, maxHeight: '90%', overflow: 'hidden' },
  modalScrollView: { maxHeight: screenHeight * 0.65 },
  modalCardContent: { padding: 20, paddingBottom: 0 },
  modalTitle: { fontWeight: 'bold', marginBottom: 12 },
  modalDescription: { marginTop: 16, lineHeight: 24, fontSize: 16, marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 15, paddingHorizontal: 10, borderTopWidth: 1, borderColor: '#eee', backgroundColor: 'white' },
  modalButton: { flex: 1, marginHorizontal: 5 },
  modalCloseIcon: { position: 'absolute', top: 5, right: 5, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 15 },
  previewLabel: { fontSize: 14, fontWeight: 'bold', marginTop: 15, marginBottom: 5, color: '#555' },
  previewImage: { width: '100%', height: 180, borderRadius: 12, resizeMode: 'cover', borderWidth: 1, borderColor: '#ddd' },
  descriptionInput: { marginTop: 15, marginBottom: 20 }, // Estilo para el input de descripción
  loadingModalContent: { justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  // *** Estilos para retos completados ***
  completedCard: {
    // backgroundColor: '#e0e0e0', // Un fondo gris claro
  },
  completedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.6)', // Un overlay semitransparente
    zIndex: 1, // Asegura que esté sobre la imagen
  },
   completedIcon: {
      position: 'absolute',
      top: 10,
      right: 10,
      zIndex: 2, // Encima del overlay
   },
  completedImage: {
    // opacity: 0.6, // Hacer la imagen un poco transparente
  },
});

