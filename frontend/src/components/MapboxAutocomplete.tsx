import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

const MAPBOX_KEY = process.env.EXPO_PUBLIC_MAPBOX_KEY;

type Suggestion = {
  id: string;
  place_name: string;
  center: [number, number]; // [longitude, latitude]
};

type Props = {
  placeholder: string;
  onSelect: (address: string, lat: number, lng: number) => void;
};

export default function MapboxAutocomplete({ placeholder, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  const searchPlaces = async (text: string) => {
    setQuery(text);
    if (text.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(text)}.json?access_token=${MAPBOX_KEY}&autocomplete=true&limit=5`;
      const response = await fetch(url);
      const data = await response.json();

      if (data && data.features) {
        setSuggestions(data.features);
      }
    } catch (e) {
      console.warn("Error fetching from Mapbox:", e);
    }
  };

  const handleSelect = (item: Suggestion) => {
    setQuery(item.place_name);
    setSuggestions([]);
    setIsFocused(false);
    
    const [lng, lat] = item.center;
    onSelect(item.place_name, lat, lng);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#A0AEC0"
        value={query}
        onChangeText={searchPlaces}
        onFocus={() => setIsFocused(true)}
      />
      
      {isFocused && suggestions.length > 0 && (
        <View style={styles.suggestionList}>
          {suggestions.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.suggestionItem} 
              onPress={() => handleSelect(item)}
            >
              <Text style={styles.suggestionText}>{item.place_name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 16,
    zIndex: 1, // To overlap elements below if autocomplete is open
  },
  input: {
    backgroundColor: '#2D3748',
    color: '#FFF',
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
  },
  suggestionList: {
    backgroundColor: '#1A202C',
    position: 'absolute',
    top: 55,
    width: '100%',
    maxHeight: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4A5568',
    elevation: 5,
    zIndex: 999,
  },
  suggestionItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2D3748',
  },
  suggestionText: {
    color: '#E2E8F0',
    fontSize: 14,
  }
});
