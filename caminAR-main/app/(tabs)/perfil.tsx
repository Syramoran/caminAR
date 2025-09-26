import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SegmentedButtons, Card, Button, Text, useTheme } from 'react-native-paper';
import { ProfileHeader } from '../../components/perfil/ProfileHeader';
import { StatCard } from '../../components/perfil/StatCard';
import { RankingList } from '../../components/perfil/RankingList';

// Componente para la sección de estadísticas (puedes moverlo a su propio archivo)
const StatisticsSection = () => (
  <Card style={styles.sectionCard}>
    <Card.Title title="Mis Estadísticas" titleVariant="titleLarge" />
    <Card.Content>
       {/* Aquí irían las estadísticas detalladas */}
      <Text>Contenido de Estadísticas...</Text>
    </Card.Content>
  </Card>
);

// Componente para la sección de insignias
const InsigniasSection = () => (
  <Card style={styles.sectionCard}>
    <Card.Title title="Mis Insignias" titleVariant="titleLarge" />
    <Card.Content>
      <Text>Contenido de Insignias...</Text>
    </Card.Content>
  </Card>
);

// Componente para la sección de ranking
const RankingSection = () => (
    <View style={styles.sectionCard}>
       <RankingList />
    </View>
  );


export default function PerfilScreen() {
  const [activeTab, setActiveTab] = useState('estadisticas');
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.elevation.level2 }]} edges={['top']}>
      <ScrollView>
        <ProfileHeader />

        <View style={styles.container}>
          {/* Tarjetas de Estadísticas Rápidas */}
          <View style={styles.statsRow}>
            <StatCard icon="trophy-variant-outline" value={1250} label="Puntos" />
            <StatCard icon="target" value={23} label="Retos" />
            <StatCard icon="account-group-outline" value={45} label="Amigos" />
          </View>

          {/* Sección Conectar Amigos */}
          <Card style={styles.sectionCard}>
            <Card.Title title="Conectar con Amigos" />
            <Card.Actions style={styles.friendActions}>
              <Button icon="qrcode" mode="outlined" onPress={() => {}}>Mi Código QR</Button>
              <Button icon="magnify" mode="outlined" onPress={() => {}}>Buscar Amigos</Button>
            </Card.Actions>
          </Card>

          {/* Tabs de Navegación */}
          <SegmentedButtons
            value={activeTab}
            onValueChange={setActiveTab}
            buttons={[
              { value: 'estadisticas', label: 'Estadísticas' },
              { value: 'insignias', label: 'Insignias' },
              { value: 'ranking', label: 'Ranking' },
            ]}
            style={styles.tabs}
          />

          {/* Contenido condicional basado en la Tab */}
          {activeTab === 'estadisticas' && <StatisticsSection />}
          {activeTab === 'insignias' && <InsigniasSection />}
          {activeTab === 'ranking' && <RankingSection />}

           {/* Aquí puedes agregar la sección de "Mis Fotos de Retos" */}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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