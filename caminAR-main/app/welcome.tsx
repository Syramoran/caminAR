// app/welcome.tsx
import { View, Text, Button } from 'react-native';
import { Link } from 'expo-router';

export default function WelcomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>¡Bienvenido a CaminAR!</Text>

      {/* Botón para navegar a la pantalla de Login */}
      <Link href="/login" asChild>
        <Button title="Ingresar" />
      </Link>

      {/* Botón para navegar a la pantalla de Registro */}
      <Link href="/register" asChild>
        <Button title="Registrarse" />
      </Link>
    </View>
  );
}
