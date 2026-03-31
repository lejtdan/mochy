import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import MapboxAutocomplete from '../components/MapboxAutocomplete';

export default function SearchRideScreen({ navigation }: any) {
  const { user } = useContext(AuthContext);
  
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  const handleSearch = () => {
    if (!origin && !destination) {
      Alert.alert('Aviso', 'Ingresa al menos un origen o destino para buscar');
      return;
    }
    
    // Navegar a la lista pasándole los filtros
    navigation.navigate('RideList', { origin, destination });
  };

  const handleViewAll = () => {
    navigation.navigate('RideList', { origin: '', destination: '' });
  };

  if (user?.role !== 'PASAJERO') {
    return (
      <View style={styles.containerCenter}>
        <Text style={styles.title}>Acceso Denegado</Text>
        <Text style={styles.description}>Solo los pasajeros pueden buscar viajes en esta sección.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>¿A dónde vas?</Text>
      
      <Text style={styles.description}>
        Utiliza el buscador para encontrar viajes creados por nuestros conductores.
      </Text>

      <Text style={styles.label}>Punto de Partida</Text>
      <View style={styles.autocompleteWrapper}>
        <MapboxAutocomplete 
          placeholder="Ej. Terminal Norte"
          onSelect={(address) => setOrigin(address)}
        />
      </View>
      
      <Text style={styles.label}>Punto de Llegada</Text>
      <View style={styles.autocompleteWrapper}>
        <MapboxAutocomplete 
          placeholder="Ej. Centro Histórico"
          onSelect={(address) => setDestination(address)}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSearch}>
        <Text style={styles.buttonText}>Buscar Viajes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonSecondary} onPress={handleViewAll}>
        <Text style={styles.buttonTextSecondary}>Ver Todos los Viajes Disponibles</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#A0AEC0',
    textAlign: 'center',
    marginBottom: 32,
  },
  label: {
    color: '#E2E8F0',
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600'
  },
  autocompleteWrapper: {
    zIndex: 10,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#4ADE80', 
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    zIndex: -1,
  },
  buttonText: {
    color: '#1A202C',
    fontWeight: 'bold',
    fontSize: 18,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#4A5568',
    zIndex: -1,
  },
  buttonTextSecondary: {
    color: '#A0AEC0',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
