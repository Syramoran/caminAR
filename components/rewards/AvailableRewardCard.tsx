import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Chip, useTheme } from 'react-native-paper';
import { Reward } from '../../models/types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function AvailableRewardCard({ r }: { r: Reward }) {
  const theme = useTheme();

  return (
    <Card style={styles.card} mode="elevated">
      <View>
        <Card.Cover source={{ uri: r.imageUrl }} style={styles.cover} />
        <View style={styles.overlay}>
          <Chip style={styles.categoryChip} textStyle={{color: 'white'}}>{r.category}</Chip>
          <Chip style={styles.pointsChip} textStyle={{ color: theme.colors.primary, fontWeight: 'bold' }}>{r.pointsRequired} pts</Chip>
        </View>
      </View>
      <Card.Content style={styles.content}>
        <Text variant="titleLarge" style={styles.title}>{r.title}</Text>
        <Text variant="bodyMedium" style={styles.partner}>Por {r.partner}</Text>
        <Text variant="bodyMedium" style={styles.description}>{r.description}</Text>
        <View style={styles.infoRow}>
          <Icon name="calendar-check" size={16} color="#666" />
          <Text style={styles.infoText}>Válido hasta {r.validUntil}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="map-marker" size={16} color="#666" />
          <Text style={styles.infoText}>{r.locations}</Text>
        </View>
        <View style={styles.availability}>
          <Text style={styles.infoText}>Disponibilidad</Text>
          <Text style={styles.availabilityCount}>{r.availability.current} de {r.availability.total}</Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 16, backgroundColor: 'white' },
  cover: { height: 150 },
  overlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryChip: { backgroundColor: 'rgba(0,0,0,0.5)' },
  pointsChip: { backgroundColor: 'white' },
  content: { paddingTop: 16 },
  title: { fontWeight: 'bold', marginBottom: 4 },
  partner: { color: '#666', marginBottom: 8 },
  description: { marginBottom: 16, lineHeight: 21 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoText: { marginLeft: 8, color: '#666' },
  availability: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  availabilityCount: { fontWeight: 'bold', color: '#333' },
});

