import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar, Text, IconButton, ProgressBar, useTheme } from 'react-native-paper';
import { Link } from 'expo-router';
import { useUser } from '../../context/UserContext';

export const ProfileHeader = () => {
  const theme = useTheme();
  // 1. Obtenemos TODA la información del usuario desde el contexto
  const { profileImage, userName, userHandle } = useUser();

  const progress = 1250 / 1500;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <View style={styles.userInfo}>
        <Avatar.Image
          size={64}
          source={{ uri: profileImage || 'https://avatar.iran.liara.run/public/47' }}
        />
        <View style={styles.userInfoText}>
          {/* 2. Mostramos el nombre y usuario del contexto */}
          <Text variant="headlineSmall" style={styles.name}>{userName}</Text>
          <Text style={styles.username}>{userHandle}</Text>
        </View>
        <Link href="/configuracion" asChild>
          <IconButton icon="cog-outline" iconColor="#FFF" />
        </Link>
      </View>
      <View style={styles.progressContainer}>
        <Text style={styles.levelText}>Nivel 5</Text>
        <ProgressBar progress={progress} color="#FFF" style={styles.progressBar} />
        <Text style={styles.pointsText}>1250/1500 puntos</Text>
      </View>
    </View>
  );
};

// ... (los estilos se mantienen igual)
const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
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
  username: {
    color: '#FFF',
  },
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
  },
});

