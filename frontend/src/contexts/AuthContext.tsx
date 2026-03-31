import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { API_BASE_URL } from '../config';
import * as SecureStore from 'expo-secure-store';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

type UserData = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  avatarUrl: string | null;
};

type AuthContextType = {
  user: UserData | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, userData: UserData) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

async function registerForPushNotificationsAsync() {
  let token;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return;
    }
    // We pass projectId if using EAS build, but let's default to standard expo setup for mvp
    try {
      token = (await Notifications.getExpoPushTokenAsync()).data;
    } catch (e) { console.warn(e) }
  }
  return token;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for token on mount
    const checkToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        const userDataStr = await SecureStore.getItemAsync('userData');
        
        if (token && userDataStr) {
          setUser(JSON.parse(userDataStr));
        }
      } catch (e) {
        console.warn('Error reading token:', e);
      } finally {
        setIsLoading(false);
      }
    };
    checkToken();
  }, []);

  const login = async (token: string, userData: UserData) => {
    try {
      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('userData', JSON.stringify(userData));
      setToken(token);
      setUser(userData);

      // Register Push Token silently after login
      const pushToken = await registerForPushNotificationsAsync();
      if (pushToken) {
        await fetch(`${API_BASE_URL}/api/users/profile`, {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({ expoPushToken: pushToken })
        });
      }

    } catch (e) {
      console.warn('Error saving auth data:', e);
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userData');
      setToken(null);
      setUser(null);
    } catch (e) {
      console.warn('Error clearing auth data:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
