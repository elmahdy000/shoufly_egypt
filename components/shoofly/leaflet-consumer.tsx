'use client';

import { useMapEvents } from 'react-leaflet';
import { useEffect } from 'react';

export function LMapConsumer({ 
  onClick, 
  center 
}: { 
  onClick: (lat: number, lng: number) => void;
  center: { lat: number, lng: number };
}) {
  const map = useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom());
  }, [center, map]);

  return null;
}
