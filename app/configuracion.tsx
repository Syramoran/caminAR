import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Alert, ActivityIndicator } from 'react-native';
import {
  Appbar,
  Avatar,
  Button,
  Card,
  Divider,
  List,
  Menu,
  // Switch, // Ya no se necesita Switch
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '../context/UserContext'; // Importa useUser actualizado
import { useAuth } from '../context/AuthContext'; // Importa useAuth para signOut
import { UserProfileData } from '../context/UserContext'; // Importar la interfaz para el tipado

// --- Mapeo de tipos de perfil ---
const profileTypeToSupabase = (type: 'common' | 'company'): 'usuario' | 'organizacion' => {
    return type === 'company' ? 'organizacion' : 'usuario';
};

export default function ConfiguracionScreen() {
  const theme = useTheme();
  const router = useRouter();
  const IMG_BB_API_KEY = 'fe710239ec2669c60deafe46f166c86d';

  // 1. Obtenemos datos y funciones de los contextos (solo los relevantes y existentes)
  const {
    username, // Este es el 'usuario' de la DB
    profileImage, // Este es el 'avatar_url' de la DB
    profileType, // Este es el 'tipo_perfil' de la DB
    updateProfile,
    loadingProfile,
    nombre, // Descomentar si la columna 'nombre' existe y quieres mostrarla/editarla
    apellido, // Descomentar si la columna 'apellido' existe y quieres mostrarla/editarla
    // Los siguientes son locales y no se guardan en DB, decide si los necesitas aquí
    // userHandle,
    // age,
    // isPrivate,
  } = useUser();

  const { signOut } = useAuth();

  // 2. Estados locales (solo los que se muestran/editan y SÍ existen en DB)
  const [localUsername, setLocalUsername] = useState(username);
  const [localNombre, setLocalNombre] = useState(nombre || ''); // Descomentar si se usa
  const [localApellido, setLocalApellido] = useState(apellido || ''); // Descomentar si se usa
  const [localProfileType, setLocalProfileType] = useState(profileType);
  // Ya no hay estados locales para age, userHandle, isPrivate, notifications

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  // Efecto para sincronizar estados locales con los del contexto
  useEffect(() => {
    setLocalUsername(username);
    setLocalProfileType(profileType);
    setLocalNombre(nombre || ''); // Descomentar si se usa
    setLocalApellido(apellido || ''); // Descomentar si se usa
  }, [username, profileType/*, nombre, apellido*/]);

  // 3. Función de guardado (solo con campos existentes en DB)
  const handleSaveChanges = async () => {
    setIsSaving(true);
    // Solo incluimos campos que SÍ existen en la DB
    const updates: Partial<UserProfileData> = {
      usuario: localUsername,
      nombre: localNombre, // Descomentar si existen y se editan
      apellido: localApellido, // Descomentar si existen y se editan
      tipo_perfil: profileTypeToSupabase(localProfileType),
      // NO incluimos NADA MÁS que no esté en la tabla 'usuarios'
    };

    // (Opcional: lógica para enviar solo cambios)
    const changedUpdates: Partial<UserProfileData> = {};
    Object.keys(updates).forEach((key) => {
        const typedKey = key as keyof UserProfileData;
        let originalValue: any;
        // Compara con los valores originales del contexto
        switch(typedKey) {
            case 'usuario': originalValue = username; break;
            case 'tipo_perfil': originalValue = profileTypeToSupabase(profileType); break;
            case 'nombre': originalValue = nombre; break; // Descomentar si se usa
            case 'apellido': originalValue = apellido; break; // Descomentar si se usa
            default: break;
        }
        if (updates[typedKey] !== originalValue) {
            changedUpdates[typedKey] = updates[typedKey];
        }
    });

    if (Object.keys(changedUpdates).length > 0) {
        console.log("Sending updates to Supabase:", changedUpdates);
        const success = await updateProfile(changedUpdates);

        if (success) {
            Alert.alert("Éxito", "Los cambios se han guardado correctamente.");
            router.back();
        } else {
            Alert.alert("Error", "No se pudieron guardar los cambios. Intenta de nuevo.");
        }
    } else {
         Alert.alert("Información", "No hay cambios para guardar.");
         router.back(); // Volver aunque no haya cambios
    }

    setIsSaving(false);
  };

  // 4. Logout (sin cambios)
  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sí, cerrar sesión", onPress: async () => {
          await signOut();
          router.replace('/login');
      }, style: 'destructive'}
    ]);
  };

  // Selección de imagen (sin cambios)
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
      if (!result.canceled && result.assets && result.assets.length > 0) {
        uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("ImagePicker Error:", error);
      Alert.alert("Error", "No se pudo acceder a las imágenes.");
    }
  };

  // 5. Subida de imagen y actualización del perfil (solo actualiza avatar_url)
  const uploadImage = async (uri: string) => {
    setIsUploading(true);
    const formData = new FormData();
    const fileType = uri.split('.').pop();
    const fileName = uri.split('/').pop();

    formData.append('image', {
        uri: uri,
        type: `image/${fileType || 'jpeg'}`,
        name: fileName || 'profile.jpg',
    } as any);

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMG_BB_API_KEY}`, {
            method: 'POST',
            body: formData,
        });
        const json = await response.json();
        if (json.data && json.data.url) {
            const imageUrl = json.data.url;
            // Llama a updateProfile solo con avatar_url (columna que sí existe)
            const success = await updateProfile({ avatar_url: imageUrl });
            if (success) {
                Alert.alert("Éxito", "La foto de perfil se actualizó correctamente.");
            } else {
                 throw new Error("No se pudo guardar la URL de la imagen en el perfil.");
            }
        } else {
            throw new Error(json.error?.message || "Error desconocido al subir la imagen a ImgBB.");
        }
    } catch (error: any) {
        console.error("Upload/Update Image Error:", error);
        Alert.alert("Error", `No se pudo actualizar la foto de perfil: ${error.message}`);
    } finally {
        setIsUploading(false);
    }
  };

  // Mostrar opciones de imagen (sin cambios)
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

  // Indicador de carga inicial
  if (loadingProfile && !username) { // Usa username que viene del contexto ahora
     return (
        <SafeAreaView style={[styles.safeArea, {justifyContent: 'center', alignItems: 'center'}]}>
             <ActivityIndicator size="large" />
        </SafeAreaView>
     );
  }

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
                // Usa profileImage que viene mapeado de avatar_url en useUser
                <Avatar.Image size={80} source={{ uri: profileImage || 'https://avatar.iran.liara.run/public/47' }} />
              )}
              <Button icon="camera" mode="contained-tonal" onPress={showImageOptions} style={styles.changePhotoButton} disabled={isUploading || isSaving}>
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
            {/* Usa localUsername que se sincroniza con 'usuario' */}
            <TextInput label="Nombre de usuario (público)" value={localUsername} onChangeText={setLocalUsername} mode="outlined" style={styles.input} />
            {/* Campos nombre y apellido comentados */}
            <TextInput label="Nombre real" value={localNombre} onChangeText={setLocalNombre} mode="outlined" style={styles.input} />
            <TextInput label="Apellido" value={localApellido} onChangeText={setLocalApellido} mode="outlined" style={styles.input} />
          </Card.Content>
        </Card>

        {/* --- Sección de Privacidad y Seguridad (eliminado is_private) --- */}
        <Card style={styles.card}>
            <Card.Title title="Privacidad y Seguridad" left={(props) => <List.Icon {...props} icon="lock-outline" />} />
            <Card.Content>
                <Text style={styles.label}>Cambiar contraseña (Funcionalidad pendiente)</Text>
                <TextInput label="Contraseña actual" mode="outlined" secureTextEntry style={styles.input} disabled />
                <TextInput label="Nueva contraseña" mode="outlined" secureTextEntry style={styles.input} disabled />
                <TextInput label="Confirmar nueva contraseña" mode="outlined" secureTextEntry style={styles.input} disabled />
                <Button mode="contained-tonal" onPress={() => {}} style={{ marginTop: 10 }} disabled>Actualizar contraseña</Button>
            </Card.Content>
        </Card>

        {/* --- Sección de Notificaciones ELIMINADA --- */}

      </ScrollView>

      {/* --- Botones de acción fijos --- */}
      <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
        <Button icon="content-save" mode="contained" onPress={handleSaveChanges} style={styles.footerButton} disabled={isSaving || isUploading || loadingProfile} loading={isSaving}>
          {isSaving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
        <Button icon="logout" onPress={handleLogout} textColor={theme.colors.error} style={styles.footerButton} disabled={isSaving || isUploading}>
          Cerrar sesión
        </Button>
      </View>
    </SafeAreaView>
  );
}

// Estilos (sin cambios)
const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    scrollContainer: { padding: 16, paddingBottom: 32 },
    card: { marginBottom: 16, backgroundColor: 'white' },
    avatarContainer: { alignItems: 'center', marginBottom: 16 },
    changePhotoButton: { marginTop: 12 },
    divider: { marginVertical: 16 },
    label: { fontSize: 16, marginBottom: 8, color: '#333', fontWeight: '500' },
    input: { marginBottom: 12 },
    footer: {
        padding: 16,
        paddingBottom: 24,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0'
    },
    footerButton: { marginBottom: 8 },
    dropdownButton: { backgroundColor: 'white', height: 56, justifyContent: 'center', borderColor: '#79747E' },
    dropdownButtonContent: { justifyContent: 'flex-start' },
});

