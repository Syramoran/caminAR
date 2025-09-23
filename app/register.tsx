
// app/welcome.tsx
import { View, Text, Button } from 'react-native';
import { Link } from 'expo-router';

export default function RegisterScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Register Works</Text>

      {/* Botón para navegar a la pantalla de Login */}
      <Link href="/welcome" asChild>
        <Button title="Welcome" />
      </Link>

      {/* Botón para navegar a la pantalla de Registro */}
      <Link href="/login" asChild>
        <Button title="login" />
      </Link>

      <Link href="/tutorial" asChild>
        <Button title="tutorial" />
      </Link>
    </View>
  );
}
