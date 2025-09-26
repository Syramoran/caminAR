import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Alert, ActivityIndicator } from 'react-native';
import {
  Appbar,
  Avatar,
  Button,
  Card,
  Divider,
  List,
  Menu,
  Switch,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '../context/UserContext';

export default function ConfiguracionScreen() {
  const theme = useTheme();
  const router = useRouter();
  const IMG_BB_API_KEY = 'fe710239ec2669c60deafe46f166c86d';

  const { profileImage, setProfileImage } = useUser();
  const [isUploading, setIsUploading] = useState(false);
  // ...otros estados
  // --- Estados del Componente ---
  const [profileType, setProfileType] = useState('common');
  const [isPrivate, setIsPrivate] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [newChallenges, setNewChallenges] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState(true);
  const [friendActivity, setFriendActivity] = useState(false);
  const [challengeReminders, setChallengeReminders] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);


  // --- Funciones para la Lógica de la Imagen ---

  /**
   * Abre la cámara o la galería para que el usuario seleccione una imagen.
   * @param source - Define si se debe abrir la 'camera' o la 'gallery'.
   */
  const handleSelectImage = async (source: 'gallery' | 'camera') => {
    let result;
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Solo permite seleccionar imágenes
      allowsEditing: true, // Permite al usuario recortar la imagen
      aspect: [1, 1], // Fuerza un recorte cuadrado para el avatar
      quality: 0.7, // Comprime la imagen para que la subida sea más rápida
    };

    try {
      if (source === 'gallery') {
        await ImagePicker.requestMediaLibraryPermissionsAsync(); // Pide permiso para acceder a la galería
        result = await ImagePicker.launchImageLibraryAsync(options);
      } else {
        await ImagePicker.requestCameraPermissionsAsync(); // Pide permiso para usar la cámara
        result = await ImagePicker.launchCameraAsync(options);
      }

      // Si el usuario no canceló la selección, procedemos a subir la imagen.
      if (!result.canceled) {
        uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo acceder a las imágenes.");
    }
  };

  /**
   * Sube la imagen seleccionada a la API de ImgBB.
   * @param uri - La ruta local de la imagen en el dispositivo.
   */
  const uploadImage = async (uri: string) => {
    setIsUploading(true); // Activa el indicador de carga
    const formData = new FormData();
    // Preparamos la imagen para ser enviada en el formato que la API espera.
    formData.append('image', {
        uri: uri,
        type: 'image/jpeg',
        name: 'profile.jpg',
    } as any);

    try {
        // Realizamos la petición POST a la API de ImgBB.
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMG_BB_API_KEY}`, {
            method: 'POST',
            body: formData,
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        const json = await response.json();

        if (json.data && json.data.url) {
            // ¡Éxito! La API nos devolvió una URL pública para la imagen.
            // Actualizamos el estado GLOBAL a través del contexto.
            setProfileImage(json.data.url);
            Alert.alert("Éxito", "La foto de perfil se actualizó correctamente.");
        } else {
            // Si la API devuelve un error, lo mostramos.
            throw new Error(json.error?.message || "Error al subir la imagen.");
        }
    } catch (error: any) {
        Alert.alert("Error", `No se pudo subir la imagen: ${error.message}`);
    } finally {
        // Se ejecuta siempre, tanto si hubo éxito como si hubo error.
        setIsUploading(false); // Desactiva el indicador de carga
    }
  };

  /**
   * Muestra un menú de alerta para que el usuario elija entre cámara o galería.
   */
  const showImageOptions = () => {
    Alert.alert(
      "Cambiar foto de perfil",
      "Elige una opción",
      [
        { text: "Abrir cámara", onPress: () => handleSelectImage('camera') },
        { text: "Elegir de la galería", onPress: () => handleSelectImage('gallery') },
        { text: "Cancelar", style: "cancel" },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.BackAction onPress={() => router.back()} color="#fff" />
        <Appbar.Content title="Configuración" titleStyle={{ color: '#fff' }} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Title title="Perfil" left={(props) => <List.Icon {...props} icon="account-outline" />} />
          <Card.Content>
            <View style={styles.avatarContainer}>
              {isUploading ? (
                <ActivityIndicator size="large" color={theme.colors.primary} style={{height: 80}} />
              ) : (
                // --- AVATAR POR DEFECTO ACTUALIZADO AQUÍ ---
                // Ahora usa la URL que proporcionaste como imagen por defecto si no hay una foto de perfil subida.
                <Avatar.Image size={80} source={{ uri: profileImage || 'https://avatar.iran.liara.run/public/47' }} />
              )}
              <Button
                icon="camera"
                mode="contained-tonal"
                onPress={showImageOptions}
                style={styles.changePhotoButton}
                disabled={isUploading}
              >
                Cambiar foto
              </Button>
            </View>
            {/* ... El resto de tu JSX de configuración ... */}
            <Divider style={styles.divider} />
            <Text style={styles.label}>Tipo de perfil</Text>

            {/* --- COMPONENTE DROPDOWN IMPLEMENTADO --- */}
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setMenuVisible(true)}
                  icon={profileType === 'common' ? 'account-outline' : 'office-building-outline'}
                  contentStyle={styles.dropdownButtonContent}
                  style={styles.dropdownButton}
                  labelStyle={{ color: theme.colors.onSurface }}
                >
                  {profileType === 'common' ? 'Usuario común' : 'Empresa'}
                </Button>
              }
              style={{ width: '90%' }} // Ancho del menú desplegado
            >
              <Menu.Item
                onPress={() => {
                  setProfileType('common');
                  setMenuVisible(false);
                }}
                title="Usuario común"
                leadingIcon="account-outline"
              />
              <Menu.Item
                onPress={() => {
                  setProfileType('company');
                  setMenuVisible(false);
                }}
                title="Empresa"
                leadingIcon="office-building-outline"
              />
            </Menu>

            <Divider style={styles.divider} />
            <Text style={styles.label}>Información personal</Text>
            <TextInput label="Nombre completo" value="María González" mode="outlined" style={styles.input} />
            <TextInput label="Nombre de usuario" value="@maria_eco" mode="outlined" style={styles.input} left={<TextInput.Icon icon="at" />} />
            <TextInput label="Edad" value="28" mode="outlined" style={styles.input} keyboardType="numeric" />
          </Card.Content>
        </Card>

        {/* Sección de Privacidad y Seguridad */}
        <Card style={styles.card}>
            <Card.Title title="Privacidad y Seguridad" left={(props) => <List.Icon {...props} icon="lock-outline" />} />
            <Card.Content>
                <List.Item
                    title="Perfil privado"
                    description="Solo tus amigos pueden ver tu actividad"
                    right={() => <Switch value={isPrivate} onValueChange={setIsPrivate} />}
                />
                <Divider style={styles.divider} />
                <Text style={styles.label}>Cambiar contraseña</Text>
                <TextInput label="Contraseña actual" mode="outlined" secureTextEntry style={styles.input} />
                <TextInput label="Nueva contraseña" mode="outlined" secureTextEntry style={styles.input} />
                <TextInput label="Confirmar nueva contraseña" mode="outlined" secureTextEntry style={styles.input} />
                <Button mode="contained-tonal" onPress={() => {}} style={{ marginTop: 10 }}>Actualizar contraseña</Button>
            </Card.Content>
        </Card>

        {/* Sección de Notificaciones */}
        <Card style={styles.card}>
          <Card.Title title="Notificaciones" left={(props) => <List.Icon {...props} icon="bell-outline" />} />
          <Card.Content>
            <List.Item
              title="Notificaciones push"
              description="Recibe alertas sobre nuevos retos y eventos"
              right={() => <Switch value={pushNotifications} onValueChange={setPushNotifications} />}
            />
            <Divider style={styles.divider} />
            <Text style={styles.label}>Tipos de notificaciones</Text>
            <List.Item title="Nuevos retos disponibles" right={() => <Switch value={newChallenges} onValueChange={setNewChallenges} />} />
            <List.Item title="Eventos próximos" right={() => <Switch value={upcomingEvents} onValueChange={setUpcomingEvents} />} />
            <List.Item title="Actividad de amigos" right={() => <Switch value={friendActivity} onValueChange={setFriendActivity} />} />
            <List.Item title="Recordatorios de retos" right={() => <Switch value={challengeReminders} onValueChange={setChallengeReminders} />} />
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Botones de acción fijos en la parte inferior */}
      <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
        <Button icon="content-save" mode="contained" onPress={() => {}} style={styles.footerButton}>
          Guardar cambios
        </Button>
        <Button icon="logout" onPress={() => {}} textColor={theme.colors.error} style={styles.footerButton}>
          Cerrar sesión
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    scrollContainer: {
      padding: 16,
    },
    card: {
      marginBottom: 16,
      backgroundColor: 'white',
    },
    avatarContainer: {
      alignItems: 'center',
      marginBottom: 16,
    },
    changePhotoButton: {
      marginTop: 12,
    },
    divider: {
      marginVertical: 16,
    },
    label: {
      fontSize: 16,
      marginBottom: 8,
      color: '#333'
    },
    input: {
      marginBottom: 12,
    },
    footer: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: '#e0e0e0',
    },
    footerButton: {
      marginBottom: 8,
    },
    // Estilos para el nuevo dropdown
    dropdownButton: {
      backgroundColor: 'white',
      height: 56,
      justifyContent: 'center',
    },
    dropdownButtonContent: {
      justifyContent: 'flex-start',
    },
  });

