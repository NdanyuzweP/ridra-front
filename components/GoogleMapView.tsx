import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useTheme } from '@/contexts/ThemeContext';
import { Bus } from '@/types/bus';
import { MapPin, Navigation } from 'lucide-react-native';

interface GoogleMapViewProps {
  buses: Bus[];
  userLocation?: { latitude: number; longitude: number };
  onBusPress?: (bus: Bus) => void;
}

const { width, height } = Dimensions.get('window');

// Default location (Kigali, Rwanda)
const DEFAULT_REGION = {
  latitude: -1.9441,
  longitude: 30.0619,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export function GoogleMapView({ buses, userLocation, onBusPress }: GoogleMapViewProps) {
  const { theme } = useTheme();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [region, setRegion] = useState(DEFAULT_REGION);

  useEffect(() => {
    if (userLocation) {
      setRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  }, [userLocation]);

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
            src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyBym8ra9Gj5Yxhef0BSkuNzyAHJq5lyH5A&center=${userLocation?.latitude || -1.9441},${userLocation?.longitude || 30.0619}&zoom=13&maptype=roadmap`}
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
            {buses.slice(0, 8).map((bus, index) => {
              // Calculate position based on bus location relative to map center
              const centerLat = userLocation?.latitude || -1.9441;
              const centerLng = userLocation?.longitude || 30.0619;
              
              // Simple conversion for demo - in production you'd use proper map projection
              const latOffset = (bus.currentLocation.latitude - centerLat) * 1000;
              const lngOffset = (bus.currentLocation.longitude - centerLng) * 1000;
              
              const left = Math.max(10, Math.min(90, 50 + lngOffset));
              const top = Math.max(10, Math.min(90, 50 - latOffset));
              
              return (
                <div
                  key={bus.id}
                  style={{
                    position: 'absolute',
                    left: `${left}%`,
                    top: `${top}%`,
                    backgroundColor: bus.isActive ? theme.primary : theme.textSecondary,
                    color: theme.background,
                    padding: '6px 10px',
                    borderRadius: '16px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    pointerEvents: 'auto',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    transform: 'translate(-50%, -50%)',
                    minWidth: '60px',
                    textAlign: 'center',
                    border: '2px solid white',
                  }}
                  onClick={() => onBusPress?.(bus)}
                  title={`${bus.route} - ${bus.eta}min ETA`}
                >
                  🚌 {bus.eta}m
                </div>
              );
            })}
            
            {userLocation && (
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: '#4285f4',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: '4px solid white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  zIndex: 1000,
                }}
                title="Your location"
              />
            )}
          </div>
        </div>
        
        <View style={styles.mapInfo}>
          <Text style={[styles.mapInfoText, { color: 'white' }]}>
            🗺️ Google Maps - {buses.length} buses tracked
          </Text>
        </View>
      </View>
    );
  }

  // Native map implementation using react-native-maps
  return (
    <View style={[styles.nativeMapContainer, { backgroundColor: theme.surface }]}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={!!userLocation}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        mapType="standard"
        onMapReady={() => setMapLoaded(true)}
      >
        {/* User location marker */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            description="You are here"
          >
            <View style={[styles.userLocationMarker, { backgroundColor: '#4285f4' }]}>
              <Navigation size={16} color="white" />
            </View>
          </Marker>
        )}

        {/* Bus markers */}
        {buses.map((bus) => (
          <Marker
            key={bus.id}
            coordinate={bus.currentLocation}
            title={`${bus.route}`}
            description={`${bus.destination} - ${bus.eta}min ETA`}
            onPress={() => onBusPress?.(bus)}
          >
            <View style={[
              styles.busMarker,
              { 
                backgroundColor: bus.isActive ? theme.primary : theme.textSecondary,
                borderColor: theme.background,
              }
            ]}>
              <Text style={[styles.busMarkerText, { color: theme.background }]}>
                🚌
              </Text>
              <Text style={[styles.busMarkerEta, { color: theme.background }]}>
                {bus.eta}m
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {!mapLoaded && (
        <View style={[styles.loadingOverlay, { backgroundColor: theme.surface }]}>
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Loading Google Maps...
          </Text>
        </View>
      )}

      <View style={[styles.mapStats, { backgroundColor: theme.surface + 'E6' }]}>
        <Text style={[styles.statsText, { color: theme.text }]}>
          📍 {buses.filter(b => b.isActive).length} active buses
        </Text>
        <Text style={[styles.statsText, { color: theme.textSecondary }]}>
          🗺️ Google Maps
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
  map: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  userLocationMarker: {
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
  busMarker: {
    minWidth: 50,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  busMarkerText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  busMarkerEta: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    marginTop: 1,
  },
  mapStats: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
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
  },
});