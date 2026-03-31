import React, { useState, useContext } from 'react';
import { API_BASE_URL } from '../config';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';

export default function ReviewScreen({ route, navigation }: any) {
  const { rideId, revieweeId, revieweeName } = route.params;
  const { token } = useContext(AuthContext);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      Alert.alert('Error', 'Selecciona una calificación de 1 a 5 estrellas.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ rideId, revieweeId, rating, comment }),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert('¡Gracias!', data.message);
        navigation.goBack();
      } else {
        Alert.alert('Error', data.error);
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo enviar la reseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calificar a</Text>
      <Text style={styles.name}>{revieweeName}</Text>

      {/* Estrellas */}
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Text style={[styles.star, star <= rating && styles.starActive]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.ratingLabel}>
        {rating === 0 ? 'Toca una estrella' : `${rating} de 5`}
      </Text>

      {/* Comentario */}
      <TextInput
        style={styles.commentInput}
        placeholder="Deja un comentario opcional..."
        placeholderTextColor="#A0AEC0"
        value={comment}
        onChangeText={setComment}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity 
        style={[styles.submitBtn, loading && { opacity: 0.6 }]} 
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#1A202C" />
        ) : (
          <Text style={styles.submitTxt}>Enviar Reseña</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E2C',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#94A3B8',
    fontSize: 16,
  },
  name: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  star: {
    fontSize: 44,
    color: '#4A5568',
    marginHorizontal: 4,
  },
  starActive: {
    color: '#FBBF24', // Gold
  },
  ratingLabel: {
    color: '#CBD5E1',
    fontSize: 16,
    marginBottom: 24,
  },
  commentInput: {
    backgroundColor: '#2D3748',
    color: '#FFF',
    width: '100%',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
    marginBottom: 24,
  },
  submitBtn: {
    backgroundColor: '#4ADE80',
    paddingVertical: 14,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  submitTxt: {
    color: '#1A202C',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
