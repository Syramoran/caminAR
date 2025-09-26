import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function TutorialStep3() {
  const handleNext = () => {
    // Navega a la siguiente pantalla de la app y reemplaza la historia de navegación
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
        <Stack.Screen
        options={{
          headerShown: false, // Oculta el encabezado
        }}
      />
      <View style={styles.container}>
        {/* Espacio para la ilustración */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require('../../assets/images/3.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        {/* Contenido del paso */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Ganá puntos y premios</Text>
          <Text style={styles.description}>
            Por cada reto que completes, acumulás puntos. Canjeá tus puntos por cupones de descuento y premios de nuestros negocios colaboradores.
          </Text>
        </View>

        {/* Botón de navegación */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleNext} style={styles.button}>
            <Text style={styles.buttonText}>Comenzar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding:30,
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    paddingBottom: 40,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: '80%',
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
