import * as Sharing from 'expo-sharing';
import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { Button, Card, Text, ProgressBar, Chip, useTheme } from 'react-native-paper';
import { Challenge } from '../../models/types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ChallengeCard({ c }: { c: Challenge }) {
  const shot = useRef<ViewShot>(null);
  const theme = useTheme();

  // La funcionalidad de compartir se mantiene intacta
  const shareImage = async () => {
    try {
      const uri = await shot.current?.capture?.();
      if (uri && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(uri, { dialogTitle: '¡Mira mi logro en CaminAR!' });
      }
    } catch (error) {
      console.error("Error al compartir la imagen", error);
    }
  };

  const pct = c.progress ? Math.round((c.progress.current / c.progress.total) * 100) : 0;

  // Renderizado condicional para diferentes botones según el estado
  const renderActions = () => {
    switch (c.status) {
      case 'in_progress':
        return <Button mode="contained" onPress={() => {}} style={styles.actionButton}>Continuar Desafío</Button>;
      case 'available':
        return <Button mode="outlined" onPress={() => {}} style={styles.actionButton}>Iniciar Desafío</Button>;
      case 'completed':
        // La tarjeta completa es la que se puede compartir
        return <Button mode="contained" icon="share-variant" onPress={shareImage} style={styles.actionButton}>Compartir Logro</Button>;
      default:
        return null;
    }
  };

  return (
    // ViewShot envuelve la tarjeta para poder capturarla
    <ViewShot ref={shot} options={{ format: 'png', quality: 0.9 }}>
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          {/* Cabecera con título, puntos y chip "Activo" */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text variant="titleLarge" style={styles.title}>{c.title}</Text>
            </View>
            <View style={styles.headerRight}>
              {c.points && <Text variant="titleLarge" style={[styles.points, { color: theme.colors.primary }]}>+{c.points} pts</Text>}
              {c.status === 'in_progress' && <Chip style={styles.activeChip} textStyle={styles.activeChipText}>Activo</Chip>}
            </View>
          </View>

          <Text variant="bodyMedium" style={styles.description}>{c.description}</Text>

          {/* Tags de categoría y dificultad */}
          {c.tags && (
            <View style={styles.tagsContainer}>
              {c.tags.map(tag => <Chip key={tag} style={styles.chip} textStyle={styles.chipText}>{tag}</Chip>)}
            </View>
          )}

          {/* Información específica para desafíos en progreso */}
          {c.status === 'in_progress' && c.progress && (
            <View style={styles.progressContainer}>
              <View style={styles.progressInfo}>
                  <View style={styles.infoItem}>
                      <Icon name="clock-outline" size={16} color={theme.colors.onSurfaceVariant} />
                      <Text style={styles.infoText}>{c.duration} días</Text>
                  </View>
                  <Text style={styles.progressText}>{c.progress.current}/{c.progress.total}</Text>
              </View>
              <ProgressBar progress={pct / 100} color={theme.colors.primary} style={styles.progressBar} />
            </View>
          )}

          {renderActions()}
        </Card.Content>
      </Card>
    </ViewShot>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  title: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  points: {
    fontWeight: 'bold',
    marginBottom: 4, // Espacio para el chip "Activo" debajo
  },
  description: {
    color: '#666',
    lineHeight: 20, // Mejora la legibilidad
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
    height: 32,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  chipText: {
    fontSize: 12,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 4,
    color: '#666',
  },
  progressText: {
    fontWeight: 'bold',
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    marginTop: 8,
  },
  activeChip: {
    backgroundColor: '#FFD700', // Un color dorado para destacar
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeChipText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 12,
  },
  actionButton: {
    marginTop: 20, // Más espacio sobre el botón
    paddingVertical: 6, // Botones más grandes
    borderRadius: 50, // Bordes completamente redondeados
  },
});

