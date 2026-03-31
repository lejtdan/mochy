import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';

type ReviewItem = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: { name: string | null; avatarUrl: string | null };
};

type ProfileData = {
  name: string | null;
  email: string;
  role: string;
  idVerified: boolean;
  averageRating: string;
  totalReviews: number;
  reviews: ReviewItem[];
};

export default function UserProfileScreen({ route }: any) {
  const { userId } = route.params;
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/${userId}/profile`);
        const data = await res.json();
        if (res.ok) setProfile(data);
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4ADE80" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Perfil no encontrado.</Text>
      </View>
    );
  }

  const stars = '⭐'.repeat(Math.round(parseFloat(profile.averageRating)));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerCard}>
        <Text style={styles.avatar}>👤</Text>
        <Text style={styles.name}>{profile.name || profile.email}</Text>
        <Text style={styles.role}>{profile.role}</Text>
        
        {profile.idVerified ? (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✅ Identidad Verificada</Text>
          </View>
        ) : (
          <View style={styles.unverifiedBadge}>
            <Text style={styles.unverifiedText}>⚠️ Sin verificar</Text>
          </View>
        )}

        <Text style={styles.ratingBig}>{stars} {profile.averageRating}/5</Text>
        <Text style={styles.reviewCount}>{profile.totalReviews} reseña(s)</Text>
      </View>

      {/* Reviews List */}
      <Text style={styles.sectionTitle}>Reseñas recibidas</Text>
      <FlatList
        data={profile.reviews}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.reviewCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.reviewerName}>{item.reviewer.name || 'Anónimo'}</Text>
              <Text style={styles.reviewStars}>{'⭐'.repeat(item.rating)}</Text>
            </View>
            {item.comment && <Text style={styles.reviewComment}>{item.comment}</Text>}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Este usuario aún no tiene reseñas.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E1E2C', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1E1E2C' },
  headerCard: {
    backgroundColor: '#2D3748',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: { fontSize: 48, marginBottom: 8 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#FFF' },
  role: { fontSize: 14, color: '#94A3B8', marginBottom: 12 },
  verifiedBadge: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4ADE80',
    marginBottom: 16,
  },
  verifiedText: { color: '#4ADE80', fontWeight: 'bold', fontSize: 13 },
  unverifiedBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FBBF24',
    marginBottom: 16,
  },
  unverifiedText: { color: '#FBBF24', fontWeight: 'bold', fontSize: 13 },
  ratingBig: { fontSize: 20, color: '#FFF', fontWeight: 'bold' },
  reviewCount: { color: '#94A3B8', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', marginBottom: 12 },
  reviewCard: {
    backgroundColor: '#2D3748',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
  },
  reviewerName: { color: '#E2E8F0', fontWeight: '600' },
  reviewStars: { fontSize: 14 },
  reviewComment: { color: '#CBD5E1', marginTop: 6, fontSize: 14 },
  emptyText: { color: '#94A3B8', textAlign: 'center', marginTop: 20 },
});
