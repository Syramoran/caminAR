import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, useTheme, SegmentedButtons, Chip } from 'react-native-paper';
import AvailableRewardCard from '../../components/rewards/AvailableRewardCard';
import MyCouponCard from '../../components/rewards/MyCouponCard';
import { MOCK_REWARDS, MOCK_COUPONS } from '../../models/mocks';

export default function PremiosScreen() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('disponibles');

  // En una app real, este valor vendría de tu UserContext
  const userPoints = 1250;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.primary }]}>
      <StatusBar barStyle="light-content" />

      {/* Encabezado con puntos del usuario */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <View>
          <Text variant="headlineMedium" style={styles.headerTitle}>Premios</Text>
          <Text variant="bodyLarge" style={styles.headerSubtitle}>Canjea tus puntos por recompensas</Text>
        </View>
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsValue}>{userPoints}</Text>
          <Text style={styles.pointsLabel}>Puntos disponibles</Text>
        </View>
      </View>

      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ScrollView contentContainerStyle={styles.container}>
          {/* Pestañas de navegación */}
          <SegmentedButtons
            value={activeTab}
            onValueChange={setActiveTab}
            buttons={[
              { value: 'disponibles', label: 'Disponibles' },
              { value: 'cupones', label: 'Mis Cupones' },
            ]}
            style={styles.tabs}
          />

          {/* Renderizado condicional del contenido */}
          {activeTab === 'disponibles' ? (
            <View>
              <View style={styles.sectionHeader}>
                <Text variant="titleLarge" style={styles.sectionTitle}>Premios Disponibles</Text>
                <Chip>{MOCK_REWARDS.length} premios</Chip>
              </View>
              {MOCK_REWARDS.map((r) => <AvailableRewardCard key={r.id} r={r} />)}
            </View>
          ) : (
            <View>
              <View style={styles.sectionHeader}>
                <Text variant="titleLarge" style={styles.sectionTitle}>Mis Cupones</Text>
                <Chip>{MOCK_COUPONS.length} cupones</Chip>
              </View>
              {MOCK_COUPONS.map((c) => <MyCouponCard key={c.id} c={c} />)}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16, // Espacio superior
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontWeight: 'bold', color: 'white' },
  headerSubtitle: { marginTop: 4, color: 'white', opacity: 0.9 },
  pointsContainer: { alignItems: 'center' },
  pointsValue: { color: 'white', fontWeight: 'bold', fontSize: 24 },
  pointsLabel: { color: 'white', opacity: 0.9, fontSize: 12 },
  container: { padding: 16, paddingBottom: 48 },
  tabs: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  sectionTitle: { fontWeight: 'bold' },
});

