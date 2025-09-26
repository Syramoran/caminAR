import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
// Se elimina la importación de LinearGradient

export default function WelcomeScreen() {
  return (
    <ImageBackground
      source={require('../assets/images/fondo.jpg')} // Reemplaza con la ruta de tu imagen
      resizeMode="cover"
      style={styles.imageBackground}
    >
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}></View>
          </View>

          <Text style={styles.title}>
            CaminAR
          </Text>
          <Text style={styles.subtitle}>
            La aventura se encuentra con la ecología.
            Descubrí, desafiá y marcá la diferencia.
          </Text>

          {/* Botón para navegar a la pantalla de Login */}
          <Link href="/login" asChild>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>
                Comenzá tu viaje ecológico
              </Text>
            </TouchableOpacity>
          </Link>

          <Text style={styles.missionText}>
            Impulsado por tu pasión por el planeta
          </Text>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  imageBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)', // Negro con 50% de opacidad
  },
  safeArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, // Asegura que el contenido esté por encima del overlay
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  logoContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#2F855A',
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoCircle: {
    width: 40,
    height: 40,
    backgroundColor: 'transparent',
    borderRadius: 9999,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginBottom: 10,
  },
  subtitle: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  buttonText: {
    color: '#2F855A',
    fontWeight: '700',
    fontSize: 16,
  },
  missionText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 80,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});