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

  // 1. Obtenemos TODAS las configuraciones y sus funciones del contexto
  const {
    profileImage, setProfileImage,
    userName, setUserName,
    userHandle, setUserHandle,
    age, setAge,
    profileType, setProfileType,
    isPrivate, setIsPrivate,
    notifications, setNotifications,
    logout
  } = useUser();

  // 2. Creamos estados locales para manejar los cambios del formulario
  const [localUserName, setLocalUserName] = useState(userName);
  const [localUserHandle, setLocalUserHandle] = useState(userHandle);
  const [localAge, setLocalAge] = useState(age.toString());
  const [localProfileType, setLocalProfileType] = useState(profileType);
  const [localIsPrivate, setLocalIsPrivate] = useState(isPrivate);
  const [localNotifications, setLocalNotifications] = useState(notifications);
  const [isUploading, setIsUploading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  // 3. La función de guardado ahora actualiza TODO el contexto
  const handleSaveChanges = () => {
    setUserName(localUserName);
    setUserHandle(localUserHandle);
    setAge(Number(localAge) || 0);
    setProfileType(localProfileType);
    setIsPrivate(localIsPrivate);
    setNotifications(localNotifications);

    Alert.alert("Éxito", "Los cambios se han guardado correctamente.");
    router.back();
  };

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sí, cerrar sesión", onPress: () => {
          logout();
          router.replace('/login');
      }, style: 'destructive'}
    ]);
  };

  const handleSelectImage = async (source: 'gallery' | 'camera') => {
    let result;
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    };

    try {
      if (source === 'gallery') {
        await ImagePicker.requestMediaLibraryPermissionsAsync();
        result = await ImagePicker.launchImageLibraryAsync(options);
      } else {
        await ImagePicker.requestCameraPermissionsAsync();
        result = await ImagePicker.launchCameraAsync(options);
      }
      if (!result.canceled) {
        uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo acceder a las imágenes.");
    }
  };

  const uploadImage = async (uri: string) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', {
        uri: uri,
        type: 'image/jpeg',
        name: 'profile.jpg',
    } as any);

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMG_BB_API_KEY}`, {
            method: 'POST',
            body: formData,
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        const json = await response.json();
        if (json.data && json.data.url) {
            setProfileImage(json.data.url);
            Alert.alert("Éxito", "La foto de perfil se actualizó correctamente.");
        } else {
            throw new Error(json.error?.message || "Error al subir la imagen.");
        }
    } catch (error: any) {
        Alert.alert("Error", `No se pudo subir la imagen: ${error.message}`);
    } finally {
        setIsUploading(false);
    }
  };

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
        {/* --- Sección de Perfil --- */}
        <Card style={styles.card}>
          <Card.Title title="Perfil" left={(props) => <List.Icon {...props} icon="account-outline" />} />
          <Card.Content>
            <View style={styles.avatarContainer}>
              {isUploading ? (
                <ActivityIndicator size="large" color={theme.colors.primary} style={{height: 80}} />
              ) : (
                <Avatar.Image size={80} source={{ uri: profileImage || 'https://avatar.iran.liara.run/public/47' }} />
              )}
              <Button icon="camera" mode="contained-tonal" onPress={showImageOptions} style={styles.changePhotoButton} disabled={isUploading}>
                Cambiar foto
              </Button>
            </View>
            <Divider style={styles.divider} />
            <Text style={styles.label}>Tipo de perfil</Text>
            <Menu visible={menuVisible} onDismiss={() => setMenuVisible(false)} anchor={
                <Button mode="outlined" onPress={() => setMenuVisible(true)} icon={localProfileType === 'common' ? 'account-outline' : 'office-building-outline'} contentStyle={styles.dropdownButtonContent} style={styles.dropdownButton} labelStyle={{ color: theme.colors.onSurface }}>
                  {localProfileType === 'common' ? 'Usuario común' : 'Empresa'}
                </Button>
            }>
              <Menu.Item onPress={() => { setLocalProfileType('common'); setMenuVisible(false); }} title="Usuario común" leadingIcon="account-outline"/>
              <Menu.Item onPress={() => { setLocalProfileType('company'); setMenuVisible(false); }} title="Empresa" leadingIcon="office-building-outline"/>
            </Menu>
            <Divider style={styles.divider} />
            <Text style={styles.label}>Información personal</Text>
            <TextInput label="Nombre completo" value={localUserName} onChangeText={setLocalUserName} mode="outlined" style={styles.input} />
            <TextInput label="Nombre de usuario" value={localUserHandle} onChangeText={setLocalUserHandle} mode="outlined" style={styles.input} left={<TextInput.Icon icon="at" />} />
            <TextInput label="Edad" value={localAge} onChangeText={setLocalAge} mode="outlined" style={styles.input} keyboardType="numeric" />
          </Card.Content>
        </Card>

        {/* --- Sección de Privacidad y Seguridad --- */}
        <Card style={styles.card}>
            <Card.Title title="Privacidad y Seguridad" left={(props) => <List.Icon {...props} icon="lock-outline" />} />
            <Card.Content>
                <List.Item title="Perfil privado" description="Solo tus amigos pueden ver tu actividad" right={() => <Switch value={localIsPrivate} onValueChange={setLocalIsPrivate} />} />
                <Divider style={styles.divider} />
                <Text style={styles.label}>Cambiar contraseña</Text>
                <TextInput label="Contraseña actual" mode="outlined" secureTextEntry style={styles.input} />
                <TextInput label="Nueva contraseña" mode="outlined" secureTextEntry style={styles.input} />
                <TextInput label="Confirmar nueva contraseña" mode="outlined" secureTextEntry style={styles.input} />
                <Button mode="contained-tonal" onPress={() => {}} style={{ marginTop: 10 }}>Actualizar contraseña</Button>
            </Card.Content>
        </Card>

        {/* --- Sección de Notificaciones --- */}
        <Card style={styles.card}>
          <Card.Title title="Notificaciones" left={(props) => <List.Icon {...props} icon="bell-outline" />} />
          <Card.Content>
            <List.Item title="Notificaciones push" description="Recibe alertas sobre nuevos retos y eventos" right={() => <Switch value={localNotifications.push} onValueChange={v => setLocalNotifications(s => ({...s, push: v}))} />} />
            <Divider style={styles.divider} />
            <Text style={styles.label}>Tipos de notificaciones</Text>
            <List.Item title="Nuevos retos disponibles" right={() => <Switch value={localNotifications.newChallenges} onValueChange={v => setLocalNotifications(s => ({...s, newChallenges: v}))} />} />
            <List.Item title="Eventos próximos" right={() => <Switch value={localNotifications.upcomingEvents} onValueChange={v => setLocalNotifications(s => ({...s, upcomingEvents: v}))} />} />
            <List.Item title="Actividad de amigos" right={() => <Switch value={localNotifications.friendActivity} onValueChange={v => setLocalNotifications(s => ({...s, friendActivity: v}))} />} />
            <List.Item title="Recordatorios de retos" right={() => <Switch value={localNotifications.challengeReminders} onValueChange={v => setLocalNotifications(s => ({...s, challengeReminders: v}))} />} />
          </Card.Content>
        </Card>
      </ScrollView>

      {/* --- Botones de acción fijos --- */}
      <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
        <Button icon="content-save" mode="contained" onPress={handleSaveChanges} style={styles.footerButton}>
          Guardar cambios
        </Button>
        <Button icon="logout" onPress={handleLogout} textColor={theme.colors.error} style={styles.footerButton}>
          Cerrar sesión
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    scrollContainer: { padding: 16, paddingBottom: 32 },
    card: { marginBottom: 16, backgroundColor: 'white' },
    avatarContainer: { alignItems: 'center', marginBottom: 16 },
    changePhotoButton: { marginTop: 12 },
    divider: { marginVertical: 16 },
    label: { fontSize: 16, marginBottom: 8, color: '#333', fontWeight: '500' },
    input: { marginBottom: 12 },
    footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
    footerButton: { marginBottom: 8 },
    dropdownButton: { backgroundColor: 'white', height: 56, justifyContent: 'center', borderColor: '#79747E' },
    dropdownButtonContent: { justifyContent: 'flex-start' },
});

