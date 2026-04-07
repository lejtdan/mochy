import React, { useContext } from 'react';
import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import { StripeProvider } from '@stripe/stripe-react-native';

import { AuthProvider, AuthContext } from './src/contexts/AuthContext';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import PublishRideScreen from './src/screens/PublishRideScreen';
import MyRidesScreen from './src/screens/MyRidesScreen';
import MapScreen from './src/screens/MapScreen';
import SearchRideScreen from './src/screens/SearchRideScreen';
import RideListScreen from './src/screens/RideListScreen';
import MyBookingsScreen from './src/screens/MyBookingsScreen';
import ChatScreen from './src/screens/ChatScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import UserProfileScreen from './src/screens/UserProfileScreen';
import ReviewScreen from './src/screens/ReviewScreen';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#1E1E2C' }}>
        <ActivityIndicator size="large" color="#4ADE80" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1E1E2C' },
        headerTintColor: '#fff',
        contentStyle: { backgroundColor: '#1E1E2C' }
      }}
    >
      {user ? (
        // Main App Stack
        <>
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: 'Mi Perfil' }} 
          />
          <Stack.Screen 
            name="PublishRide" 
            component={PublishRideScreen} 
            options={{ title: 'Publicar Viaje', headerBackTitle: 'Volver' }} 
          />
          <Stack.Screen 
            name="MyRides" 
            component={MyRidesScreen} 
            options={{ title: 'Mis Viajes', headerBackTitle: 'Volver' }} 
          />
          <Stack.Screen 
            name="Map" 
            component={MapScreen} 
            options={{ title: 'Mapa del Viaje' }} 
          />
          <Stack.Screen 
            name="SearchRide" 
            component={SearchRideScreen} 
            options={{ title: 'Buscar Viaje' }} 
          />
          <Stack.Screen 
            name="RideList" 
            component={RideListScreen} 
            options={{ title: 'Resultados' }} 
          />
          <Stack.Screen 
            name="MyBookings" 
            component={MyBookingsScreen} 
            options={{ title: 'Mis Reservas' }} 
          />
          <Stack.Screen 
            name="Chat" 
            component={ChatScreen} 
            options={{ title: 'Mensajes' }} 
          />
          <Stack.Screen 
            name="Payment" 
            component={PaymentScreen} 
            options={{ title: 'Pagar Reserva', presentation: 'modal' }} 
          />
          <Stack.Screen 
            name="UserProfile" 
            component={UserProfileScreen} 
            options={{ title: 'Perfil de Usuario' }} 
          />
          <Stack.Screen 
            name="Review" 
            component={ReviewScreen} 
            options={{ title: 'Calificar', presentation: 'modal' }} 
          />
        </>
      ) : (
        // Auth Stack
        <>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen} 
            options={{ title: 'Registro', headerBackTitle: 'Volver' }} 
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const publishableKey = Constants.expoConfig?.extra?.STRIPE_KEY || process.env.EXPO_PUBLIC_STRIPE_KEY || '';
  const MAPBOX_KEY = Constants.expoConfig?.extra?.MAPBOX_KEY || process.env.EXPO_PUBLIC_MAPBOX_KEY;
  
  return (
    <StripeProvider publishableKey={publishableKey}>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </StripeProvider>
  );
}
