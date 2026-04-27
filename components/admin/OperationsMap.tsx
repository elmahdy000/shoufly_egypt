"use client";

import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { useState, useCallback, useEffect } from 'react';
import { FiUser, FiTruck, FiBox, FiPackage } from 'react-icons/fi';
import dynamic from 'next/dynamic';
import "leaflet/dist/leaflet.css";

const containerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 30.0444, // Cairo
  lng: 31.2357
};

// Dynamic imports for Leaflet
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const LeafletMarker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

interface MapObject {
  id: string;
  type: 'CLIENT' | 'VENDOR' | 'RIDER';
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  status?: string;
}

export function OperationsMap({ data }: { data: MapObject[] }) {
  const [useFreeMaps, setUseFreeMaps] = useState(process.env.NEXT_PUBLIC_USE_FREE_MAPS === 'true');
  const [L, setL] = useState<any>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: !useFreeMaps ? (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "") : ""
  });

  const [selected, setSelected] = useState<MapObject | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

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

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    const bounds = new window.google.maps.LatLngBounds();
    if (data.length > 0) {
      data.forEach(obj => bounds.extend({ lat: obj.lat, lng: obj.lng }));
      map.fitBounds(bounds);
    }
    setMap(map);
  }, [data]);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  const getIcon = (type: string) => {
    if (type === 'CLIENT') return {
        url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        scaledSize: new window.google.maps.Size(40, 40)
    };
    if (type === 'VENDOR') return {
        url: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png',
        scaledSize: new window.google.maps.Size(40, 40)
    };
    if (type === 'RIDER') return {
        url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
        scaledSize: new window.google.maps.Size(40, 40)
    };
    return undefined;
  };

  const getLeafletIcon = (type: string) => {
    if (!L) return undefined;
    const colors = {
      'CLIENT': '#3b82f6',
      'VENDOR': '#f97316',
      'RIDER': '#10b981'
    };
    const color = colors[type as keyof typeof colors] || '#64748b';
    
    return new L.DivIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.2);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12]
    });
  };

  // Render Leaflet Fallback
  if ((loadError || useFreeMaps) && L) {
    return (
      <div className="w-full h-full rounded-2xl overflow-hidden relative border border-slate-200">
        <MapContainer 
          center={[defaultCenter.lat, defaultCenter.lng]} 
          zoom={12} 
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          {data.map((obj) => (
            <LeafletMarker 
              key={obj.id} 
              position={[obj.lat, obj.lng]}
              icon={getLeafletIcon(obj.type)}
            >
              <Popup>
                <div className="p-1 dir-rtl text-right min-w-[150px]">
                  <h4 className="font-bold text-slate-900 text-sm mb-0">{obj.title}</h4>
                  <p className="text-[10px] text-slate-500 mb-1">{obj.subtitle}</p>
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${
                      obj.type === 'CLIENT' ? 'bg-blue-100 text-blue-600' :
                      obj.type === 'VENDOR' ? 'bg-orange-100 text-orange-600' :
                      'bg-emerald-100 text-emerald-600'
                  }`}>
                      {obj.type === 'CLIENT' ? 'طلب عميل' : obj.type === 'VENDOR' ? 'مورد' : 'مندوب'}
                  </span>
                </div>
              </Popup>
            </LeafletMarker>
          ))}
        </MapContainer>
        <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-lg flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-slate-700">وضع الخرائط المجاني (OpenStreetMap)</span>
        </div>
      </div>
    );
  }

  if (!isLoaded && !useFreeMaps) return <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 font-bold italic">جاري تحميل نظام الخرائط...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={defaultCenter}
      zoom={12}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        styles: [
            {
              "featureType": "all",
              "elementType": "labels.text.fill",
              "stylers": [{"saturation": 36}, {"color": "#333333"}, {"lightness": 40}]
            },
            {
              "featureType": "landscape",
              "elementType": "all",
              "stylers": [{"color": "#f2f2f2"}]
            }
        ]
      }}
    >
      {data.map((obj) => (
        <Marker
          key={obj.id}
          position={{ lat: obj.lat, lng: obj.lng }}
          onClick={() => setSelected(obj)}
          icon={getIcon(obj.type)}
        />
      ))}

      {selected && (
        <InfoWindow
          position={{ lat: selected.lat, lng: selected.lng }}
          onCloseClick={() => setSelected(null)}
        >
          <div className="p-2 dir-rtl text-right min-w-[150px]">
             <h4 className="font-bold text-slate-900 text-sm mb-1">{selected.title}</h4>
             <p className="text-[10px] text-slate-500 mb-2">{selected.subtitle}</p>
             <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    selected.type === 'CLIENT' ? 'bg-blue-100 text-blue-600' :
                    selected.type === 'VENDOR' ? 'bg-orange-100 text-orange-600' :
                    'bg-emerald-100 text-emerald-600'
                }`}>
                    {selected.type === 'CLIENT' ? 'طلب عميل' : selected.type === 'VENDOR' ? 'مورد' : 'مندوب'}
                </span>
                {selected.status && (
                    <span className="text-[9px] font-bold text-slate-400">{selected.status}</span>
                )}
             </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
