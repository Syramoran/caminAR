import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, View, StatusBar, TouchableOpacity, Dimensions, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, useTheme, ActivityIndicator, Card, Chip, Modal, Portal, Button, IconButton, ProgressBar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { useUser, Reto } from '../../context/UserContext';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

const screenHeight = Dimensions.get('window').height;

// --- Nuevo Componente de Tarjeta de Reto ---
const RetoCard = ({ reto, onPress }: { reto: Reto, onPress: () => void }) => {
  const theme = useTheme();

  let iconName = 'trophy-variant-outline';
  if (reto.titulo.toLowerCase().includes('bici')) iconName = 'bike';
  if (reto.titulo.toLowerCase().includes('foto')) iconName = 'camera';
  if (reto.titulo.toLowerCase().includes('recicl')) iconName = 'recycle';
  if (reto.titulo.toLowerCase().includes('camina')) iconName = 'walk';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]} mode="elevated">
        <Card.Cover source={{ uri: `https://picsum.photos/700/400?random=${reto.id}` }} />
        <Card.Content style={styles.summaryCardContent}>
          <View style={styles.summaryTextContainer}>
            <Text variant="titleLarge" style={styles.summaryTitle}>{reto.titulo}</Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={2}>
              {reto.descripcion}
            </Text>
          </View>
          <View style={styles.chipContainer}>
            <Chip
              icon="star"
              style={[styles.summaryChip, { backgroundColor: theme.colors.secondaryContainer }]}
              textStyle={[styles.summaryChipText, { color: theme.colors.primary }]}
            >
              +{reto.puntos_otorgados} pts
            </Chip>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

// --- Pantalla Principal de Retos ---
export default function RetosScreen() {
  const { challenges, loadingChallenges } = useUser();
  const theme = useTheme();
  const [selectedReto, setSelectedReto] = useState<Reto | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const shot = useRef<ViewShot>(null);


  useEffect(() => {
    console.log("LOG: [RetosScreen] Estado inicializado.");
  }, []);

  useEffect(() => {
    console.log("LOG: [RetosScreen] Actualización de estado:", { loadingChallenges, challengeCount: challenges?.length });
  }, [loadingChallenges, challenges]);

  const showModal = (reto: Reto) => {
    console.log(`LOG: [RetosScreen] Abriendo modal para el reto: "${reto.titulo}"`);
    setSelectedReto(reto);
    setIsModalVisible(true);
  };

  const hideModal = () => {
    console.log("LOG: [RetosScreen] Cerrando modal.");
    setIsModalVisible(false);
    setSelectedReto(null);
    setPhoto(null);
  };

  const handleComenzarReto = () => {
    console.log(`LOG: [RetosScreen] El usuario ha comenzado el reto: "${selectedReto?.titulo}"`);
    Alert.alert("¡Reto iniciado!", `Ahora puedes completar "${selectedReto?.titulo}".`);
    hideModal();
  };

  const handleFinalizarReto = async () => {
    console.log(`LOG: [RetosScreen] El usuario quiere finalizar el reto: "${selectedReto?.titulo}"`);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu cámara para verificar el reto.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      console.log("LOG: [RetosScreen] Foto tomada, URI:", result.assets[0].uri);
      setPhoto(result.assets[0].uri);
    } else {
      console.log("LOG: [RetosScreen] El usuario canceló la captura de foto.");
    }
  };

  const shareImage = async () => {
    try {
      if (shot.current) {
        const uri = await shot.current.capture?.();
        if (uri) {
          console.log("LOG: [RetosScreen] Compartiendo imagen:", uri);
          await Sharing.shareAsync(uri, { dialogTitle: '¡Mira mi logro en CaminAR!' });
        }
      }
    } catch (error) {
      console.error("LOG: [RetosScreen] Error al compartir la imagen:", error);
      Alert.alert("Error", "No se pudo compartir la imagen.");
    }
  };


  const renderContent = () => {
    if (loadingChallenges) {
      return (
        <View style={styles.centeredContainer}>
          <ActivityIndicator animating={true} color={theme.colors.primary} size="large" />
          <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>Cargando retos...</Text>
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

    return challenges.map((reto) => (
      <RetoCard key={reto.id} reto={reto} onPress={() => showModal(reto)} />
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

      <Portal>
        <Modal
          visible={isModalVisible}
          onDismiss={hideModal}
          contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
        >
          <ViewShot ref={shot} options={{ format: 'png', quality: 0.9 }}>
            <ScrollView style={styles.modalScrollView}>
              {selectedReto && (
                <View>
                  <Card.Cover source={{ uri: `https://picsum.photos/700/400?random=${selectedReto.id}` }} />
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

                    {photo && (
                      <View>
                        <Image source={{ uri: photo }} style={styles.previewImage} />
                        <Button mode="contained" icon="share-variant" onPress={shareImage} style={{marginTop: 10}}>
                          Compartir Logro
                        </Button>
                      </View>
                    )}

                  </Card.Content>
                </View>
              )}
            </ScrollView>
          </ViewShot>

          <View style={styles.modalActions}>
            <Button onPress={handleComenzarReto} mode="outlined">Comenzar Reto</Button>
            <Button onPress={handleFinalizarReto} mode="contained" icon="camera">Finalizar Reto</Button>
          </View>

          <IconButton
            icon="close-circle"
            size={30}
            onPress={hideModal}
            style={styles.modalCloseIcon}
            iconColor={theme.colors.onSurface}
          />
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { paddingHorizontal: 24, paddingBottom: 24 },
  headerTitle: { fontWeight: 'bold', color: 'white' },
  headerSubtitle: { marginTop: 4, color: 'white', opacity: 0.9 },
  mainContent: { flex: 1 },
  container: { padding: 16, paddingBottom: 48, flexGrow: 1 },
  centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, minHeight: screenHeight * 0.6 },
  infoText: { marginTop: 20, fontSize: 16, textAlign: 'center' },
  summaryCard: { marginBottom: 20, },
  summaryCardContent: { padding: 12 },
  summaryTextContainer: { marginBottom: 12 },
  summaryTitle: { fontWeight: 'bold', marginBottom: 4 },
  chipContainer: { flexDirection: 'row', justifyContent: 'flex-end' },
  summaryChip: { paddingHorizontal: 4, height: 28, alignItems: 'center', justifyContent: 'center' },
  summaryChipText: { fontSize: 12, fontWeight: 'bold' },
  modalContainer: { margin: 20, borderRadius: 15, maxHeight: '90%', overflow: 'hidden' },
  modalScrollView: { maxHeight: screenHeight * 0.7 },
  modalCardContent: { padding: 20 },
  modalTitle: { fontWeight: 'bold', marginBottom: 12 },
  modalDescription: { marginTop: 16, lineHeight: 24, fontSize: 16 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-around', padding: 20, borderTopWidth: 1, borderColor: '#eee' },
  modalCloseIcon: { position: 'absolute', top: 5, right: 5, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 15 },
  previewImage: { width: '100%', height: 200, borderRadius: 12, marginTop: 16, resizeMode: 'cover' },
});