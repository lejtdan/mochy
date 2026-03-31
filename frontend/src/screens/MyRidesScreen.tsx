import React, { useState, useEffect, useContext } from 'react';
import { API_BASE_URL } from '../config';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import AnimatedCard from '../components/AnimatedCard';

type Ride = {
  id: string;
  origin: string;
  destination: string;
  date: string;
  status: string;
  bookings?: {
    passenger: {
      id: string;
      name: string | null;
      email: string;
    }
  }[];
};

export default function MyRidesScreen({ navigation }: any) {
  const { token, user } = useContext(AuthContext);
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRides = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/rides/me`, {
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
  }, []);

  const handleCancel = async (rideId: string) => {
    Alert.alert(
      "Cancelar Viaje",
      "¿Estás seguro de que deseas cancelar este viaje?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Sí, Cancelar", 
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(`${API_BASE_URL}/api/rides/${rideId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
              });
              
              if (res.ok) {
                fetchRides(); // Refresh list after canceling
              } else {
                const data = await res.json();
                Alert.alert('Error', data.error || 'Autenticación fallida');
              }
            } catch (e) {
              Alert.alert('Error', 'Fallo al procesar la cancelación');
            }
          }
        }
      ]
    );
  };

  const handleComplete = async (rideId: string) => {
    Alert.alert(
      "Terminar Viaje",
      "¿Confirmas que este viaje ha finalizado? Los pasajeros podrán calificarte.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, Terminar",
          onPress: async () => {
            try {
              const res = await fetch(`${API_BASE_URL}/api/rides/${rideId}/complete`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (res.ok) {
                Alert.alert('✅ Viaje Completado', 'El viaje fue marcado como finalizado.');
                fetchRides();
              } else {
                const data = await res.json();
                Alert.alert('Error', data.error);
              }
            } catch (e) {
              Alert.alert('Error', 'Fallo al completar el viaje');
            }
          }
        }
      ]
    );
  };

  if (user?.role !== 'CONDUCTOR') {
    return (
      <View style={styles.containerCenter}>
        <Text style={styles.title}>Acceso Denegado</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Mis Viajes</Text>
        <SkeletonLoader count={3} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Viajes ({rides.length})</Text>

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
            <Text style={styles.dateText}>📅 {item.date}</Text>
            <Text style={styles.dateText}>
              {item.status === 'ACTIVO' ? '🟢' : item.status === 'COMPLETADO' ? '✅' : '🔴'} {item.status}
            </Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
              {item.status === 'ACTIVO' && (
                <TouchableOpacity style={[styles.cancelBtn, { flex: 1, marginRight: 8 }]} onPress={() => handleCancel(item.id)}>
                  <Text style={styles.cancelTxt}>Cancelar</Text>
                </TouchableOpacity>
              )}

              {(item as any).originLat && (item as any).originLng && (
                <TouchableOpacity 
                  style={[styles.mapBtn, { flex: 1, marginLeft: item.status === 'ACTIVO' ? 8 : 0 }]} 
                  onPress={() => (navigation as any).navigate('Map', { 
                    originLat: parseFloat((item as any).originLat), 
                    originLng: parseFloat((item as any).originLng) 
                  })}
                >
                  <Text style={styles.mapTxt}>Ver en Mapa</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Botón Terminar Viaje */}
            {item.status === 'ACTIVO' && (
              <TouchableOpacity 
                style={styles.completeBtn}
                onPress={() => handleComplete(item.id)}
              >
                <Text style={styles.completeTxt}>✅ Terminar Viaje</Text>
              </TouchableOpacity>
            )}

            {/* Listar Pasajeros y botón de Chat */}
            {item.bookings && item.bookings.length > 0 && (
              <View style={styles.passengersContainer}>
                <Text style={styles.passengersTitle}>Pasajeros Reservados:</Text>
                {item.bookings.map((booking, idx) => (
                  <View key={idx} style={styles.passengerRow}>
                    <Text style={styles.passengerName}>
                      {booking.passenger.name || booking.passenger.email}
                    </Text>
                    <TouchableOpacity 
                      style={styles.chatInlineBtn}
                      onPress={() => navigation.navigate('Chat', {
                        rideId: item.id,
                        receiverId: booking.passenger.id,
                        receiverName: booking.passenger.name || booking.passenger.email
                      })}
                    >
                      <Text style={styles.chatInlineTxt}>Chat</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
          </AnimatedCard>
        )}
        ListEmptyComponent={
          <EmptyState
            emoji="🚗"
            title="Aún no has publicado viajes"
            subtitle="Comparte tu próximo recorrido y ayuda a otros a llegar a su destino."
            actionLabel="+ Publicar un Viaje"
            onAction={() => navigation.navigate('PublishRide')}
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
    borderRadius: 8,
    marginBottom: 12,
  },
  routeHeader: {
    marginBottom: 8,
  },
  routeText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
  },
  dateText: {
    color: '#A0AEC0',
    fontSize: 14,
    marginBottom: 4,
  },
  cancelBtn: {
    marginTop: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444'
  },
  cancelTxt: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
  mapBtn: {
    marginTop: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3B82F6'
  },
  mapTxt: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#E2E8F0',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  passengersContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#4A5568',
  },
  passengersTitle: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 8,
  },
  passengerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    backgroundColor: '#1E1E2C',
    padding: 8,
    borderRadius: 6,
  },
  passengerName: {
    color: '#F1F5F9',
    flex: 1,
    fontSize: 14,
  },
  chatInlineBtn: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  chatInlineTxt: {
    color: '#60A5FA',
    fontSize: 12,
    fontWeight: 'bold',
  },
  completeBtn: {
    marginTop: 12,
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4ADE80',
  },
  completeTxt: {
    color: '#4ADE80',
    fontWeight: 'bold',
  }
});
