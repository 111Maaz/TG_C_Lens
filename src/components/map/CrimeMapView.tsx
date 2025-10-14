
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import { RegionData } from '@/lib/crime-data';
import { CrimeRegionMarker } from './CrimeRegionMarker';
import { getSeverityColor, setupLeafletDefaultIcon } from './map-utils';
import 'leaflet/dist/leaflet.css';

interface CrimeMapViewProps {
  regions: RegionData[];
}

export const CrimeMapView: React.FC<CrimeMapViewProps> = ({ regions }) => {
  // Center coordinates for Hyderabad
  const hyderabadCenter: [number, number] = [17.3850, 78.4867];
  
  // Initialize Leaflet default icon
  useEffect(() => {
    setupLeafletDefaultIcon();
  }, []);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-md">
      <MapContainer 
        className="h-[500px] w-full"
        center={hyderabadCenter}
        zoom={11} 
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="topright" />
        
        {regions.map(region => {
          // Create a scaled circle size based on total crime count
          const circleRadius = Math.max(20, Math.min(50, region.crimeCount.total / 5));
          const severity = getSeverityColor(region);
          
          return (
            <CrimeRegionMarker 
              key={region.id}
              region={region}
              severityColor={severity}
              circleRadius={circleRadius}
            />
          );
        })}
      </MapContainer>
    </div>
  );
};
