import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar, Text, IconButton, ProgressBar, useTheme } from 'react-native-paper';
import { Link } from 'expo-router';
import { useUser } from '../../context/UserContext'; // 1. Importamos nuestro hook personalizado para acceder al contexto del usuario.

// --- Componente del Encabezado del Perfil ---
export const ProfileHeader = () => {
  // --- Hooks ---
  const theme = useTheme(); // Hook para acceder a los colores de nuestro tema global.
  const { profileImage } = useUser(); // 2. Usamos nuestro hook para obtener la URL de la imagen de perfil desde el estado global.

  // --- Datos de Ejemplo ---
  // En una aplicación real, estos datos también vendrían del contexto o de una API.
  const progress = 1250 / 1500;

  // --- Renderizado del Componente (JSX) ---
  return (
    // El contenedor principal del header, con el color primario del tema como fondo.
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      {/* Sección con la información del usuario (avatar, nombre, etc.) */}
      <View style={styles.userInfo}>
        {/*
          3. Avatar dinámico:
          - `source` recibe un objeto `{ uri: ... }`.
          - Usamos un operador ternario: si `profileImage` tiene una URL, la usamos.
          - Si no (`profileImage` es null), usamos la URL del avatar por defecto.
        */}
        <Avatar.Image
          size={64}
          source={{ uri: profileImage || 'https://avatar.iran.liara.run/public/47' }}
        />
        {/* Contenedor para el nombre y nombre de usuario */}
        <View style={styles.userInfoText}>
          <Text variant="headlineSmall" style={styles.name}>María González</Text>
          <Text style={styles.username}>@maria_eco</Text>
        </View>

        {/*
          Botón de Configuración:
          - Usamos el componente `Link` de Expo Router para navegar a la pantalla `/configuracion`.
          - `asChild` le dice a `Link` que no se renderice a sí mismo, sino que le pase las propiedades de navegación a su hijo (el `IconButton`).
        */}
        <Link href="/configuracion" asChild>
          <IconButton icon="cog-outline" iconColor="#FFF" />
        </Link>
      </View>

      {/* Sección con la barra de progreso de nivel y puntos */}
      <View style={styles.progressContainer}>
        <Text style={styles.levelText}>Nivel 5</Text>
        <ProgressBar progress={progress} color="#FFF" style={styles.progressBar} />
        <Text style={styles.pointsText}>1250/1500 puntos</Text>
      </View>
    </View>
  );
};

// --- Hoja de Estilos del Componente ---
const styles = StyleSheet.create({
  container: {
    paddingTop: 50, // Espacio superior para evitar la barra de estado
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 20, // Bordes redondeados solo en la parte inferior
    borderBottomRightRadius: 20,
  },
  userInfo: {
    flexDirection: 'row', // Organiza los elementos en una fila horizontal
    alignItems: 'center', // Centra los elementos verticalmente
    marginBottom: 16,
  },
  userInfoText: {
    flex: 1, // Hace que este contenedor ocupe todo el espacio disponible en la fila
    marginLeft: 16, // Espacio entre el avatar y el texto
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
    justifyContent: 'space-between', // Distribuye el espacio entre los elementos
  },
  levelText: {
    color: '#FFF',
    marginRight: 8,
  },
  progressBar: {
    flex: 1, // La barra de progreso ocupa el espacio sobrante
    height: 8,
    borderRadius: 4,
  },
  pointsText: {
    color: '#FFF',
    marginLeft: 8,
  },
});