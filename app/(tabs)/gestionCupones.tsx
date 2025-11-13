import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, StatusBar, FlatList, Alert, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Appbar, useTheme, SegmentedButtons, Button, FAB, Card, List, Chip, IconButton, Modal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../context/UserContext';
import { CuponEditorModal } from '../../components/cupones/CuponEditorModal';
import { router } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';

// ... (interfaces remain the same) ...
interface MisCupones {
  id: number;
  titulo: string;
  descripcion: string | null;
  puntos_necesarios: number;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  codigo_cupon: string;
  disponible: boolean;
  canjeos_actuales: number;
  max_canjeos: number | null;
  imagen_url: string | null;
  latitud: number | null;
  longitud: number | null;
}

interface CuponCanjeado {
  id: number;
  fecha_canje: string;
  usado: boolean;
  fecha_uso: string | null;
  token_qr: string;
  cupones: {
    id: number;
    titulo: string;
  } | null;
  usuarios: {
    id: number;
    usuario: string;
    avatar_url: string | null;
  } | null;
}


export default function GestionCuponesScreen() {
  const theme = useTheme();
  const { userId, isOrganization } = useUser();
  const [activeTab, setActiveTab] = useState<'creados' | 'canjeados'>('creados');

  const [misCupones, setMisCupones] = useState<MisCupones[]>([]);
  const [cuponesCanjeados, setCuponesCanjeados] = useState<CuponCanjeado[]>([]);

  const [loadingCreados, setLoadingCreados] = useState(true);
  const [loadingCanjeados, setLoadingCanjeados] = useState(true);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCupon, setSelectedCupon] = useState<MisCupones | null>(null);

  const [verQR, setVerQR] = useState<CuponCanjeado | null>(null);

  // ... (data fetching and actions remain the same) ...
  const fetchMisCupones = useCallback(async () => {
    if (!userId) return;
    setLoadingCreados(true);
    try {
      const { data, error } = await supabase
        .from('cupones')
        .select('*')
        .eq('usuario_creador_id', userId)
        .order('creado_en', { ascending: false });

      if (error) throw error;
      setMisCupones(data as MisCupones[] || []);
    } catch (error: any) {
      console.error("Error fetching mis cupones:", error.message);
      Alert.alert("Error", "No se pudieron cargar tus cupones creados.");
    } finally {
      setLoadingCreados(false);
    }
  }, [userId]);

  const fetchCuponesCanjeados = useCallback(async () => {
    if (!userId) return;
    setLoadingCanjeados(true);
    try {
      const { data: misCuponesIdsData, error: misCuponesError } = await supabase
        .from('cupones')
        .select('id')
        .eq('usuario_creador_id', userId);

      if (misCuponesError) throw misCuponesError;
      const misCuponesIds = misCuponesIdsData.map(c => c.id);

      if (misCuponesIds.length === 0) {
        setCuponesCanjeados([]);
        setLoadingCanjeados(false);
        return;
      }

      const { data, error } = await supabase
        .from('cupones_canjeados')
        .select(`
          id,
          fecha_canje,
          usado,
          fecha_uso,
          token_qr,
          cupones (id, titulo),
          usuarios (id, usuario, avatar_url)
        `)
        .in('cupon_id', misCuponesIds)
        .order('fecha_canje', { ascending: false });

      if (error) throw error;
      setCuponesCanjeados(data as CuponCanjeado[] || []);
    } catch (error: any) {
      console.error("Error fetching cupones canjeados:", error.message);
      Alert.alert("Error", "No se pudieron cargar los cupones canjeados.");
    } finally {
      setLoadingCanjeados(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isOrganization) {
      if (activeTab === 'creados') {
        fetchMisCupones();
      } else {
        fetchCuponesCanjeados();
      }
    }
  }, [userId, isOrganization, activeTab, fetchMisCupones, fetchCuponesCanjeados]);

  const handleOpenCreator = (cupon: MisCupones | null = null) => {
    setSelectedCupon(cupon);
    setIsModalVisible(true);
  };

  const onModalClose = (refresh: boolean) => {
    setIsModalVisible(false);
    setSelectedCupon(null);
    if (refresh) {
      fetchMisCupones();
    }
  };

  const handleMarcarUsado = async (canjeadoId: number) => {
    Alert.alert(
      "Confirmar Uso",
      "¿Estás seguro de que deseas marcar este cupón como usado? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('cupones_canjeados')
                .update({ usado: true, fecha_uso: new Date().toISOString() })
                .eq('id', canjeadoId);

              if (error) throw error;

              Alert.alert("Éxito", "Cupón marcado como usado.");
              setCuponesCanjeados(prev =>
                prev.map(c =>
                  c.id === canjeadoId ? { ...c, usado: true, fecha_uso: new Date().toISOString() } : c
                )
              );
            } catch (error: any) {
              console.error("Error al marcar como usado:", error.message);
              Alert.alert("Error", "No se pudo actualizar el estado del cupón.");
            }
          },
        },
      ]
    );
  };

  const dynamicStyles = {
    cardUsado: {
      backgroundColor: theme.colors.surfaceDisabled,
    },
    fechaUsoText: {
      fontSize: 12,
      fontStyle: 'italic',
      color: theme.colors.onSurfaceDisabled,
      textAlign: 'right',
      marginRight: 16,
      marginBottom: 12,
    },
  };

  const renderCuponCreado = ({ item }: { item: MisCupones }) => (
    <Card style={styles.card} onPress={() => handleOpenCreator(item)}>
      <Card.Title
        title={item.titulo}
        titleNumberOfLines={2}
        subtitle={`${item.puntos_necesarios} pts`}
        subtitleStyle={{ color: theme.colors.primary, fontWeight: 'bold' }}
        right={(props) => (
          <Chip
            {...props}
            icon={item.disponible ? "check" : "close"}
            style={{ marginRight: 16, backgroundColor: item.disponible ? theme.colors.secondaryContainer : theme.colors.errorContainer }}
          >
            {item.disponible ? "Activo" : "Inactivo"}
          </Chip>
        )}
      />
      <Card.Content>
        <Text variant="bodyMedium" numberOfLines={2}>{item.descripcion}</Text>
        <View style={styles.statsRow}>
          <Text variant="bodySmall">Canjeos: {item.canjeos_actuales} / {item.max_canjeos || '∞'}</Text>
          <Text variant="bodySmall">Expira: {item.fecha_fin ? new Date(item.fecha_fin).toLocaleDateString() : 'N/A'}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderCuponCanjeado = ({ item }: { item: CuponCanjeado }) => (
    <Card style={[styles.card, item.usado && dynamicStyles.cardUsado]}>
      <List.Item
        title={item.cupones?.titulo || "Cupón desconocido"}
        titleNumberOfLines={2}
        description={`Canjeado por: ${item.usuarios?.usuario || 'N/A'}\nFecha: ${new Date(item.fecha_canje).toLocaleString()}`}
        descriptionStyle={item.usado ? { color: theme.colors.onSurfaceDisabled } : {}}
        left={(props) => <List.Icon {...props} icon={item.usado ? "check-circle" : "alert-circle"} color={item.usado ? theme.colors.primary : theme.colors.error} />}
        right={() => (
          <View style={{justifyContent:'center', marginRight: 8}}>
            <IconButton icon="qrcode" onPress={() => setVerQR(item)} />
          </View>
        )}
      />
      {!item.usado && (
        <Card.Actions>
          <Button
            mode="contained"
            onPress={() => handleMarcarUsado(item.id)}
            icon="check"
            style={{flex: 1}}
          >
            Marcar como Usado
          </Button>
        </Card.Actions>
      )}
      {item.usado && item.fecha_uso && (
         <Text style={dynamicStyles.fechaUsoText}>Usado el: {new Date(item.fecha_uso).toLocaleString()}</Text>
      )}
    </Card>
  );


  const renderContent = () => {
    if (activeTab === 'creados') {
      if (loadingCreados) return <ActivityIndicator style={{ marginTop: 50 }} />;
      if (misCupones.length === 0) return <Text style={styles.infoText}>Aún no has creado ningún cupón.</Text>;
      return (
        <FlatList
          data={misCupones}
          renderItem={renderCuponCreado}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      );
    }

    if (activeTab === 'canjeados') {
      if (loadingCanjeados) return <ActivityIndicator style={{ marginTop: 50 }} />;
      if (cuponesCanjeados.length === 0) return <Text style={styles.infoText}>Nadie ha canjeado tus cupones todavía.</Text>;
      return (
        <FlatList
          data={cuponesCanjeados}
          renderItem={renderCuponCanjeado}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      );
    }
    return null;
  };

  if (!isOrganization) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{textAlign: 'center', margin: 20}} variant="titleLarge">Esta sección es solo para organizaciones.</Text>
        <Button mode="contained" onPress={() => router.replace('/(tabs)/')}>
          Volver al Inicio
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.primary }]} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.Content title="Gestionar Cupones" titleStyle={{ color: '#fff' }}/>
      </Appbar.Header>

      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as 'creados' | 'canjeados')}
          buttons={[
            { value: 'creados', label: 'Mis Creados' },
            { value: 'canjeados', label: 'Canjeados' },
          ]}
          style={styles.tabs}
        />

        {/* --- CHANGE IS HERE --- */}
        {/* Remove the ScrollView wrapper. The FlatList inside renderContent will handle scrolling. */}
        {renderContent()}

      </View>

      {activeTab === 'creados' && (
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          color="#fff"
          onPress={() => handleOpenCreator(null)}
        />
      )}

      {isModalVisible && (
        <CuponEditorModal
          visible={isModalVisible}
          onClose={onModalClose}
          cupon={selectedCupon}
          userId={userId!}
        />
      )}

      <Modal visible={!!verQR} onDismiss={() => setVerQR(null)} contentContainerStyle={styles.qrModalContainer}>
        <View style={{alignItems: 'center', padding: 20, backgroundColor: 'white', borderRadius: 15}}>
           <IconButton icon="close" style={styles.modalCloseButton} onPress={() => setVerQR(null)} />
           <Text variant="titleMedium" style={{marginBottom: 8}}>Token de Verificación</Text>
           <Text variant="bodySmall" style={{marginBottom: 20, textAlign: 'center'}}>Este QR es único para este canje.</Text>
           {verQR && (
             <QRCode
                value={verQR.token_qr}
                size={220}
                logo={require('../../assets/images/icon.png')}
                logoSize={30}
             />
           )}
           <Text style={{marginTop: 20, fontStyle: 'italic', color: theme.colors.backdrop}}>{verQR?.token_qr}</Text>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// ... (styles remain the same) ...
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  tabs: {
    marginBottom: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  card: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    opacity: 0.7,
  },
  infoText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  qrModalContainer: {
    padding: 20,
  },
  modalCloseButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'white',
    borderRadius: 15
  }
});