import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SegmentedButtons, Card, Button, useTheme } from 'react-native-paper';

// Importaciones de todos los componentes de la sección de perfil
import { ProfileHeader } from '../../components/perfil/ProfileHeader';
import { StatCard } from '../../components/perfil/StatCard';
import { RankingList } from '../../components/perfil/RankingList';
import { StatisticsSection } from '../../components/perfil/StatisticsSection';
import { InsigniasSection } from '../../components/perfil/InsigniasSection';

// --- Pantalla Principal del Perfil ---

export default function PerfilScreen() {
  const [activeTab, setActiveTab] = useState('insignias'); // Inicia en la nueva pestaña
  const theme = useTheme();

  // Función para renderizar el contenido de la solapa activa
  const renderContent = () => {
    switch (activeTab) {
      case 'estadisticas':
        return <StatisticsSection />;
      case 'insignias':
        return <InsigniasSection />;
      case 'ranking':
        return <RankingList />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView>
        <ProfileHeader />

        <View style={styles.container}>
          {/* Estadísticas rápidas */}
          <View style={styles.statsRow}>
            <StatCard icon="trophy-variant-outline" value={1250} label="Puntos" />
            <StatCard icon="target" value={23} label="Retos" />
            <StatCard icon="account-group-outline" value={45} label="Amigos" />
          </View>

          {/* Conectar con Amigos */}
          <Card style={styles.sectionCard}>
            <Card.Title title="Conectar con Amigos" />
            <Card.Actions style={styles.friendActions}>
              <Button icon="qrcode" mode="outlined" onPress={() => {}}>Mi Código QR</Button>
              <Button icon="magnify" mode="outlined" onPress={() => {}}>Buscar Amigos</Button>
            </Card.Actions>
          </Card>

          {/* Navegación por Solapas */}
          <SegmentedButtons
            value={activeTab}
            onValueChange={setActiveTab}
            buttons={[
              { value: 'estadisticas', label: 'Estadísticas' },
              { value: 'insignias', label: 'Logros' },//--- REFACTORIZAR NOMBRES ------ REFACTORIZAR NOMBRES ------ REFACTORIZAR NOMBRES ------ REFACTORIZAR NOMBRES ---
              { value: 'ranking', label: 'Ranking' },
            ]}
            style={styles.tabs}
          />

          {/* Contenido Dinámico */}
          {renderContent()}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Estilos ---

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionCard: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  friendActions: {
    justifyContent: 'space-around',
    paddingBottom: 16,
  },
  tabs: {
    marginBottom: 16,
  },
});
