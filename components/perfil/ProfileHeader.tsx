import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar, Text, IconButton, ProgressBar, useTheme, ActivityIndicator } from 'react-native-paper'; // Importa ActivityIndicator
import { Link } from 'expo-router';
import { useUser } from '../../context/UserContext'; // Verifica que la ruta sea correcta

export const ProfileHeader = () => {
  const theme = useTheme();
  // 1. Obtenemos la información relevante del contexto, incluyendo el estado de carga
  const { profileImage, username, totalScore, loadingProfile } = useUser();

  // Define un puntaje objetivo para el nivel actual o próximo (puedes ajustar esto)
  const scoreNeededForNextLevel = 1500;
  const progress = loadingProfile ? 0 : (totalScore || 0) / scoreNeededForNextLevel;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <View style={styles.userInfo}>
        {/* Muestra la imagen de perfil o un fallback */}
        <Avatar.Image
          size={64}
          source={{ uri: profileImage || 'https://avatar.iran.liara.run/public/47' }} // Usa la imagen del contexto
        />
        <View style={styles.userInfoText}>
          {/* Muestra el nombre de usuario o "Cargando..." */}
          <Text variant="headlineSmall" style={styles.name}>
            {loadingProfile ? 'Cargando...' : (username || 'Usuario')}
          </Text>
          {/* Ya no mostramos userHandle ya que no está en la DB */}
        </View>
        <Link href="/configuracion" asChild>
          <IconButton icon="cog-outline" iconColor="#FFF" />
        </Link>
      </View>
      <View style={styles.progressContainer}>
        {/* Puedes calcular el nivel basado en totalScore si lo deseas */}
        <Text style={styles.levelText}>Nivel ?</Text>
        <ProgressBar progress={progress} color="#FFF" style={styles.progressBar} />
        {/* Muestra el puntaje total o "..." mientras carga */}
        <Text style={styles.pointsText}>
            {loadingProfile ? '...' : (totalScore ?? 0)}/{scoreNeededForNextLevel} pts
        </Text>
      </View>
    </View>
  );
};

// --- Estilos ---
const styles = StyleSheet.create({
  container: {
    paddingTop: 50, // Ajusta según sea necesario para SafeArea/StatusBar
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfoText: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  // Eliminamos el estilo username ya que no se usa
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelText: {
    color: '#FFF',
    marginRight: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  pointsText: {
    color: '#FFF',
    marginLeft: 8,
    minWidth: 80, // Ancho mínimo para evitar saltos al cargar
    textAlign: 'right',
  },
});

