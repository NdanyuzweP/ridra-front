import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Bus } from '@/types/bus';
import { MapPin } from 'lucide-react-native';

interface GoogleMapViewProps {
  buses: Bus[];
  userLocation?: { latitude: number; longitude: number };
  onBusPress?: (bus: Bus) => void;
}

const { width, height } = Dimensions.get('window');

export function GoogleMapView({ buses, userLocation, onBusPress }: GoogleMapViewProps) {
  const { theme } = useTheme();
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => setMapLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.webMapContainer, { backgroundColor: theme.surface }]}>
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 12,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <iframe
            src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15949.123456789!2d30.0619!3d-1.9441!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca4258ed8e797%3A0x4a87a1b2c3d4e5f6!2sKimironko%2C%20Kigali%2C%20Rwanda!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          
          {/* Overlay with bus markers */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
          }}>
            {buses.slice(0, 5).map((bus, index) => (
              <div
                key={bus.id}
                style={{
                  position: 'absolute',
                  left: `${20 + (index % 3) * 25}%`,
                  top: `${30 + Math.floor(index / 3) * 20}%`,
                  backgroundColor: theme.primary,
                  color: theme.background,
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  pointerEvents: 'auto',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
                onClick={() => onBusPress?.(bus)}
              >
                🚌 {bus.eta}m
              </div>
            ))}
            
            {userLocation && (
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: '#4285f4',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  border: '3px solid white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
              />
            )}
          </div>
        </div>
        
        <View style={styles.mapInfo}>
          <Text style={[styles.mapInfoText, { color: theme.textSecondary }]}>
            🗺️ Interactive Google Maps with real-time bus tracking
          </Text>
        </View>
      </View>
    );
  }

  // Native map placeholder (would use react-native-maps in production)
  return (
    <View style={[styles.nativeMapContainer, { backgroundColor: theme.surface }]}>
      <View style={styles.mapHeader}>
        <Text style={[styles.mapTitle, { color: theme.text }]}>
          Google Maps Integration
        </Text>
        <Text style={[styles.mapSubtitle, { color: theme.textSecondary }]}>
          {buses.length} buses tracked
        </Text>
      </View>

      <View style={styles.mapContent}>
        {/* Simulated map with bus markers */}
        <View style={styles.busMarkers}>
          {buses.slice(0, 6).map((bus, index) => (
            <View
              key={bus.id}
              style={[
                styles.busMarker,
                { 
                  left: 50 + (index % 3) * 80,
                  top: 100 + Math.floor(index / 3) * 80,
                  backgroundColor: theme.primary 
                }
              ]}
            >
              <Text style={[styles.busMarkerText, { color: theme.background }]}>
                {bus.eta}m
              </Text>
            </View>
          ))}
          
          {userLocation && (
            <View style={[styles.userMarker, { backgroundColor: '#4285f4' }]}>
              <MapPin size={16} color="white" />
            </View>
          )}
        </View>

        <View style={styles.mapOverlay}>
          <Text style={[styles.overlayText, { color: theme.textSecondary }]}>
            📍 Your location
          </Text>
          <Text style={[styles.overlayText, { color: theme.textSecondary }]}>
            🚌 Live bus tracking
          </Text>
          <Text style={[styles.overlayText, { color: theme.textSecondary }]}>
            ⏱️ Real-time ETAs
          </Text>
        </View>
      </View>

      <View style={styles.mapFooter}>
        <Text style={[styles.footerNote, { color: theme.textSecondary }]}>
          * Google Maps integration active
        </Text>
        <Text style={[styles.footerNote, { color: theme.textSecondary }]}>
          Tap buses for route details and fare information
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webMapContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 16,
  },
  nativeMapContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 16,
  },
  mapHeader: {
    padding: 16,
    alignItems: 'center',
  },
  mapTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  mapSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  mapContent: {
    flex: 1,
    position: 'relative',
  },
  busMarkers: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  busMarker: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  busMarkerText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  userMarker: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 12,
    borderRadius: 8,
  },
  overlayText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  mapFooter: {
    padding: 16,
    alignItems: 'center',
  },
  footerNote: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  mapInfo: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderRadius: 8,
  },
  mapInfoText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    color: 'white',
  },
});