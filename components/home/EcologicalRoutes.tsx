import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Chip, ActivityIndicator, useTheme } from 'react-native-paper'; // Import ActivityIndicator y useTheme
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useUser, Reto } from '../../context/UserContext'; // Importa useUser y la interfaz Reto

// Componente para mostrar un item de reto (anteriormente RouteItem)
// Ahora recibe un objeto 'Reto'
const ChallengeItem = ({ challenge }: { challenge: Reto }) => {
  const theme = useTheme();

  // Determinar un icono basado en el título o tipo (ejemplo simple)
  let iconName = 'walk'; // Icono por defecto
  if (challenge.titulo.toLowerCase().includes('bici')) iconName = 'bike';
  if (challenge.titulo.toLowerCase().includes('foto')) iconName = 'camera';
  if (challenge.titulo.toLowerCase().includes('recicl')) iconName = 'recycle';

  return (
    <View style={styles.routeItem}>
        <View style={styles.routeIconContainer}>
            {/* Usa el icono determinado */}
            <Icon name={iconName} size={24} color="#333" />
        </View>
        <View style={styles.routeInfo}>
            {/* Usa el título del reto */}
            <Text style={styles.routeName}>{challenge.titulo}</Text>
            {/* Muestra descripción o dirección si existe */}
            <Text style={styles.routeDetails} numberOfLines={1} ellipsizeMode="tail">
                {challenge.descripcion || challenge.direccion || 'Detalles no disponibles'}
            </Text>
        </View>
        {/* Muestra los puntos otorgados */}
        <Chip style={[styles.pointsChip, { backgroundColor: theme.colors.secondaryContainer }]}>+{challenge.puntos_otorgados} pts</Chip>
    </View>
  );
};


export default function EcologicalRoutes() {
  const { challenges, loadingChallenges } = useUser(); // Obtiene los retos y el estado de carga
  const theme = useTheme();

  return (
    <Card style={styles.card}>
        <Card.Content>
            <View style={styles.header}>
                <Icon name="map-marker-path" size={24} color="#333" />
                {/* Cambiamos el título para reflejar que son retos */}
                <Text style={styles.title}>Retos Cercanos / Disponibles</Text>
            </View>
            <Text style={styles.subtitle}>Descubre y completa retos a tu alrededor</Text>

            {/* Muestra indicador de carga si loadingChallenges es true */}
            {loadingChallenges ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator animating={true} color={theme.colors.primary} />
                    <Text style={{ marginTop: 8, color: theme.colors.backdrop }}>Cargando retos...</Text>
                </View>
            // Muestra mensaje si no hay retos después de cargar
            ) : challenges.length === 0 ? (
                <Text style={{ textAlign: 'center', color: theme.colors.backdrop, marginVertical: 20 }}>
                    No hay retos activos disponibles por el momento.
                </Text>
            // Mapea y muestra los retos si existen
            ) : (
                challenges.map(challenge => <ChallengeItem key={challenge.id} challenge={challenge} />)
            )}

        </Card.Content>
    </Card>
  );
}

// Estilos (se mantienen similares, se añade loadingContainer)
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
      marginRight: 8, // Añade margen para que no se pegue al chip
  },
  routeName: {
      fontWeight: 'bold',
  },
  routeDetails: {
      color: '#666',
      fontSize: 12,
  },
  pointsChip: {
      // backgroundColor: '#D4EDDA', // Color se define inline con theme
  },
  loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 20,
  }
});
