import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

export default function HeatmapLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !points) return;

    // IRONCLAD FILTERING: Remove any rows that have undefined, null, or unparseable coordinate types
    const validPoints = points.filter(p => {
      if (!p || !Array.isArray(p)) return false;
      const lat = parseFloat(p[0]);
      const lng = parseFloat(p[1]);
      
      // Ensure both elements are valid numeric sequences and not NaN
      return !isNaN(lat) && !isNaN(lng);
    });

    // Initialize the leaflet heat layer using exclusively clean, validated point data arrays
    const heatLayer = L.heatLayer(validPoints, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
    }).addTo(map);

    // Dynamic garbage collection cleanup
    return () => {
      if (map && heatLayer) {
        map.removeLayer(heatLayer);
      }
    };
  }, [map, points]);

  return null;
}