import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar, Text, IconButton, ProgressBar, useTheme } from 'react-native-paper';
import { Link } from 'expo-router';

export const ProfileHeader = () => {
  const theme = useTheme();
  // Simula el progreso del usuario. Deberías obtenerlo de tu estado global.
  const progress = 1250 / 1500;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <View style={styles.userInfo}>
        <Avatar.Image size={64} source={{ uri: 'https://i.ibb.co/dst0WmCF/profile-picture.png' }} />
        <View style={styles.userInfoText}>
          <Text variant="headlineSmall" style={styles.name}>María González</Text>
          <Text style={styles.username}>@maria_eco</Text>
        </View>
        {/* Este Link navegará a la pantalla de configuración */}
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
