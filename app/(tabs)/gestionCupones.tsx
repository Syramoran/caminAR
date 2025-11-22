import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, StatusBar, FlatList, Alert, ActivityIndicator, Image, Dimensions, TouchableOpacity } from 'react-native';
import { Text, useTheme, SegmentedButtons, Button, FAB, Card, Chip, IconButton, Modal, Portal, ProgressBar, Avatar, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../context/UserContext';
import { CuponEditorModal } from '../../components/cupones/CuponEditorModal';
import { router } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// --- Interfaces ---
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
    imagen_url: string | null;
  } | null;
  usuarios: {
    id: number;
    usuario: string;
    avatar_url: string | null;
  } | null;
}

const { width } = Dimensions.get('window');

export default function GestionCuponesScreen() {
  const theme = useTheme();
  const { userId, isOrganization, username } = useUser();
  const [activeTab, setActiveTab] = useState<'creados' | 'canjeados'>('creados');

  const [misCupones, setMisCupones] = useState<MisCupones[]>([]);
  const [cuponesCanjeados, setCuponesCanjeados] = useState<CuponCanjeado[]>([]);

  const [loadingCreados, setLoadingCreados] = useState(true);
  const [loadingCanjeados, setLoadingCanjeados] = useState(true);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCupon, setSelectedCupon] = useState<MisCupones | null>(null);

  const [verQR, setVerQR] = useState<CuponCanjeado | null>(null);

  // --- Data Fetching ---
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
    } finally {
      setLoadingCreados(false);
    }
  }, [userId]);

  const fetchCuponesCanjeados = useCallback(async () => {
    if (!userId) return;
    setLoadingCanjeados(true);
    try {
      // 1. Obtener IDs de mis cupones
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

      // 2. Obtener canjes de esos cupones
      const { data, error } = await supabase
        .from('cupones_canjeados')
        .select(`
          id,
          fecha_canje,
          usado,
          fecha_uso,
          token_qr,
          cupones (id, titulo, imagen_url),
          usuarios (id, usuario, avatar_url)
        `)
        .in('cupon_id', misCuponesIds)
        .order('fecha_canje', { ascending: false });

      if (error) throw error;
      setCuponesCanjeados(data as CuponCanjeado[] || []);
    } catch (error: any) {
      console.error("Error fetching cupones canjeados:", error.message);
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

  // --- Handlers ---
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
      "¿Validar este cupón? Esta acción es irreversible.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Validar",
          style: "default",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('cupones_canjeados')
                .update({ usado: true, fecha_uso: new Date().toISOString() })
                .eq('id', canjeadoId);

              if (error) throw error;

              setCuponesCanjeados(prev =>
                prev.map(c =>
                  c.id === canjeadoId ? { ...c, usado: true, fecha_uso: new Date().toISOString() } : c
                )
              );
            } catch (error: any) {
              Alert.alert("Error", "No se pudo actualizar.");
            }
          },
        },
      ]
    );
  };

  // --- Render Components ---

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
      <View style={styles.headerContent}>
        <View>
          <Text variant="headlineMedium" style={styles.headerTitle}>Panel de Control</Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>Gestiona tus promociones, {username}</Text>
        </View>
        <Avatar.Icon size={48} icon="store" style={{backgroundColor: 'rgba(255,255,255,0.2)'}} color="white" />
      </View>
    </View>
  );

  const renderEmptyState = (message: string, icon: string, action?: () => void, actionLabel?: string) => (
    <View style={styles.emptyStateContainer}>
      <Icon name={icon} size={64} color={theme.colors.outline} />
      <Text style={[styles.emptyStateText, { color: theme.colors.onSurfaceVariant }]}>{message}</Text>
      {action && (
        <Button mode="contained-tonal" onPress={action} style={{ marginTop: 16 }}>
          {actionLabel}
        </Button>
      )}
    </View>
  );

  const renderCuponCreado = ({ item }: { item: MisCupones }) => {
    const progress = item.max_canjeos ? (item.canjeos_actuales / item.max_canjeos) : 0;
    const isExpired = item.fecha_fin && new Date(item.fecha_fin) < new Date();
    const statusColor = !item.disponible || isExpired ? theme.colors.error : theme.colors.primary;

    return (
      <Card style={styles.card} onPress={() => handleOpenCreator(item)} mode="elevated">
        {item.imagen_url && <Card.Cover source={{ uri: item.imagen_url }} style={styles.cardCover} />}
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text variant="titleMedium" style={styles.cardTitle} numberOfLines={1}>{item.titulo}</Text>

            {/* --- CHIP CORREGIDO --- */}
            <Chip
              compact // Reduce el padding interno
              mode="flat" // Quita la sombra/elevación para que se vea más limpio
              textStyle={{ fontSize: 11, color: 'white', fontWeight: 'bold', lineHeight: 14 }}
              style={{ backgroundColor: statusColor, height: 28, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }} // Altura aumentada a 28
            >
              {!item.disponible ? "Inactivo" : isExpired ? "Expirado" : "Activo"}
            </Chip>
            {/* --- FIN CHIP CORREGIDO --- */}

          </View>

          <Text variant="bodySmall" style={{color: theme.colors.onSurfaceVariant, marginBottom: 8}} numberOfLines={2}>
            {item.descripcion}
          </Text>

          <View style={styles.statsContainer}>
            <View style={styles.statBadge}>
               <Icon name="star" size={14} color={theme.colors.primary} />
               <Text style={{marginLeft: 4, fontSize: 12, fontWeight: 'bold'}}>{item.puntos_necesarios} pts</Text>
            </View>
            <View style={styles.statBadge}>
               <Icon name="calendar" size={14} color={theme.colors.secondary} />
               <Text style={{marginLeft: 4, fontSize: 12}}>
                 {item.fecha_fin ? new Date(item.fecha_fin).toLocaleDateString() : 'Ilimitado'}
               </Text>
            </View>
          </View>

          <View style={{ marginTop: 12 }}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4}}>
                <Text variant="labelSmall">Canjeos</Text>
                <Text variant="labelSmall">{item.canjeos_actuales} / {item.max_canjeos || '∞'}</Text>
            </View>
            {item.max_canjeos && (
                <ProgressBar progress={progress} color={progress >= 1 ? theme.colors.error : theme.colors.primary} style={{height: 6, borderRadius: 3}} />
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderCuponCanjeado = ({ item }: { item: CuponCanjeado }) => (
    <Card style={[styles.card, item.usado && { opacity: 0.7, backgroundColor: '#f5f5f5' }]} mode="outlined">
      <View style={{flexDirection: 'row', padding: 12}}>
         <Avatar.Image
            size={50}
            source={{ uri: item.usuarios?.avatar_url || 'https://avatar.iran.liara.run/public' }}
            style={{marginRight: 12}}
         />
         <View style={{flex: 1}}>
            <Text variant="titleSmall" style={{fontWeight: 'bold'}}>{item.usuarios?.usuario || 'Usuario'}</Text>
            <Text variant="bodySmall" style={{color: theme.colors.primary}}>
                Canjeó: {item.cupones?.titulo}
            </Text>
            <Text variant="labelSmall" style={{color: theme.colors.outline}}>
                {new Date(item.fecha_canje).toLocaleString()}
            </Text>
         </View>
         <TouchableOpacity onPress={() => setVerQR(item)}>
             <Icon name="qrcode-scan" size={28} color={theme.colors.primary} />
         </TouchableOpacity>
      </View>

      {!item.usado ? (
        <View style={styles.cardActionFooter}>
            <Button
                mode="contained"
                compact
                onPress={() => handleMarcarUsado(item.id)}
                style={{flex: 1}}
                icon="check-decagram"
            >
                Validar Cupón
            </Button>
        </View>
      ) : (
        <View style={[styles.cardActionFooter, {backgroundColor: '#e0e0e0', justifyContent: 'center'}]}>
            <Text style={{color: '#666', fontStyle: 'italic', fontSize: 12}}>
                Validado el {item.fecha_uso ? new Date(item.fecha_uso).toLocaleDateString() : 'N/A'}
            </Text>
        </View>
      )}
    </Card>
  );

  const renderContent = () => {
    if (activeTab === 'creados') {
      if (loadingCreados) return <ActivityIndicator style={{ marginTop: 100 }} size="large" color={theme.colors.primary} />;
      if (misCupones.length === 0) return renderEmptyState("No tienes cupones activos", "ticket-percent-outline", () => handleOpenCreator(null), "Crear Primer Cupón");
      return (
        <FlatList
          data={misCupones}
          renderItem={renderCuponCreado}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      );
    }

    if (activeTab === 'canjeados') {
      if (loadingCanjeados) return <ActivityIndicator style={{ marginTop: 100 }} size="large" color={theme.colors.primary} />;
      if (cuponesCanjeados.length === 0) return renderEmptyState("Aún no han canjeado tus cupones", "history");
      return (
        <FlatList
          data={cuponesCanjeados}
          renderItem={renderCuponCanjeado}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      );
    }
    return null;
  };

  if (!isOrganization) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Icon name="shield-lock-outline" size={60} color={theme.colors.error} style={{ marginBottom: 20 }} />
        <Text variant="headlineSmall" style={{textAlign: 'center', marginBottom: 10, color: theme.colors.onSurface}}>Acceso Restringido</Text>
        <Text style={{textAlign: 'center', marginBottom: 30, color: theme.colors.onSurfaceVariant}}>
            Esta sección es exclusiva para organizaciones aliadas. Si deseas registrar tu negocio, contáctanos.
        </Text>
        <Button mode="contained" onPress={() => router.replace('/(tabs)/')}>
          Volver al Inicio
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.primary }]} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {renderHeader()}

      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.tabsContainer}>
            <SegmentedButtons
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as 'creados' | 'canjeados')}
            buttons={[
                { value: 'creados', label: 'Mis Cupones', icon: 'ticket-outline' },
                { value: 'canjeados', label: 'Historial Canjes', icon: 'history' },
            ]}
            style={styles.tabs}
            density="medium"
            />
        </View>

        {renderContent()}
      </View>

      {activeTab === 'creados' && (
        <FAB
          icon="plus"
          label="Nuevo"
          style={[styles.fab, { backgroundColor: theme.colors.tertiary }]}
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

      {/* Modal QR (Ticket Style) */}
      <Portal>
        <Modal visible={!!verQR} onDismiss={() => setVerQR(null)} contentContainerStyle={styles.qrModalContainer}>
            <View style={styles.ticketHeader}>
                <View style={styles.holeLeft} />
                <View style={styles.holeRight} />
                <Text variant="titleMedium" style={{color: 'white', fontWeight: 'bold'}}>TOKEN DE VALIDACIÓN</Text>
            </View>
            <View style={styles.ticketBody}>
                <Text style={{marginBottom: 10, color: '#666'}}>Escanea para verificar</Text>
                {verQR && (
                    <QRCode
                        value={verQR.token_qr}
                        size={200}
                        logo={require('../../assets/images/icon.png')}
                        logoSize={30}
                    />
                )}
                <Text variant="headlineSmall" style={{marginTop: 20, fontWeight: 'bold', letterSpacing: 2, color: theme.colors.primary}}>
                    {verQR?.token_qr}
                </Text>
                <Button onPress={() => setVerQR(null)} style={{marginTop: 20}}>Cerrar</Button>
            </View>
        </Modal>
      </Portal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  container: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -16, // Efecto de superposición
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  tabsContainer: {
    marginBottom: 16,
  },
  tabs: {
    // Personalización adicional si se requiere
  },
  listContent: {
    paddingBottom: 80, // Espacio para el FAB
  },
  card: {
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardCover: {
    height: 140,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  cardActionFooter: {
      padding: 8,
      borderTopWidth: 1,
      borderColor: '#eee',
      flexDirection: 'row',
  },
  fab: {
    position: 'absolute',
    margin: 20,
    right: 0,
    bottom: 0,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    padding: 20,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  // Estilos del Modal QR (Ticket)
  qrModalContainer: {
    marginHorizontal: 30,
    backgroundColor: 'transparent', // El fondo es transparente para ver el ticket
  },
  ticketHeader: {
    backgroundColor: '#2E7D5E', // Color primario
    height: 60,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ticketBody: {
    backgroundColor: 'white',
    padding: 24,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    alignItems: 'center',
  },
  holeLeft: {
    position: 'absolute',
    bottom: -10,
    left: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)', // Color del backdrop del modal
  },
  holeRight: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  }
});