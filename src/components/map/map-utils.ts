import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

interface RegionData {
  id: string;
  name: string;
  center: [number, number];
  crimeCount: {
    low: number;
    medium: number;
    high: number;
    critical: number;
    total: number;
  };
}

// Set up default icon for Leaflet
export const setupLeafletDefaultIcon = (): void => {
  const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
  
  L.Marker.prototype.options.icon = DefaultIcon;
};

// Helper function to determine color based on total crime count
export const getSeverityColor = (region: RegionData): string => {
  const total = region.crimeCount.total;
  
  if (total > 20000) return '#b71c1c';      // >20000 crimes - Dark Red - Extreme
  if (total >= 10001) return '#ef6c00';     // 10001-20000 crimes - Orange-Red - High
  if (total >= 4000) return '#fbc02d';      // 4000-10000 crimes - Mustard Yellow - Moderate
  return '#388e3c';                         // 500-3999 crimes - Green - Safe

};

// Get color legend data for the UI
export const getColorLegendData = () => [
  { color: '#388e3c', label: '500-3,999 crimes', range: 'Low' },
  { color: '#fbc02d', label: '4,000-10,000 crimes', range: 'Medium' },
  { color: '#ef6c00', label: '10,001-20,000 crimes', range: 'High' },
  { color: '#b71c1c', label: '>20,000 crimes', range: 'Critical' }
];
