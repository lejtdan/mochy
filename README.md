# 🚗 Mochy - Carpooling App

Una aplicación móvil de carpooling construida con **React Native (Expo)** y **Next.js**, diseñada para conectar conductores con pasajeros que comparten rutas similares de manera segura y económica.

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Stack Tecnológico](#-stack-tecnológico)
- [Arquitectura](#-arquitectura)
- [Instalación](#-instalación)
- [Variables de Entorno](#-variables-de-entorno)
- [Ejecución Local](#-ejecución-local)
- [Despliegue](#-despliegue)
- [Testing](#-testing)
- [Estructura del Proyecto](#-estructura-del-proyecto)

---

## ✨ Características

| Módulo | Descripción |
|---|---|
| 🔐 **Autenticación** | Registro/Login con JWT, roles Conductor y Pasajero |
| 🗺️ **Mapas** | Autocomplete de direcciones con Mapbox, visualización de rutas |
| 🚗 **Viajes** | Publicación, búsqueda con filtros, gestión de viajes activos |
| 🎟️ **Reservas** | Sistema de reservas con control de asientos disponibles |
| 💳 **Pagos** | Integración con Stripe (PaymentSheet nativo) |
| 💬 **Chat** | Mensajería en tiempo real entre conductor y pasajero |
| 🔔 **Notificaciones** | Push notifications con Expo Notifications |
| ⭐ **Reseñas** | Sistema de calificación 1-5 estrellas bidireccional |
| 🛡️ **Verificación** | Insignia de identidad verificada para generar confianza |
| ✨ **UI Premium** | Skeleton loaders, micro-animaciones, pull-to-refresh |

---

## 🛠️ Stack Tecnológico

### Frontend (Mobile)
- **React Native** con **Expo** (SDK 55)
- **TypeScript**
- **React Navigation** (Stack Navigator)
- **@stripe/stripe-react-native** (Pagos)
- **react-native-maps** + **Mapbox API** (Geocoding)

### Backend (API)
- **Next.js** 15 (API Routes)
- **TypeScript**
- **Prisma** 7.6 (ORM)
- **PostgreSQL** via **Neon** (Cloud DB)
- **Stripe SDK** (Payment Intents)
- **jsonwebtoken** (JWT Auth)
- **bcryptjs** (Password Hashing)

---

## 🏗️ Arquitectura

```
┌────────────────┐     HTTPS/REST     ┌──────────────────┐
│  React Native  │ ◄──────────────► │  Next.js API     │
│  Expo App      │                    │  (Vercel)        │
│                │                    │                  │
│  - Screens     │                    │  - /api/auth     │
│  - Components  │                    │  - /api/rides    │
│  - Contexts    │                    │  - /api/bookings │
│                │                    │  - /api/payments │
└────────────────┘                    │  - /api/reviews  │
                                      │  - /api/messages │
                                      └────────┬─────────┘
                                               │
                                      ┌────────▼─────────┐
                                      │  Neon PostgreSQL  │
                                      │  (Cloud)          │
                                      └──────────────────┘
```

---

## 🚀 Instalación

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Expo CLI (`npm install -g expo-cli`)
- Cuenta en [Neon](https://neon.tech) (DB)
- Cuenta en [Stripe](https://stripe.com) (Pagos)

### Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/mochy.git
cd mochy
```

### Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npx expo start
```

---

## 🔑 Variables de Entorno

### Backend (`backend/.env`)
```env
DATABASE_URL="postgresql://usuario:contraseña@host/neondb?sslmode=require"
JWT_SECRET="tu-secreto-jwt-seguro"
STRIPE_SECRET_KEY="sk_live_tu_clave_de_stripe"
```

### Frontend (`frontend/.env`)
```env
EXPO_PUBLIC_MAPBOX_KEY=pk.tu_clave_de_mapbox
EXPO_PUBLIC_STRIPE_KEY=pk_live_tu_clave_publica_stripe
```

---

## 💻 Ejecución Local

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npx expo start
```

El backend correrá en `http://localhost:3000` y el frontend se abrirá en Expo Go o tu simulador.

---

## 🚢 Despliegue

### Backend → Vercel
```bash
cd backend
npx vercel --prod
```
Configura las variables de entorno en el Dashboard de Vercel.

### Frontend → EAS Build
```bash
cd frontend

# Preview (APK/Simulator)
npx eas build --profile preview --platform all

# Production (App Store / Google Play)
npx eas build --profile production --platform all
npx eas submit --platform all
```

**Importante**: Antes de hacer build de producción, cambia `IS_PRODUCTION = true` en `src/config.ts` y actualiza `PROD_URL` con la URL real de tu backend en Vercel.

---

## 🧪 Testing

```bash
# Asegúrate de que el backend esté corriendo en localhost:3000
cd backend
bash tests/api-test.sh
```

---

## 📁 Estructura del Proyecto

```
Mochy/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Modelos de datos
│   ├── src/
│   │   ├── app/api/               # API Routes (Next.js)
│   │   │   ├── auth/              # Login, Registro
│   │   │   ├── rides/             # CRUD de Viajes
│   │   │   ├── bookings/          # Reservas
│   │   │   ├── payments/          # Stripe Intents
│   │   │   ├── reviews/           # Calificaciones
│   │   │   ├── messages/          # Chat
│   │   │   └── users/             # Perfiles y Verificación
│   │   └── lib/                   # Prisma client, Auth helpers
│   ├── tests/                     # Scripts de pruebas
│   ├── vercel.json                # Config de despliegue
│   └── .env                       # Variables de entorno
│
├── frontend/
│   ├── src/
│   │   ├── screens/               # Pantallas de la app
│   │   ├── components/            # Componentes reutilizables
│   │   ├── contexts/              # AuthContext (JWT)
│   │   └── config.ts              # URL centralizada del API
│   ├── app.json                   # Metadata de Expo
│   ├── eas.json                   # Config de EAS Build
│   └── .env                       # Variables de entorno
│
├── .github/workflows/ci.yml       # Pipeline CI
└── README.md
```

---

## 📄 Licencia

Este proyecto fue desarrollado como MVP. Todos los derechos reservados.

---

Construido con ❤️ usando React Native, Next.js y Stripe.
