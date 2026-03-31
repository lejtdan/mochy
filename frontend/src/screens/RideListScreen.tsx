import React, { useState, useEffect, useContext } from 'react';
import { API_BASE_URL } from '../config';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import AnimatedCard from '../components/AnimatedCard';

type RideResult = {
  id: string;
  origin: string;
  destination: string;
  date: string;
  availableSeats: number;
  price: number;
  driver: {
    id: string;
    name: string | null;
    email: string;
  };
};

export default function RideListScreen({ route, navigation }: any) {
  const { token, user } = useContext(AuthContext);
  const { origin, destination } = route.params || { origin: '', destination: '' };
  
  const [rides, setRides] = useState<RideResult[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRides = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams();
      if (origin) queryParams.append('origin', origin);
      if (destination) queryParams.append('destination', destination);
      
      const response = await fetch(`${API_BASE_URL}/api/rides?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (response.ok) {
        setRides(data.rides);
      } else {
        Alert.alert('Error', data.error || 'No se pudieron cargar los viajes');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Problema de conexión al servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, [origin, destination]);

  const handleBook = (rideId: string, ridePrice: number) => {
    navigation.navigate('Payment', { 
      rideId, 
      seatsToReserve: 1, // Por MVP mantenemos 1 asiento por defecto
      ridePrice 
    });
  };

  if (user?.role !== 'PASAJERO') {
    return (
      <View style={styles.containerCenter}>
        <Text style={styles.title}>Acceso Denegado</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Resultados de Búsqueda</Text>
        <SkeletonLoader count={4} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resultados de Búsqueda</Text>
      {(origin || destination) ? (
        <Text style={styles.subtitle}>
          Filtros: {origin ? `Desde ${origin} ` : ''}{destination ? `Hacia ${destination}` : ''}
        </Text>
      ) : null}

      <FlatList
        data={rides}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchRides} tintColor="#4ADE80" />
        }
        renderItem={({ item, index }) => (
          <AnimatedCard index={index}>
          <View style={styles.card}>
            <View style={styles.routeHeader}>
              <Text style={styles.routeText}>{item.origin} ➔ {item.destination}</Text>
            </View>
            <Text style={styles.infoText}>Conductor: {item.driver.name || item.driver.email}</Text>
            <Text style={styles.infoText}>📅 Salida: {item.date}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                 <Text style={styles.statsText}>Lugares libres: {item.availableSeats}</Text>
                 <Text style={styles.statsText}>Precio: ${item.price.toFixed(2)}</Text>
            </View>
            
            <TouchableOpacity style={styles.bookBtn} onPress={() => handleBook(item.id, item.price)}>
              <Text style={styles.bookTxt}>Reservar y Pagar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.profileBtn}
              onPress={() => navigation.navigate('UserProfile', { userId: item.driver.id })}
            >
              <Text style={styles.profileTxt}>👤 Ver Perfil del Conductor</Text>
            </TouchableOpacity>
          </View>
          </AnimatedCard>
        )}
        ListEmptyComponent={
          <EmptyState
            emoji="🔍"
            title="Sin resultados"
            subtitle="No encontramos viajes con esos filtros. Intenta cambiar tu búsqueda."
            actionLabel="Cambiar Búsqueda"
            onAction={() => navigation.goBack()}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#1E1E2C',
  },
  containerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1E2C',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    color: '#A0AEC0',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
  },
  card: {
    backgroundColor: '#2D3748',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  routeHeader: {
    marginBottom: 8,
  },
  routeText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
  },
  infoText: {
    color: '#CBD5E1',
    fontSize: 14,
    marginBottom: 4,
  },
  statsText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600'
  },
  bookBtn: {
    marginTop: 16,
    backgroundColor: '#4ADE80',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  bookTxt: {
    color: '#1A202C',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyText: {
    color: '#E2E8F0',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  profileBtn: {
    marginTop: 8,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    borderWidth: 1,
    borderColor: '#94A3B8',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  profileTxt: {
    color: '#94A3B8',
    fontWeight: 'bold',
    fontSize: 14,
  }
});
