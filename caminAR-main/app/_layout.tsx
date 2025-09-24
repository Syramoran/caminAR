// app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3LightTheme as DefaultTheme } from 'react-native-paper';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#06543a',
    secondary: '#bed77c',
    tertiary: '#dd6f3f', // En Material Design 3, 'accent' se suele llamar 'tertiary'
    background: '#FFFFFF', // Fondo para componentes como las Cards
    surface: '#FFFFFF',
    surfaceVariant: '#F5F5F5',
    elevation: {
      ...DefaultTheme.colors.elevation,
      // El level2 se puede usar para el fondo general de las pantallas
      level2: '#e8d2ce',
    },
  },
};

export default function RootLayout() {
  return (
    <>
      <Stack>
        {/*
          Estas son las primeras pantallas.
          El usuario las verá al iniciar la app.
        */}
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />

        {/*
          Esta es la ruta principal. Al navegar a ella,
          se mostrará la barra de pestañas.
        */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/*
          Estas son las demás pantallas, accesibles desde
          otras partes de la app, como la de Perfil.
        */}
        <Stack.Screen name="tutorial" options={{ headerShown: false }} />
        <Stack.Screen name="configuracion" options={{ headerShown: false }} />
        <Stack.Screen name="mapa" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}