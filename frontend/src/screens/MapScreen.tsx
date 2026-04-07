import React, { useRef, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';

export default function MapScreen({ route }: any) {
  const mapRef = useRef<MapView>(null);
  
  // Try to get coordinates from navigation params
  const originLat = route.params?.originLat ? parseFloat(route.params.originLat) : 19.4326;
  const originLng = route.params?.originLng ? parseFloat(route.params.originLng) : -99.1332;
  const destLat = route.params?.destLat ? parseFloat(route.params.destLat) : null;
  const destLng = route.params?.destLng ? parseFloat(route.params.destLng) : null;

  useEffect(() => {
    if (mapRef.current && destLat && destLng) {
      // Small Delay for layout if needed
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(
          [
            { latitude: originLat, longitude: originLng },
            { latitude: destLat, longitude: destLng },
          ],
          {
            edgePadding: { top: 70, right: 70, bottom: 70, left: 70 },
            animated: true,
          }
        );
      }, 500);
    }
  }, [originLat, originLng, destLat, destLng]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={{
          latitude: originLat,
          longitude: originLng,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        showsUserLocation={true}
      >
        {/* Origin Marker */}
        <Marker
          coordinate={{
            latitude: originLat,
            longitude: originLng,
          }}
          title="Origen"
          description="Punto de inicio del viaje"
          pinColor="#3B82F6"
        />

        {/* Destination Marker */}
        {destLat && destLng && (
          <>
            <Marker
              coordinate={{
                latitude: destLat,
                longitude: destLng,
              }}
              title="Destino"
              description="Punto de llegada"
              pinColor="#4ADE80"
            />
            
            {/* Route Line */}
            <Polyline
              coordinates={[
                { latitude: originLat, longitude: originLng },
                { latitude: destLat, longitude: destLng },
              ]}
              strokeColor="#4ADE80"
              strokeWidth={4}
            />
          </>
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
