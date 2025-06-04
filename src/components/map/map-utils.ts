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
  
  if (total > 20000) return '#050005';      // >20000 crimes - Very Dark Purple
  if (total >= 10001) return '#662399';     // 10001-20000 crimes - Purple
  if (total >= 4000) return '#c91d14';      // 4000-10000 crimes - Red
  return '#f59c2f';                         // 500-3999 crimes - Orange
};

// Get color legend data for the UI
export const getColorLegendData = () => [
  { color: '#f59c2f', label: '500-3,999 crimes', range: 'Low' },
  { color: '#c91d14', label: '4,000-10,000 crimes', range: 'Medium' },
  { color: '#662399', label: '10,001-20,000 crimes', range: 'High' },
  { color: '#050005', label: '>20,000 crimes', range: 'Critical' }
];
