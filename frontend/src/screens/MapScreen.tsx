import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapboxMap from '../components/MapboxMap';

export default function MapScreen({ route }: any) {
  // Try to get coordinates from navigation params
  const originLat = route.params?.originLat ? parseFloat(route.params.originLat) : 19.4326; // CDMX
  const originLng = route.params?.originLng ? parseFloat(route.params.originLng) : -99.1332;
  const destLat = route.params?.destLat ? parseFloat(route.params.destLat) : null;
  const destLng = route.params?.destLng ? parseFloat(route.params.destLng) : null;

  return (
    <View style={styles.container}>
      <MapboxMap 
        originLat={originLat} 
        originLng={originLng} 
        destLat={destLat} 
        destLng={destLng} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1E1E2C',
  },
});
