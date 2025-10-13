import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Datos de ejemplo para las rutas
const routes = [
    { id: '1', name: 'Circuito del Parque Central', distance: '0.3 km', difficulty: 'Fácil', points: 50, icon: 'walk' },
    { id: '2', name: 'Sendero Ribereño', distance: '1.2 km', difficulty: 'Medio', points: 120, icon: 'bike' },
    { id: '3', name: 'Sendero del Bosque', distance: '2.1 km', difficulty: 'Difícil', points: 200, icon: 'hiking' },
];

const RouteItem = ({ route }: any) => (
    <View style={styles.routeItem}>
        <View style={styles.routeIconContainer}>
            <Icon name={route.icon} size={24} color="#333" />
        </View>
        <View style={styles.routeInfo}>
            <Text style={styles.routeName}>{route.name}</Text>
            <Text style={styles.routeDetails}>{route.distance} • {route.difficulty}</Text>
        </View>
        <Chip style={styles.pointsChip}>+{route.points} pts</Chip>
    </View>
);


export default function EcologicalRoutes() {
  return (
    <Card style={styles.card}>
        <Card.Content>
            <View style={styles.header}>
                <Icon name="map-marker-path" size={24} color="#333" />
                <Text style={styles.title}>Rutas Ecológicas Cercanas</Text>
            </View>
            <Text style={styles.subtitle}>Descubre senderos eco-amigables a tu alrededor</Text>

            {/* Aquí puedes agregar la imagen decorativa del mapa si lo deseas */}
            {/* <Image source={...} style={styles.mapImage} /> */}

            {routes.map(route => <RouteItem key={route.id} route={route} />)}

        </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    marginBottom: 24,
  },
  header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  subtitle: {
    color: '#666',
    marginBottom: 16,
  },
  routeItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f9f9f9',
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
  },
  routeIconContainer: {
      backgroundColor: '#e9e9e9',
      borderRadius: 20,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
  },
  routeInfo: {
      flex: 1,
  },
  routeName: {
      fontWeight: 'bold',
  },
  routeDetails: {
      color: '#666',
      fontSize: 12,
  },
  pointsChip: {
      backgroundColor: '#D4EDDA', // Un verde claro
  }
});
