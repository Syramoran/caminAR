// app/welcome.tsx
import { View, Text, Button } from 'react-native';
import { Link } from 'expo-router';

export default function LoginScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Login Works</Text>

      {/* Botón para navegar a la pantalla de Registro */}
      <Link href="/(tabs)" asChild>
        <Button title="Ingresar" />
      </Link>

      <Link href="/register" asChild>
        <Button title="Registrarse" />
      </Link>
    </View>
  );
}
