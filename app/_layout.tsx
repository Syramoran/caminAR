import { Stack, useRouter, SplashScreen } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { theme } from '../constants/theme';
import { StatusBar } from 'expo-status-bar';
import { UserProvider } from '../context/UserContext';
import { AuthProvider, useAuth } from '../context/AuthContext'; // Importar AuthProvider y useAuth
import { useEffect } from 'react'; // Importar useEffect

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Componente interno para manejar la lógica de redirección
function RootLayoutNav() {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('Auth Loading:', loading, 'Session:', !!session); // Log para depurar
    if (!loading) {
      SplashScreen.hideAsync(); // Oculta la pantalla de carga una vez que el estado de auth está listo
      if (session) {
        // Si hay sesión, redirige al grupo (tabs)
        console.log('Session exists, replacing route with /(tabs)');
        router.replace('/(tabs)');
      } else {
        // Si no hay sesión, redirige a welcome (o login si prefieres)
        console.log('No session, replacing route with /welcome');
        router.replace('/welcome');
      }
    }
  }, [session, loading, router]); // Dependencias del efecto

  // Muestra null o un spinner mientras carga el estado de autenticación
  // para evitar flashes de contenido incorrecto
  if (loading) {
     console.log('Auth is loading, returning null');
    return null; // O un componente de carga si prefieres <ActivityIndicator />;
  }

  // Una vez que loading es false, Stack decide qué mostrar basado en la URL
  // (que acabamos de forzar con router.replace)
  return (
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        {/*
          Las pantallas de autenticación/bienvenida ahora se manejan
          por la lógica de redirección de arriba. No necesitan estar
          condicionalmente aquí si el router.replace funciona.
          Solo necesitamos asegurarnos que existan en la estructura de archivos.
        */}
        <Stack.Screen name="welcome" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="tutorial/tutorial1" />
        <Stack.Screen name="tutorial/tutorial2" />
        <Stack.Screen name="tutorial/tutorial3" />

        {/* Grupo principal de Tabs */}
        <Stack.Screen name="(tabs)" />

        {/* Pantallas adicionales */}
        <Stack.Screen name="configuracion" />
        <Stack.Screen name="mapa" />
      </Stack>
  );
}


export default function RootLayout() {
  return (
    // 1. AuthProvider envuelve todo
    <AuthProvider>
      {/* 2. UserProvider envuelve PaperProvider y el resto */}
      <UserProvider>
        <PaperProvider theme={theme}>
          {/* 3. El componente RootLayoutNav maneja la lógica */}
          <RootLayoutNav />
          <StatusBar style="auto" />
        </PaperProvider>
      </UserProvider>
    </AuthProvider>
  );
}

