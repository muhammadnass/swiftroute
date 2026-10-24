'use client';
import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface MapMarker {
  lat: number;
  lng: number;
  title?: string;
  type?: 'rider' | 'pickup' | 'delivery' | 'default';
}

interface MapViewProps {
  markers?: MapMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
  onMarkerClick?: (marker: MapMarker) => void;
}

const MARKER_COLORS: Record<string, string> = {
  rider: '#f97316',
  pickup: '#22c55e',
  delivery: '#ef4444',
  default: '#6366f1',
};

// Default to Lagos, Nigeria
const DEFAULT_CENTER = { lat: 6.5244, lng: 3.3792 };

export default function MapView({ markers = [], center, zoom = 12, className = '', onMarkerClick }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerRefs = useRef<google.maps.Marker[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    if (!apiKey) {
      setError(true);
      return;
    }

    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places'],
    });

    loader.load().then(() => {
      if (!mapRef.current) return;

      const map = new google.maps.Map(mapRef.current, {
        center: center || DEFAULT_CENTER,
        zoom,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#1a1a24' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
          { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
          { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
          { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
          { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
          { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
          { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
          { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
          { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
          { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
          { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
          { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
          { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
          { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] },
        ],
      });

      mapInstance.current = map;
      setLoaded(true);
    }).catch(() => setError(true));
  }, []);

  // Update markers when they change
  useEffect(() => {
    if (!mapInstance.current || !loaded) return;

    // Clear existing markers
    markerRefs.current.forEach(m => m.setMap(null));
    markerRefs.current = [];

    // Add new markers
    markers.forEach(marker => {
      const color = MARKER_COLORS[marker.type || 'default'];
      const gmMarker = new google.maps.Marker({
        position: { lat: marker.lat, lng: marker.lng },
        map: mapInstance.current!,
        title: marker.title,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: marker.type === 'rider' ? 10 : 8,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      if (onMarkerClick) {
        gmMarker.addListener('click', () => onMarkerClick(marker));
      }

      markerRefs.current.push(gmMarker);
    });

    // Auto-fit bounds if multiple markers
    if (markers.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      markers.forEach(m => bounds.extend({ lat: m.lat, lng: m.lng }));
      mapInstance.current.fitBounds(bounds, 60);
    } else if (markers.length === 1) {
      mapInstance.current.setCenter({ lat: markers[0].lat, lng: markers[0].lng });
    }
  }, [markers, loaded]);

  // Update center when it changes
  useEffect(() => {
    if (mapInstance.current && center) {
      mapInstance.current.setCenter(center);
    }
  }, [center]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-dark-800 rounded-2xl border border-white/10 ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-3">🗺️</div>
          <p className="text-sm">Map unavailable</p>
          <p className="text-xs text-gray-600 mt-1">Add NEXT_PUBLIC_GOOGLE_MAPS_KEY to enable maps</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-white/10 ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-800 z-10">
          <div className="spinner w-8 h-8" />
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
