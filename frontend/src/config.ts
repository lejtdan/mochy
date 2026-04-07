import { Platform } from 'react-native';

import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra || {};

// 1. IP local de tu computadora en la red Wi-Fi (necesario para physical device testing)
const LOCAL_IP = '192.168.0.151';

// 2. Lógica para detectar la mejor URL en desarrollo
const getDevUrl = () => {
  if (Platform.OS === 'ios') return `http://localhost:3000`;
  return `http://${LOCAL_IP}:3000`;
};

const DEV_URL = getDevUrl();

// 3. Configuración de Producción (Vercel)
const PROD_URL = extra.API_URL || 'https://mochy-backend.vercel.app';
const IS_PRODUCTION = !__DEV__;

export const API_BASE_URL = IS_PRODUCTION ? PROD_URL : DEV_URL;
