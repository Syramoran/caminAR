import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme, Avatar, Badge } from 'react-native-paper';
import { useUser } from '../../context/UserContext';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const HomeHeader = () => {
  const theme = useTheme();
  const router = useRouter();
  const { username, totalScore, profileImage } = useUser();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* Lado Izquierdo: Avatar y Saludo */}
      <TouchableOpacity onPress={() => router.push('/(tabs)/perfil')} style={styles.profileSection}>
        <View>
          <Avatar.Image
            size={44}
            source={{ uri: profileImage || 'https://avatar.iran.liara.run/public/47' }}
          />
          {/* Indicador de nivel o status */}
          <View style={[styles.badge, { borderColor: theme.colors.surface }]}>
             <View style={{width: 10, height: 10, borderRadius: 5, backgroundColor: '#4CAF50'}} />
          </View>
        </View>
        <View style={styles.textContainer}>
          <Text variant="labelSmall" style={{ color: theme.colors.outline }}>Bienvenido de nuevo</Text>
          <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>
            {username}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Lado Derecho: Puntos y Notificaciones (placeholder) */}
      <View style={styles.actions}>
        <View style={[styles.pointsPill, { backgroundColor: theme.colors.secondaryContainer }]}>
          <Icon name="leaf" size={16} color={theme.colors.primary} />
          <Text style={[styles.pointsText, { color: theme.colors.onSecondaryContainer }]}>
            {totalScore ?? 0}
          </Text>
        </View>

        <TouchableOpacity style={styles.iconButton}>
           <Icon name="bell-outline" size={24} color={theme.colors.onSurfaceVariant} />
           <Badge size={8} style={styles.notificationDot} visible={true} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 12,
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderRadius: 6,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pointsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  pointsText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  iconButton: {
    padding: 4,
  },
  notificationDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF5252'
  }
});