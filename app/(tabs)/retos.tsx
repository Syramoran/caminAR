import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, StatusBar, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, useTheme, ActivityIndicator, Card, Chip, Modal, Portal, Button, IconButton } from 'react-native-paper'; // Importa los componentes necesarios
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Para iconos
import { useUser, Reto } from '../../context/UserContext'; // Importa Reto también
// Importa ChallengeCard para usarlo en el Modal
import ChallengeCard from '../../components/challenges/ChallengeCard'; // Asegúrate que la ruta sea correcta

const screenHeight = Dimensions.get('window').height;

// --- Componente Tarjeta Resumen ---
const RetoSummaryCard = ({ reto, onPress }: { reto: Reto, onPress: () => void }) => {
  const theme = useTheme();
  // Determinar icono (puedes mejorar esta lógica)
  let iconName = 'trophy-variant-outline';
  if (reto.titulo.toLowerCase().includes('bici')) iconName = 'bike';
  if (reto.titulo.toLowerCase().includes('foto')) iconName = 'camera';
  if (reto.titulo.toLowerCase().includes('recicl')) iconName = 'recycle';
  if (reto.titulo.toLowerCase().includes('camina')) iconName = 'walk';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      {/* Pasamos theme a los estilos de la Card */}
      <Card style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]} mode="elevated">
        <Card.Content style={styles.summaryCardContent}>
          <Icon name={iconName} size={30} color={theme.colors.primary} style={styles.summaryIcon} />
          <View style={styles.summaryTextContainer}>
            <Text variant="titleMedium" numberOfLines={1} ellipsizeMode='tail' style={styles.summaryTitle}>{reto.titulo}</Text>
            {/* Usamos onSurfaceVariant para el color de la descripción */}
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={1} ellipsizeMode='tail'>
              {reto.descripcion}
            </Text>
          </View>
          <Chip
            style={[styles.summaryChip, { backgroundColor: theme.colors.secondaryContainer }]}
            textStyle={[styles.summaryChipText, { color: theme.colors.primary }]}
          >
            +{reto.puntos_otorgados} pts
          </Chip>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

// --- Pantalla Principal ---
export default function RetosScreen() {
  const { challenges, loadingChallenges } = useUser();
  const theme = useTheme(); // theme está disponible aquí
  const [selectedReto, setSelectedReto] = useState<Reto | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Funciones para manejar el modal
  const showModal = (reto: Reto) => {
    setSelectedReto(reto);
    setIsModalVisible(true);
  };
  const hideModal = () => {
    setIsModalVisible(false);
    setTimeout(() => setSelectedReto(null), 300);
  };

  useEffect(() => {
    console.log("[RetosScreen] Status Update:", { loadingChallenges, challengeCount: challenges?.length });
  }, [loadingChallenges, challenges]);


  // Función para renderizar el contenido principal
  const renderContent = () => {
    if (loadingChallenges) {
      return (
        <View style={styles.centeredContainer}>
          <ActivityIndicator animating={true} color={theme.colors.primary} size="large" />
          {/* Aplicamos color inline */}
          <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
            Cargando retos...
          </Text>
        </View>
      );
    }

    if (!challenges || challenges.length === 0) { // Añadida comprobación por si challenges es null/undefined
      return (
        <View style={styles.centeredContainer}>
           {/* Usamos el color onSurfaceVariant */}
          <Icon name="leaf-off" size={48} color={theme.colors.onSurfaceVariant}/>
          {/* Aplicamos color inline */}
          <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
            No hay desafíos disponibles por el momento.
          </Text>
        </View>
      );
    }

    // Ordenar retos por puntos (opcional)
    const sortedChallenges = [...challenges].sort((a, b) => b.puntos_otorgados - a.puntos_otorgados);


    return sortedChallenges.map((reto) => (
      <RetoSummaryCard key={reto.id} reto={reto} onPress={() => showModal(reto)} />
    ));
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.primary }]} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text variant="headlineMedium" style={styles.headerTitle}>Desafíos Ecológicos</Text>
        <Text variant="bodyLarge" style={styles.headerSubtitle}>
          Toca un desafío para ver los detalles
        </Text>
      </View>
      {/* Contenedor principal - Aplicamos backgroundColor inline */}
      <View style={[styles.mainContent, { backgroundColor: theme.colors.background }]}>
        <ScrollView contentContainerStyle={styles.container}>
          {renderContent()}
        </ScrollView>
      </View>

      {/* --- Modal para Detalles del Reto --- */}
      <Portal>
        <Modal
          visible={isModalVisible}
          onDismiss={hideModal}
          // Aseguramos que el contenedor del modal use surface color
          contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
        >
          {/* ScrollView interno del modal */}
          <ScrollView style={styles.modalScrollView}>
            {selectedReto && (
                // Reutilizamos ChallengeCard original dentro del Modal
                // Asegúrate que ChallengeCard espere una prop 'challenge' de tipo 'Reto'
                <ChallengeCard challenge={selectedReto} />
            )}
            {/* Botón Cerrar al final del contenido */}
            <Button onPress={hideModal} style={styles.modalCloseButton} mode="outlined">
              Cerrar
            </Button>
          </ScrollView>
           {/* Botón flotante para cerrar (opcional, si prefieres tenerlo arriba) */}
           <IconButton
                icon="close-circle" // Icono más visible
                size={30}
                onPress={hideModal}
                style={[styles.modalCloseIcon, { backgroundColor: 'rgba(0,0,0,0.1)'}]} // Fondo semitransparente
                iconColor={theme.colors.onSurface} // Color del icono basado en el tema
            />
        </Modal>
      </Portal>

    </SafeAreaView>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    marginTop: 4,
    color: 'white',
    opacity: 0.9,
  },
  mainContent: {
      flex: 1,
      // backgroundColor se aplica inline
  },
  container: { // Estilo para el *contenido* del ScrollView
    padding: 16,
    paddingBottom: 48, // Espacio al final
    flexGrow: 1, // Importante para que funcione el centrado vertical si no hay suficiente contenido
  },
  centeredContainer: { // Para centrar el loader o el mensaje vacío
    flex: 1, // Ocupa todo el espacio del ScrollView
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: screenHeight * 0.6, // Altura mínima
  },
  infoText: { // Estilo común para texto de carga o vacío
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    // color se aplica inline
  },
  // Estilos para la tarjeta resumen
  summaryCard: {
    marginBottom: 12,
    // backgroundColor se aplica inline
  },
  summaryCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12, // Ajusta el padding vertical
    paddingHorizontal: 16, // Ajusta el padding horizontal
  },
  summaryIcon: {
    marginRight: 16,
  },
  summaryTextContainer: {
    flex: 1,
    marginRight: 12,
  },
   summaryTitle: {
      fontWeight: '600', // Un poco más de peso
      marginBottom: 2, // Espacio ligero debajo del título
  },
  summaryChip: {
      paddingHorizontal: 4, // Padding más ajustado
      height: 28, // Altura ajustada
      alignItems: 'center',
      justifyContent: 'center',
      // backgroundColor se aplica inline
  },
  summaryChipText: {
      fontSize: 12, // Texto más pequeño
      fontWeight: 'bold',
      // color se aplica inline
  },
  // Estilos para el Modal
  modalContainer: {
    marginHorizontal: 15, // Márgenes laterales
    marginVertical: 40,   // Márgenes superior/inferior
    padding: 0, // Quitamos padding aquí, lo maneja el ScrollView interno
    borderRadius: 15,
    maxHeight: '90%', // Límite de altura
    overflow: 'hidden', // Asegura que el borde redondeado recorte el contenido
  },
  modalScrollView: {
     padding: 20, // Padding dentro del ScrollView del modal
  },
  modalCloseButton: {
    marginTop: 25, // Más espacio arriba
    marginBottom: 10, // Espacio abajo
    alignSelf: 'center',
  },
   modalCloseIcon: {
      position: 'absolute',
      top: 5, // Más cerca del borde
      right: 5, // Más cerca del borde
      zIndex: 10,
      borderRadius: 15,
      // backgroundColor y iconColor se aplican inline
  },
});

