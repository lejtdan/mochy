import React, { useState, useContext } from 'react';
import { API_BASE_URL } from '../config';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import MapboxAutocomplete from '../components/MapboxAutocomplete';

export default function PublishRideScreen({ navigation }: any) {
  const { token, user } = useContext(AuthContext);
  
  const [origin, setOrigin] = useState('');
  const [originLat, setOriginLat] = useState<number | null>(null);
  const [originLng, setOriginLng] = useState<number | null>(null);

  const [destination, setDestination] = useState('');
  const [destLat, setDestLat] = useState<number | null>(null);
  const [destLng, setDestLng] = useState<number | null>(null);

  const [date, setDate] = useState('');
  const [seats, setSeats] = useState('');
  const [price, setPrice] = useState('');

  const handlePublish = async () => {
    if (!origin || !destination || !date || !seats || !price) {
      Alert.alert('Error', 'Todos los campos básicos son obligatorios');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/rides`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          origin,
          destination,
          originLat,
          originLng,
          destLat,
          destLng,
          date,
          availableSeats: parseInt(seats, 10),
          price: parseFloat(price)
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Éxito', 'Tu viaje ha sido publicado con geolocalización');
        navigation.goBack();
      } else {
        Alert.alert('Error', data.error || 'No se pudo publicar el viaje');
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo conectar al servidor');
      console.error(e);
    }
  };

  if (user?.role !== 'CONDUCTOR') {
    return (
      <View style={styles.containerCenter}>
        <Text style={styles.title}>Acceso Denegado</Text>
        <Text style={styles.description}>Solo los conductores pueden publicar viajes.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Publicar un Viaje</Text>
      
      <Text style={styles.label}>Origen (Buscador Mapbox)</Text>
      <View style={styles.autocompleteWrapper}>
        <MapboxAutocomplete 
          placeholder="Busca el punto de partida..."
          onSelect={(address, lat, lng) => {
            setOrigin(address);
            setOriginLat(lat);
            setOriginLng(lng);
          }}
        />
      </View>
      
      <Text style={styles.label}>Destino (Buscador Mapbox)</Text>
      <View style={styles.autocompleteWrapper}>
        <MapboxAutocomplete 
          placeholder="Busca el punto de llegada..."
          onSelect={(address, lat, lng) => {
            setDestination(address);
            setDestLat(lat);
            setDestLng(lng);
          }}
        />
      </View>

      <Text style={styles.label}>Fecha y Hora</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej. 2026-10-05 14:00"
        value={date}
        onChangeText={setDate}
        placeholderTextColor="#A0AEC0"
      />

      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Asientos</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. 3"
            value={seats}
            onChangeText={setSeats}
            keyboardType="number-pad"
            placeholderTextColor="#A0AEC0"
          />
        </View>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Precio ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. 150.00"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
            placeholderTextColor="#A0AEC0"
          />
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handlePublish}>
        <Text style={styles.buttonText}>Publicar Viaje Trazado</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#1E1E2C',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  containerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1E2C',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    color: '#E2E8F0',
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600'
  },
  input: {
    backgroundColor: '#2D3748',
    color: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  autocompleteWrapper: {
    zIndex: 10,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: -1, // Evitar superposición del autocomplete
  },
  halfWidth: {
    width: '48%'
  },
  button: {
    backgroundColor: '#3B82F6', 
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    zIndex: -1,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  description: {
    fontSize: 16,
    color: '#A0AEC0',
    textAlign: 'center',
  },
});
