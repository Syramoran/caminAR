import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SegmentedButtons, Card, Button, useTheme, Text } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';

// Componentes
import { ProfileHeader } from '../../components/perfil/ProfileHeader';
import { StatCard } from '../../components/perfil/StatCard';
import { RankingList } from '../../components/perfil/RankingList';
import { StatisticsSection } from '../../components/perfil/StatisticsSection';
import { UserSearchModal } from '../../components/perfil/UserSearchModal';
import { FollowingListModal } from '../../components/perfil/FollowingListModal';
import { PhotosGrid } from '../../components/perfil/PhotosGrid';

// Lógica y BD
import { supabase } from '../../lib/supabase';
import { useUser } from '../../context/UserContext';

export default function PerfilScreen() {
  const theme = useTheme();

  // 1. Obtener parámetros y contexto
  const params = useLocalSearchParams();
  // Convertir a número solo si existe y es un string válido
  const paramUserId = params.userId ? parseInt(Array.isArray(params.userId) ? params.userId[0] : params.userId, 10) : null;
  const { userId: currentUserId, totalScore: myScore } = useUser();

  // 2. Determinar si es perfil propio o ajeno
  const isOwnProfile = !paramUserId || paramUserId === currentUserId;
  const targetUserId = isOwnProfile ? currentUserId : paramUserId;

  // Estados
  const [activeTab, setActiveTab] = useState('estadisticas');
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [followingModalVisible, setFollowingModalVisible] = useState(false);

  // Estados para perfil ajeno
  const [otherUserProfile, setOtherUserProfile] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingOther, setLoadingOther] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);

  // Efecto para cargar datos de OTRO usuario
  useEffect(() => {
    if (!isOwnProfile && targetUserId) {
      fetchOtherUserProfile();
      checkIfFollowing();
    }
  }, [targetUserId, isOwnProfile]);

  const fetchOtherUserProfile = async () => {
    setLoadingOther(true);
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, usuario, nombre, avatar_url, puntaje_total')
        .eq('id', targetUserId)
        .single();

      if (error) throw error;
      setOtherUserProfile(data);
    } catch (err) {
      console.error("Error fetching other profile:", err);
    } finally {
      setLoadingOther(false);
    }
  };

  const checkIfFollowing = async () => {
    if (!currentUserId) return;
    try {
      const { count } = await supabase
        .from('seguidores')
        .select('*', { count: 'exact', head: true })
        .eq('seguidor_id', currentUserId)
        .eq('seguido_id', targetUserId);

      setIsFollowing((count || 0) > 0);
    } catch (err) {
      console.error("Error check follow:", err);
    }
  };

  const handleToggleFollow = async () => {
    if (!currentUserId || !targetUserId) return;
    setLoadingFollow(true);
    try {
      if (isFollowing) {
        await supabase.from('seguidores').delete().eq('seguidor_id', currentUserId).eq('seguido_id', targetUserId);
        setIsFollowing(false);
      } else {
        await supabase.from('seguidores').insert({ seguidor_id: currentUserId, seguido_id: targetUserId });
        setIsFollowing(true);
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
    } finally {
      setLoadingFollow(false);
    }
  };

  // Renderizado condicional del contenido principal
  const renderContent = () => {
    if (activeTab === 'estadisticas') return <StatisticsSection />;
    if (activeTab === 'ranking') return <RankingList />;
    return null;
  };

  // Si estamos cargando un perfil ajeno
  if (!isOwnProfile && loadingOther) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>

        {/* HEADER: Inteligente, muestra datos propios o ajenos */}
        <ProfileHeader
          isOwnProfile={isOwnProfile}
          customUser={!isOwnProfile && otherUserProfile ? {
            username: otherUserProfile.usuario,
            profileImage: otherUserProfile.avatar_url,
            totalScore: otherUserProfile.puntaje_total
          } : undefined}
        />

        <View style={styles.container}>

          {/* --- VISTA DE OTRO USUARIO --- */}
          {!isOwnProfile ? (
            <>
              <Button
                mode={isFollowing ? "outlined" : "contained"}
                onPress={handleToggleFollow}
                loading={loadingFollow}
                style={styles.followButton}
                icon={isFollowing ? "check" : "account-plus"}
              >
                {isFollowing ? "Siguiendo" : "Seguir"}
              </Button>

              <Card style={styles.sectionCard}>
                <Card.Title title="Galería de Fotos" />
                <Card.Content>
                  {targetUserId && <PhotosGrid userId={targetUserId} />}
                </Card.Content>
              </Card>
            </>
          ) : (
            /* --- VISTA DE MI PERFIL (Original) --- */
            <>
              <View style={styles.statsRow}>
                <StatCard icon="trophy-variant-outline" value={`Nvl ${Math.floor((myScore||0)/500)+1}`} label="Nivel" />
                <StatCard icon="star-circle-outline" value="Eco" label="Status" />
                <StatCard icon="account-group-outline" value="-" label="Social" />
              </View>

              <Card style={styles.sectionCard}>
                <Card.Title title="Social" />
                <Card.Actions style={styles.friendActions}>
                  <Button
                    icon="account-heart-outline"
                    mode="outlined"
                    onPress={() => setFollowingModalVisible(true)}
                    style={{flex: 1, marginRight: 8}}
                  >
                    Seguidos
                  </Button>
                  <Button
                    icon="magnify"
                    mode="outlined"
                    onPress={() => setSearchModalVisible(true)}
                    style={{flex: 1}}
                  >
                    Buscar
                  </Button>
                </Card.Actions>
              </Card>

              <SegmentedButtons
                value={activeTab}
                onValueChange={setActiveTab}
                buttons={[
                  { value: 'estadisticas', label: 'Estadísticas', icon: 'chart-bar' },
                  { value: 'ranking', label: 'Global', icon: 'podium' },
                ]}
                style={styles.tabs}
                density="medium"
              />

              {renderContent()}
            </>
          )}

        </View>
      </ScrollView>

      <UserSearchModal
        visible={searchModalVisible}
        onDismiss={() => setSearchModalVisible(false)}
      />
      <FollowingListModal
        visible={followingModalVisible}
        onDismiss={() => setFollowingModalVisible(false)}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  sectionCard: { marginBottom: 24, backgroundColor: '#fff', elevation: 2 },
  friendActions: { paddingHorizontal: 16, paddingBottom: 16, justifyContent: 'space-between' },
  tabs: { marginBottom: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  followButton: { marginBottom: 20, borderRadius: 20 }
});