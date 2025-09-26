import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type RegisterFormInputs = {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
};

export default function RegisterScreen() {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<RegisterFormInputs>({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      passwordConfirm: '',
    },
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordConfirmVisible, setPasswordConfirmVisible] = useState(false);

  // const password = watch('password');

  const onSubmit: SubmitHandler<RegisterFormInputs> = (data) => {
    // La validación se realiza de forma automática con react-hook-form
    // Si la validación pasa, aquí puedes enviar los datos al servidor
    console.log('Datos del formulario de registro:', data);
    Alert.alert('Registro Exitoso', '¡Tu cuenta ha sido creada! Ahora puedes iniciar sesión.');
    router.replace('/tutorial/tutorial1');
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContentContainer}>
          <View style={styles.card}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <View style={styles.logoCircle}></View>
              </View>
              <Text style={styles.welcomeTitle}>Bienvenido a CaminAR</Text>
              <Text style={styles.welcomeText}>Únete a la comunidad de eco-aventureros</Text>
            </View>

            <View style={styles.loginSection}>
              <Text style={styles.loginTitle}>Registrarse</Text>
              <Text style={styles.loginSubtitle}>Crea tu cuenta para continuar</Text>
            </View>

            <View style={styles.formContainer}>
              {/* Campo de Username */}
              <Controller
                control={control}
                rules={{
                  required: 'El nombre de usuario es requerido.',
                  pattern: {
                    value: /^[a-zA-Z0-9]+$/i,
                    message: 'El nombre de usuario solo puede contener letras y números.',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Nombre de usuario"
                    placeholderTextColor="#A0AEC0"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="none"
                  />
                )}
                name="username"
              />
              {errors.username && <Text style={styles.errorText}>{errors.username.message}</Text>}

              {/* Campo de Correo Electrónico */}
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

              {/* Campo de Contraseña */}
              <View style={styles.inputContainer}>
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
                      style={styles.inputWithIcon}
                      placeholder="Contraseña"
                      placeholderTextColor="#A0AEC0"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      secureTextEntry={!passwordVisible}
                    />
                  )}
                  name="password"
                />
                <TouchableOpacity
                  style={styles.icon}
                  onPress={() => setPasswordVisible(!passwordVisible)}
                >
                  <Ionicons
                    name={passwordVisible ? 'eye-off' : 'eye'}
                    size={24}
                    color="#A0AEC0"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

              {/* Campo de Confirmar Contraseña */}
              <View style={styles.inputContainer}>
                <Controller
                  control={control}
                  rules={{
                    required: 'Confirma tu contraseña.',
validate: (value) => value.trim() === getValues('password').trim() || 'Las contraseñas no coinciden.',                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.inputWithIcon}
                      placeholder="Confirmar contraseña"
                      placeholderTextColor="#A0AEC0"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      secureTextEntry={!passwordConfirmVisible}
                    />
                  )}
                  name="passwordConfirm"
                />
                <TouchableOpacity
                  style={styles.icon}
                  onPress={() => setPasswordConfirmVisible(!passwordConfirmVisible)}
                >
                  <Ionicons
                    name={passwordConfirmVisible ? 'eye-off' : 'eye'}
                    size={24}
                    color="#A0AEC0"
                  />
                </TouchableOpacity>
              </View>
              {errors.passwordConfirm && <Text style={styles.errorText}>{errors.passwordConfirm.message}</Text>}

              {/* Botón de Registro */}
              <TouchableOpacity style={styles.loginButton} onPress={handleSubmit(onSubmit)}>
                <Text style={styles.loginButtonText}>Registrarse</Text>
              </TouchableOpacity>
            </View>

            {/* Enlace para volver al Login */}
            <Link href="/login" asChild>
              <TouchableOpacity style={styles.registerButton}>
                <Text style={styles.registerButtonText}>¿Ya tienes una cuenta? Inicia sesión</Text>
              </TouchableOpacity>
            </Link>
            <Text style={styles.missionText}>
              Al continuar, aceptas nuestra misión eco-amigable
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#deee87',
  },
  container: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  inputWithIcon: {
    flex: 1,
    padding: 16,
    color: '#000',
  },
  icon: {
    padding: 10,
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
  missionText: {
    color: '#A0AEC0',
    textAlign: 'center',
    fontSize: 12,
    marginTop: 24,
  },
});