import React, { useRef, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import Constants from 'expo-constants';

Mapbox.setAccessToken(Constants.expoConfig?.extra?.MAPBOX_KEY || '');

interface MapboxMapProps {
  originLat: number;
  originLng: number;
  destLat?: number | null;
  destLng?: number | null;
}

export default function MapboxMap({ originLat, originLng, destLat, destLng }: MapboxMapProps) {
  const cameraRef = useRef<Mapbox.Camera>(null);

  useEffect(() => {
    if (cameraRef.current && destLat && destLng) {
      // Encontrar los puntos máximos y mínimos para hacer el fitBounds
      const maxLat = Math.max(originLat, destLat);
      const minLat = Math.min(originLat, destLat);
      const maxLng = Math.max(originLng, destLng);
      const minLng = Math.min(originLng, destLng);

      cameraRef.current.fitBounds(
        [maxLng, maxLat], // Top Right (NE)
        [minLng, minLat], // Bottom Left (SW)
        [70, 70, 70, 70], // padding [top, right, bottom, left]
        1500              // animation duration ms
      );
    }
  }, [originLat, originLng, destLat, destLng]);

  const routeGeoJSON = destLat && destLng ? {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [
            [originLng, originLat],
            [destLng, destLat],
          ],
        },
      },
    ],
  } : null;

  return (
    <View style={styles.container}>
      <Mapbox.MapView 
        style={styles.map} 
        styleURL="mapbox://styles/mapbox/standard"
        localizeLabels={true}
        logoEnabled={false}
        attributionEnabled={false}
      >
        <Mapbox.Camera
          ref={cameraRef}
          zoomLevel={14}
          centerCoordinate={[originLng, originLat]}
          animationMode={'flyTo'}
          animationDuration={1500}
        />
        
        {/* Origin Marker */}
        <Mapbox.PointAnnotation
          id="origin"
          coordinate={[originLng, originLat]}
        >
          <View style={styles.markerContainer}>
            <View style={[styles.marker, { backgroundColor: '#3B82F6' }]} />
          </View>
        </Mapbox.PointAnnotation>

        {/* Destination Marker & Route */}
        {destLat && destLng && (
          <>
            <Mapbox.PointAnnotation
              id="destination"
              coordinate={[destLng, destLat]}
            >
              <View style={styles.markerContainer}>
                <View style={[styles.marker, { backgroundColor: '#4ADE80' }]} />
              </View>
            </Mapbox.PointAnnotation>
            
            {/* Route Line */}
            {routeGeoJSON && (
              <Mapbox.ShapeSource id="routeSource" shape={routeGeoJSON as any}>
                <Mapbox.LineLayer
                  id="routeFill"
                  style={{
                    lineColor: '#4ADE80',
                    lineWidth: 4,
                    lineCap: 'round',
                    lineJoin: 'round',
                  }}
                />
              </Mapbox.ShapeSource>
            )}
          </>
        )}
      </Mapbox.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 16,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
  },
  marker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});
