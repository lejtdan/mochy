import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

type SkeletonProps = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
};

function SkeletonBar({ width = '100%', height = 16, borderRadius = 6, style }: SkeletonProps) {
  const shimmer = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: '#4A5568',
          opacity: shimmer,
        },
        style,
      ]}
    />
  );
}

export default function SkeletonLoader({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.card}>
          <SkeletonBar width="70%" height={20} style={{ marginBottom: 12 }} />
          <SkeletonBar width="50%" height={14} style={{ marginBottom: 8 }} />
          <SkeletonBar width="90%" height={14} style={{ marginBottom: 8 }} />
          <SkeletonBar width="40%" height={14} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: '#2D3748',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
});
