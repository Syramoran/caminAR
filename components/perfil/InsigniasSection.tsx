import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { Badge, InsigniaItem } from './InsigniaItem'; // Cambiado de BadgeItem

// Datos de ejemplo. En una app real, vendrían de una API o base de datos.
const badgesData: Badge[] = [
  { id: '1', icon: '🌱', title: 'Primer Paso', description: 'Completó su primer reto', unlocked: true },
  { id: '2', icon: '♻️', title: 'Reciclador', description: 'Recicló 50 elementos', unlocked: true },
  { id: '3', icon: '🚶', title: 'Caminante', description: 'Caminó 100 km', unlocked: true },
  { id: '4', icon: '🌳', title: 'Plantador', description: 'Plantó 5 árboles', unlocked: false },
  { id: '5', icon: '👑', title: 'Líder', description: 'Organizó un evento', unlocked: false },
  { id: '6', icon: '📱', title: 'Influencer', description: '100 seguidores', unlocked: true },
];

export const InsigniasSection = () => {
  const unlockedCount = badgesData.filter(b => b.unlocked).length;
  const totalCount = badgesData.length;

  return (
    <Card style={styles.container}>
      <Card.Title
        title="Mis Logros"
        titleVariant="titleLarge"
        subtitle={`${unlockedCount} de ${totalCount} desbloqueados`}
        left={(props) => <Text {...props} style={styles.titleIcon}>🏅</Text>}
      />
      <Card.Content>
        <View style={styles.gridContainer}>
          {badgesData.map(badge => (
            // Cambiado de BadgeItem a InsigniaItem
            <InsigniaItem key={badge.id} badge={badge} />
          ))}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  titleIcon: {
    fontSize: 24,
    marginLeft: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
