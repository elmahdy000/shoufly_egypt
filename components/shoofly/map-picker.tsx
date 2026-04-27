'use client';

import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { Activity, AlertTriangle, Map as MapIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import "leaflet/dist/leaflet.css";

const containerStyle = {
  width: '100%',
  height: '100%'
};

// Dynamic imports for Leaflet
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const LeafletMarker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const LMapConsumer = dynamic(() => import("./leaflet-consumer").then((mod) => mod.LMapConsumer), { ssr: false });

export default function MapPickerComponent({ 
  initialLat, 
  initialLng, 
  onLocationChange 
}: { 
  initialLat: number, 
  initialLng: number, 
  onLocationChange: (lat: number, lng: number) => void 
}) {
  const [position, setPosition] = useState({ lat: initialLat, lng: initialLng });

  const [L, setL] = useState<any>(null);
  const useFreeMaps = process.env.NEXT_PUBLIC_USE_FREE_MAPS === 'true';

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: !useFreeMaps ? (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "") : "",
    language: 'ar',
  });

  useEffect(() => {
    if (loadError || useFreeMaps) {
      import("leaflet").then((leaflet) => {
        setL(leaflet);
        // Fix default icon issue
        delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
        leaflet.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        });
      });
    }
  }, [loadError, useFreeMaps]);

  useEffect(() => {
    onLocationChange(position.lat, position.lng);
  }, [position, onLocationChange]);

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    }
  }, []);

  const onLeafletClick = useCallback((lat: number, lng: number) => {
    setPosition({ lat, lng });
  }, []);

  // Update position if initial coordinates change externally
  useEffect(() => {
    setPosition({ lat: initialLat, lng: initialLng });
  }, [initialLat, initialLng]);

  // Render Leaflet Fallback
  if ((loadError || useFreeMaps) && L) {
    return (
      <div className="h-full w-full rounded-2xl overflow-hidden border-0 relative shadow-inner bg-slate-100">
        <MapContainer 
          center={[position.lat, position.lng]} 
          zoom={14} 
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          <LMapConsumer onClick={onLeafletClick} center={position} />
          <LeafletMarker 
            position={[position.lat, position.lng]} 
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const pos = marker.getLatLng();
                setPosition({ lat: pos.lat, lng: pos.lng });
              },
            }}
          />
        </MapContainer>
        <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 shadow-sm flex items-center gap-2">
          <MapIcon size={14} className="text-primary" />
          <span className="text-[10px] font-bold text-slate-600">نظام الخرائط البديل نشط</span>
        </div>
      </div>
    );
  }

  if (loadError && !L) {
    return (
      <div className="h-full w-full rounded-2xl flex flex-col items-center justify-center bg-rose-50 border border-rose-200 text-rose-500 gap-2 p-4 text-center">
        <AlertTriangle size={32} />
        <span className="font-bold text-sm">فشل تحميل الخرائط. يرجى المحاولة لاحقاً.</span>
      </div>
    );
  }

  if (!isLoaded && !useFreeMaps) {
    return (
      <div className="h-full w-full rounded-2xl flex flex-col items-center justify-center bg-slate-50 border border-slate-200 text-slate-400 gap-3">
        <Activity size={28} className="animate-spin text-primary" />
        <span className="font-bold text-xs">جاري تحميل الخريطة...</span>
      </div>
    );
  }

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border-0 relative">
      <GoogleMap
        key={`${position.lat}-${position.lng}`} 
        mapContainerStyle={containerStyle}
        center={position}
        zoom={14}
        onClick={onMapClick}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        }}
      >
        <Marker 
          position={position}
          draggable={true}
          onDragEnd={(e) => {
            if (e.latLng) {
              setPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() });
            }
          }}
        />
      </GoogleMap>
    </div>
  );
}
