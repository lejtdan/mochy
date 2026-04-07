import React, { useContext, useState } from 'react';
import { API_BASE_URL } from '../config';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';

export default function HomeScreen({ navigation }: any) {
  const { user, token, logout, login } = useContext(AuthContext);
  const [verifying, setVerifying] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚗 Mochy Carpooling</Text>
      
      {user ? (
        <View style={styles.profileCard}>
          <Text style={styles.description}>¡Hola! Has iniciado sesión como:</Text>
          <Text style={styles.userName}>{user.name || user.email}</Text>
          <Text style={styles.roleLabel}>Rol: {user.role}</Text>

          {user.role === 'CONDUCTOR' && (
            <>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => navigation.navigate('PublishRide')}
              >
                <Text style={styles.actionText}>+ Publicar un Viaje</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButtonSecondary} 
                onPress={() => navigation.navigate('MyRides')}
              >
                <Text style={styles.actionTextSecondary}>Mis Viajes</Text>
              </TouchableOpacity>
            </>
          )}

          {user.role === 'PASAJERO' && (
            <>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => navigation.navigate('SearchRide')}
              >
                <Text style={styles.actionText}>🔍 Buscar Viaje</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButtonSecondary} 
                onPress={() => navigation.navigate('MyBookings')}
              >
                <Text style={styles.actionTextSecondary}>Mis Reservas</Text>
              </TouchableOpacity>
            </>
          )}
          {/* Sección de Verificación de Identidad */}
          {user.verificationStatus === 'VERIFIED' ? (
            <View style={[styles.verifyButton, { borderColor: '#4ADE80', backgroundColor: 'rgba(74, 222, 128, 0.1)' }]}>
              <Text style={[styles.verifyText, { color: '#4ADE80' }]}>✅ Identidad Verificada</Text>
            </View>
          ) : user.verificationStatus === 'PENDING_REVIEW' ? (
            <View style={[styles.verifyButton, { borderColor: '#FBBF24', backgroundColor: 'rgba(251, 191, 36, 0.1)' }]}>
              <Text style={[styles.verifyText, { color: '#FBBF24' }]}>⏳ Verificación en proceso...</Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={[styles.verifyButton, user.verificationStatus === 'REJECTED' ? { borderColor: '#EF4444' } : {}]} 
              disabled={verifying}
              onPress={async () => {
                setVerifying(true);
                try {
                  const res = await fetch(`${API_BASE_URL}/api/users/verify`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` }
                  });
                  const data = await res.json();
                  if (res.ok) {
                    Alert.alert('✅ Solicitud Enviada', 'Un administrador revisará tu solicitud.');
                    // Update simple context
                    if (user && token) {
                      login(token, { ...user, verificationStatus: 'PENDING_REVIEW' });
                    }
                  } else {
                    Alert.alert('Error', data.error);
                  }
                } catch(e) {
                  Alert.alert('Error', 'No se pudo solicitar la verificación');
                } finally {
                  setVerifying(false);
                }
              }}
            >
              <Text style={[styles.verifyText, user.verificationStatus === 'REJECTED' ? { color: '#EF4444' } : {}]}>
                {user.verificationStatus === 'REJECTED' ? '⚠️ Rechazado - Reintentar' : '🛡️ Solicitar Verificación'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Botón Mi Perfil Público */}
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('UserProfile', { userId: user?.id })}
          >
            <Text style={styles.profileBtnText}>👤 Ver mi Perfil Público</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.description}>
          Deberías iniciar sesión primero (Este texto no debería verse con el Stack protegido).
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E2C', // Modern dark theme base
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 32,
  },
  profileCard: {
    backgroundColor: '#2D3748',
    padding: 24,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  userName: {
    fontSize: 24,
    color: '#4ADE80',
    fontWeight: 'bold',
    marginVertical: 8,
  },
  roleLabel: {
    fontSize: 16,
    color: '#E2E8F0',
    fontWeight: '600',
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#A0AEC0',
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#EF4444', // Red for logout
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  logoutText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  actionButton: {
    backgroundColor: '#3B82F6', // Blue action
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  actionButtonSecondary: {
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3B82F6',
    marginBottom: 24,
  },
  actionTextSecondary: {
    color: '#3B82F6',
    fontWeight: 'bold',
    fontSize: 16,
  },
  verifyButton: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderWidth: 1,
    borderColor: '#4ADE80',
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  verifyText: {
    color: '#4ADE80',
    fontWeight: 'bold',
    fontSize: 14,
  },
  profileButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: '#60A5FA',
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileBtnText: {
    color: '#60A5FA',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
