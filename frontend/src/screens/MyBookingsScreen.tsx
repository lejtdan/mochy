import React, { useState, useEffect, useContext } from 'react';
import { API_BASE_URL } from '../config';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity, RefreshControl } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import AnimatedCard from '../components/AnimatedCard';

type BookingResult = {
  id: string;
  seatsReserved: number;
  status: string;
  createdAt: string;
  ride: {
    id: string;
    origin: string;
    destination: string;
    date: string;
    status: string;  // For checking if ride is COMPLETADO
    driver: {
      id: string;
      name: string | null;
      email: string;
    };
  };
};

export default function MyBookingsScreen({ navigation }: any) {
  const { token, user } = useContext(AuthContext);
  const [bookings, setBookings] = useState<BookingResult[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/api/bookings/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (response.ok) {
        setBookings(data.bookings);
      } else {
        Alert.alert('Error', data.error || 'No se pudieron cargar tus reservas');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Problema de conexión al servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

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
        <Text style={styles.title}>Mis Reservas</Text>
        <SkeletonLoader count={3} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Reservas</Text>
      
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchBookings} tintColor="#4ADE80" />
        }
        renderItem={({ item, index }) => (
          <AnimatedCard index={index}>
          <View style={styles.card}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusBadge}>{item.status}</Text>
            </View>
            <Text style={styles.routeText}>{item.ride.origin} ➔ {item.ride.destination}</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🗓 Fecha:</Text>
              <Text style={styles.infoValue}>{item.ride.date}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>👤 Conductor:</Text>
              <Text style={styles.infoValue}>{item.ride.driver.name || item.ride.driver.email}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🎟 Asientos:</Text>
              <Text style={styles.infoValue}>{item.seatsReserved}</Text>
            </View>

            <TouchableOpacity 
              style={styles.chatButton}
              onPress={() => navigation.navigate('Chat', { 
                rideId: item.ride.id, 
                receiverId: item.ride.driver.id,
                receiverName: item.ride.driver.name || item.ride.driver.email
              })}
            >
              <Text style={styles.chatButtonText}>💬 Escribir al Conductor</Text>
            </TouchableOpacity>

            {/* Ver Perfil del Conductor */}
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => navigation.navigate('UserProfile', { userId: item.ride.driver.id })}
            >
              <Text style={styles.profileButtonText}>👤 Ver Perfil del Conductor</Text>
            </TouchableOpacity>

            {/* Calificar (solo si viaje completado) */}
            {item.ride.status === 'COMPLETADO' && (
              <TouchableOpacity 
                style={styles.reviewButton}
                onPress={() => navigation.navigate('Review', { 
                  rideId: item.ride.id, 
                  revieweeId: item.ride.driver.id,
                  revieweeName: item.ride.driver.name || item.ride.driver.email
                })}
              >
                <Text style={styles.reviewButtonText}>⭐ Calificar al Conductor</Text>
              </TouchableOpacity>
            )}
          </View>
          </AnimatedCard>
        )}
        ListEmptyComponent={
          <EmptyState
            emoji="🌟"
            title="No tienes reservas aún"
            subtitle="Busca un viaje disponible y reserva tu lugar hoy."
            actionLabel="🔍 Buscar Viajes"
            onAction={() => navigation.navigate('SearchRide')}
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
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#2D3748',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusHeader: {
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: '#10B981',
    color: '#E0F2FE',
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
  },
  routeText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  infoLabel: {
    color: '#94A3B8',
    width: 90,
    fontSize: 14,
  },
  infoValue: {
    color: '#F1F5F9',
    flex: 1,
    fontWeight: '500',
  },
  emptyText: {
    color: '#E2E8F0',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  chatButton: {
    marginTop: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: '#3B82F6',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  chatButtonText: {
    color: '#60A5FA',
    fontWeight: 'bold',
    fontSize: 14,
  },
  profileButton: {
    marginTop: 8,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    borderWidth: 1,
    borderColor: '#94A3B8',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  profileButtonText: {
    color: '#94A3B8',
    fontWeight: 'bold',
    fontSize: 14,
  },
  reviewButton: {
    marginTop: 8,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderWidth: 1,
    borderColor: '#FBBF24',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  reviewButtonText: {
    color: '#FBBF24',
    fontWeight: 'bold',
    fontSize: 14,
  }
});
