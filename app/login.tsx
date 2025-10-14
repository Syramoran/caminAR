import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { SafeAreaView } from 'react-native-safe-area-context';

type LoginFormInputs = {
  email: string;
  password: string;
};

export default function LoginScreen() {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = (data) => {
    console.log('Datos del formulario:', data);
    Alert.alert('Formulario Enviado', 'Revisa la consola para ver los datos del formulario.');
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
      >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.header}>
              <Image
                source={require('../assets/images/icon.png')}
                style={styles.logoImage} 
                resizeMode="contain"
              />
              <Text style={styles.welcomeTitle}>¡Bienvenido!</Text>
              <Text style={styles.welcomeText}>Unite a la comunidad de eco-aventureros</Text>
            </View>

            <View style={styles.formContainer}>
              <Controller
                control={control}
                rules={{
                  required: 'El correo electrónico es requerido.',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Formato de correo electrónico inválido.',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Correo electrónico"
                    placeholderTextColor="#A0AEC0"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                )}
                name="email"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

              <Controller
                control={control}
                rules={{
                  required: 'La contraseña es requerida.',
                  minLength: {
                    value: 6,
                    message: 'La contraseña debe tener al menos 6 caracteres.',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    placeholderTextColor="#A0AEC0"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    secureTextEntry
                  />
                )}
                name="password"
              />
              {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

              <TouchableOpacity style={styles.loginButton} onPress={handleSubmit(onSubmit)}>
                <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
              </TouchableOpacity>
            </View>

            <Link href="/register" asChild>
              <TouchableOpacity style={styles.registerButton}>
                <Text style={styles.registerButtonText}>Registrarse</Text>
              </TouchableOpacity>
            </Link>
            <Text style={styles.missionText}>
              Al continuar, aceptas nuestra misión eco-amigable
            </Text>
          </View>
        </View>
      </ScrollView>
 </KeyboardAvoidingView>

  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#deee87',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    padding: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
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
    backgroundColor: 'white',
    borderRadius: 9999,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#276749',
    textAlign: 'center',
  },
  welcomeText: {
    color: '#4A5568',
    textAlign: 'center',
    marginTop: 4,
  },
  loginSection: {
    alignItems: 'center',
    marginTop: 24,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2F855A',
  },
  loginSubtitle: {
    color: '#718096',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  formContainer: {
    width: '100%',
    gap: 16,
  },
  input: {
    width: '100%',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    color: '#E53E3E',
    fontSize: 12,
    marginTop: 4,
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#2F855A',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  registerButton: {
    width: '100%',
    marginTop: 16,
    padding: 16,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#2F855A',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  logoImage: {
    width: 120, 
    height: 120,
    marginBottom: 24, 
  },
  missionText: {
    color: '#A0AEC0',
    textAlign: 'center',
    fontSize: 12,
    marginTop: 24,
  },

});
