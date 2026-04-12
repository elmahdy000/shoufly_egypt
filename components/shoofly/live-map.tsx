"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamic import for Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

export function LiveMap({ points }: { points?: any[] }) {
  const [isMounted, setIsMounted] = useState(false);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    import("leaflet").then((leaflet) => {
      setL(leaflet);
      // Fix default icon issue in Leaflet with Webpack/Next.js
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      });
    });
  }, []);

  if (!isMounted || !L) return (
     <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center font-bold text-slate-400">
        جاري تحميل نظام الخرائط المجاني...
     </div>
  );

  const defaultCenter: [number, number] = [30.0444, 31.2357]; // Cairo

  return (
    <div className="w-full h-full rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={12} 
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        {/* Using CartoDB Positron for a premium, clean look (Free) */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {points?.map((p, i) => (
          <Marker key={i} position={[p.lat, p.lng]}>
            <Popup>
              <div className="text-right font-sans">
                <p className="font-bold text-slate-900">{p.title}</p>
                <p className="text-xs text-slate-500">{p.status}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Custom Legend */}
      <div className="absolute bottom-6 right-6 z-[1000] bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-100 shadow-xl pointer-events-none">
         <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">حالة الأوردرات</h4>
         <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
               <span className="w-2.5 h-2.5 bg-primary rounded-full" /> قيد التحرك
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
               <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> تم التسليم
            </div>
         </div>
      </div>
    </div>
  );
}
