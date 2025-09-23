
// app/welcome.tsx
import { View, Text, Button } from 'react-native';
import { Link } from 'expo-router';

export default function TutorialScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Hola soy un tutorial</Text>
    </View>
  );
}
