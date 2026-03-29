# Plan de Desarrollo: App de Carpooling (10 Fases)

De acuerdo a la solicitud, el proyecto culminará oficialmente una vez completada la **Fase 1** (Instauración del Cimiento). Las otras 9 fases quedan estructuradas como hoja de ruta a futuro.

---

## 🚀 Alcance Actual del Proyecto

### Fase 1: Cimientos y Setup (Objetivo Final)
*   **Backend:** Configuración del servidor Next.js, base de datos PostgreSQL con Prisma y despliegue inicial.
*   **Frontend:** Inicialización del proyecto React Native con Expo y TypeScript.
*   **Diseño:** Definición de la paleta de colores, tipografía y componentes base (Design System).
*   **Conexión:** Prueba de conexión básica entre cliente móvil y servidor API.

*(Aquí es donde concluye el trabajo activo del proyecto actual).*

---

## 🗺️ Hoja de Ruta Futura (Fases 2 a 10)

Estas fases representan el ciclo de vida completo de la aplicación, guardadas para desarrollo posterior.

### Fase 2: Autenticación y Perfiles
*   Implementación de JWT, Google Sign-In y Apple Sign-In.
*   Creación y edición de perfiles (Conductor vs. Pasajero).

### Fase 3: Núcleo de Viajes - Publicación
*   Formulario para publicar viajes (origen, destino, fecha, hora, asientos disponibles, precio).
*   Gestión de viajes activos del conductor.

### Fase 4: Mapas y Geolocalización
*   Integración de Google Maps API / Mapbox.
*   Autocomplete de direcciones, visualización de rutas y cálculo de distancia/tiempo estimado.

### Fase 5: Búsqueda y Reserva
*   Buscador de viajes con filtros para pasajeros.
*   Flujo de solicitud para unirse a un viaje y aprobación del conductor.

### Fase 6: Comunicación en Tiempo Real
*   Chat interno entre conductor y pasajero (Firebase Realtime / Socket.io).
*   Notificaciones Push (FCM / APNs).

### Fase 7: Sistema de Pagos
*   Integración con Stripe o Mercado Pago.
*   Pago de la reserva, fondos retenidos (escrow) y liquidaciones al conductor.

### Fase 8: Seguridad y Confianza
*   Sistema de reseñas, valoraciones y comentarios.
*   Verificación de identidad avanzada.

### Fase 9: Pulido UI/UX y Testing
*   Micro-animaciones, flujos en estado vacío y skeletons de carga.
*   Pruebas unitarias/integración y Beta Testing.

### Fase 10: CI/CD y Lanzamiento
*   Configuración de despliegue automatizado.
*   Preparación para App Store y Google Play para salida a producción.
