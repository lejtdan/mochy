import { Platform } from 'react-native';

// 1. IP local de tu computadora en la red Wi-Fi (necesario para physical device testing)
// Puedes encontrarla con `ipconfig getifaddr en0` en Mac o `ipconfig` en Windows.
const LOCAL_IP = '192.168.100.162';

// 2. Lógica para detectar la mejor URL en desarrollo
const getDevUrl = () => {
  // Para Simulador iOS, 'localhost' es lo más estable
  if (Platform.OS === 'ios') {
    return `http://localhost:3000`;
  }
  
  // Para Android:
  // - Emulador: 10.0.2.2 apunta a la computadora host
  // - Dispositivo físico: requiere la IP local (ej. 192.168.x.x) y estar en la misma red
  // Cambia LOCAL_IP arriba si tu IP ha cambiado.
  return `http://${LOCAL_IP}:3000`;
};

const DEV_URL = getDevUrl();

// 3. Configuración de Producción (Vercel)
const PROD_URL = 'https://mochy-backend.vercel.app';
// Cambia a true para forzar el uso del servidor en la nube incluso en desarrollo
// O usa !__DEV__ para que sea automático basado en el tipo de build
const IS_PRODUCTION = !__DEV__ || true; 

export const API_BASE_URL = IS_PRODUCTION ? PROD_URL : DEV_URL;
