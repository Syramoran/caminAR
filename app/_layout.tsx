import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { theme } from '../constants/theme'; // Importamos nuestro tema centralizado
import { StatusBar } from 'expo-status-bar';
import { UserProvider } from '../context/UserContext'; // Esta es la línea que faltaba

export default function RootLayout() {
  return (
      <UserProvider>
        <PaperProvider theme={theme}>
          <Stack
            screenOptions={{
              headerShown: false, // Ocultamos los encabezados por defecto para todas las pantallas
            }}
          >
            {/*
              Estas son las primeras pantallas.
              El usuario las verá al iniciar la app.
            */}
            <Stack.Screen name="welcome" />
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />

            {/*
              Esta es la ruta principal. Al navegar a ella,
              se mostrará la barra de pestañas.
            */}
            <Stack.Screen name="(tabs)" />

            {/*
              Estas son las demás pantallas, accesibles desde
              otras partes de la app, como la de Perfil.
            */}
            <Stack.Screen name="tutorial" />
            <Stack.Screen name="configuracion" />
            <Stack.Screen name="mapa" />
          </Stack>

          <StatusBar style="auto" />
        </PaperProvider>
      </UserProvider>
  );
}

