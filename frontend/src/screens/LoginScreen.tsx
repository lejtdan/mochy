import React, { useState, useContext, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

// Endpoint de GitHub
const discovery = {
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
  revocationEndpoint: 'https://github.com/settings/connections/applications/YOUR_CLIENT_ID',
};

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);

  // Fade-in animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  // Configuración de GitHub Auth
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: 'YOUR_CLIENT_ID', // Reemplaza con tu Client ID real de GitHub
      scopes: ['user:email'],
      redirectUri: makeRedirectUri({
        scheme: 'mochy'
      }),
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      handleGitHubLogin(code);
    }
  }, [response]);

  const handleGitHubLogin = async (code: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/github`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (res.ok) {
        await login(data.token, data.user);
      } else {
        Alert.alert('Error', data.error || 'Error en el login con GitHub');
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo conectar al servidor para el login con GitHub');
      console.error(e);
    }
  };

  const handleLogin = async () => {
    try {
      // NOTE: Update this URL to match your local IP when testing on mobile devices
      // E.g. http://192.168.1.50:3000/api/auth/login
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        await login(data.token, data.user);
      } else {
        Alert.alert('Error', data.error || 'Autenticación fallida');
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo conectar al servidor');
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <Text style={styles.title}>🚗 Mochy</Text>
      <Text style={styles.subtitle}>Tu app de carpooling seguro</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Correo Electrónico"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholderTextColor="#A0AEC0"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#A0AEC0"
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>o continúa con</Text>

      <TouchableOpacity 
        style={[styles.button, styles.githubButton]} 
        onPress={() => promptAsync()}
        disabled={!request}
      >
        <Text style={[styles.buttonText, styles.githubButtonText]}>GitHub</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#1E1E2C',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 40,
    textAlign: 'center',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#2D3748',
    color: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4ADE80',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#1E1E2C',
    fontWeight: 'bold',
    fontSize: 18,
  },
  link: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    color: '#A0AEC0',
    fontSize: 16,
  },
  orText: {
    color: '#94A3B8',
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 14,
  },
  githubButton: {
    backgroundColor: '#333',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 0,
  },
  githubButtonText: {
    color: '#FFF',
  },
});
