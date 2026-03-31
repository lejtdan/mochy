import React, { useState } from 'react';
import { API_BASE_URL } from '../config';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { AuthContext } from '../contexts/AuthContext';

export default function PaymentScreen({ route, navigation }: any) {
  const { rideId, seatsToReserve, ridePrice } = route.params;
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { token } = React.useContext(AuthContext);
  
  const [loading, setLoading] = useState(false);

  // Calcula monto total (solo visual)
  const totalAmount = ridePrice * seatsToReserve;

  const fetchPaymentSheetParams = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rideId,
          seatsToReserve
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al conectar con la pasarela de pago');
      }
      return data;
    } catch (e: any) {
      throw e;
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // 1. Fetch el PaymentIntent del backend
      const { clientSecret, paymentIntentId, amount } = await fetchPaymentSheetParams();

      // 2. Inicializar la vista de cobro nativa
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'Mochy App',
        paymentIntentClientSecret: clientSecret,
        defaultBillingDetails: {
          name: 'Pasajero de Mochy',
        }
      });

      if (initError) {
        Alert.alert('Error inicializando tarjeta', initError.message);
        setLoading(false);
        return;
      }

      // 3. Mostrar la hoja de pago (FaceID, Tarjeta, etc)
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        Alert.alert('Pago cancelado', paymentError.message);
        setLoading(false);
        return;
      }

      // 4. Pago exitoso, notificar al Backend para crear la reserva definitiva.
      Alert.alert('¡Pago Exitoso!', 'Tu tarjeta fue aprobada. Confirmando asiento...');
      
      const confirmResponse = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rideId,
          seatsToReserve,
          paymentRef: paymentIntentId,
          amountPaid: amount
        }),
      });

      const confirmData = await confirmResponse.json();

      if (confirmResponse.ok) {
        Alert.alert('¡Reserva Confirmada!', 'Tienes tus asientos asegurados.');
        navigation.navigate('MyBookings');
      } else {
        Alert.alert('Advertencia de Reserva', confirmData.error);
        // NOTA MVP: Aquí habría lógica para hacer reembolso del paymentRef si falló por error de db.
      }

    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resumen de Pago</Text>
      
      <View style={styles.card}>
        <Text style={styles.detail}>Asientos a reservar: {seatsToReserve}</Text>
        <Text style={styles.detail}>Precio Unitario: ${ridePrice} MXN</Text>
        <View style={styles.divider} />
        <Text style={styles.totalText}>Total a Pagar: ${totalAmount} MXN</Text>
      </View>

      <TouchableOpacity 
        style={[styles.payButton, loading && styles.disabledButton]} 
        onPress={handleCheckout}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#1A202C" />
        ) : (
          <Text style={styles.payButtonText}>Ingresar Tarjeta (Stripe)</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E2C',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#2D3748',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
  },
  detail: {
    color: '#E2E8F0',
    fontSize: 16,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#4A5568',
    marginVertical: 10,
  },
  totalText: {
    color: '#4ADE80',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  payButton: {
    backgroundColor: '#3B82F6', // Blue for financial intent
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  payButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  }
});
