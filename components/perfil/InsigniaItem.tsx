import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text, useTheme, Chip } from 'react-native-paper';

// Definimos la estructura de datos de una insignia
export interface Badge {
  id: string;
  icon: string; // Usaremos emojis para los íconos
  title: string;
  description: string;
  unlocked: boolean;
}

type Props = {
  badge: Badge;
};

// El error estaba aquí: el nombre del componente debe ser InsigniaItem y debe exportarse
export const InsigniaItem = ({ badge }: Props) => {
  const theme = useTheme();
  const isLocked = !badge.unlocked;

  // Estilo condicional para la insignia bloqueada
  const lockedStyle = { opacity: isLocked ? 0.5 : 1 };

  return (
    <Card style={[styles.card, isLocked && { backgroundColor: '#f0f0f0' }]} mode="outlined">
      <Card.Content style={styles.content}>
        <Text style={[styles.icon, lockedStyle]}>{badge.icon}</Text>
        <Text variant="titleMedium" style={[styles.title, lockedStyle]}>
          {badge.title}
        </Text>
        <Text variant="bodySmall" style={[styles.description, lockedStyle]}>
          {badge.description}
        </Text>
        {badge.unlocked && (
          <Chip
            icon="check"
            style={[styles.chip, { backgroundColor: theme.colors.primary }]}
            textStyle={{ color: 'white' }}
          >
            Desbloqueada
          </Chip>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    marginBottom: 10,
    backgroundColor: 'white',
  },
  content: {
    alignItems: 'center',
    padding: 16,
    minHeight: 160,
    justifyContent: 'space-between',
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    minHeight: 30, // Espacio para la descripción
    marginVertical: 4,
  },
  chip: {
    marginTop: 8,
  },
});
