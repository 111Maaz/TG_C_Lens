import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, ZoomControl, GeoJSON } from 'react-leaflet';
import { CrimeRegionMarker } from './CrimeRegionMarker';
import { getSeverityColor, setupLeafletDefaultIcon } from './map-utils';
import 'leaflet/dist/leaflet.css';
import './map.css';

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

interface TelanganaMapViewProps {
  regions: RegionData[];
}

export const TelanganaMapView: React.FC<TelanganaMapViewProps> = ({ regions }) => {
  // Center coordinates for Telangana state
  const telanganaCenter: [number, number] = [18.1124, 79.0193];
  const [districtBoundaries, setDistrictBoundaries] = useState<any>(null);
  
  // Initialize Leaflet default icon
  useEffect(() => {
    setupLeafletDefaultIcon();
  }, []);

  // Load district boundaries
  useEffect(() => {
    const loadDistrictBoundaries = async () => {
      try {
        const response = await fetch('/districts.json');
        const data = await response.json();
        setDistrictBoundaries(data);
      } catch (error) {
        console.error('Failed to load district boundaries:', error);
      }
    };
    loadDistrictBoundaries();
  }, []);

  // Fixed circle radius for all districts (uniform size)
  const FIXED_CIRCLE_RADIUS = 12;

  // Style for district boundaries
  const districtStyle = {
    fillColor: 'transparent',
    weight: 1,
    opacity: 0.8,
    color: '#666',
    fillOpacity: 0.1,
    interactive: false // Disable interactions with boundaries
  };

  return (
    <div className="relative w-full overflow-hidden rounded-lg">
      <MapContainer 
        className="h-[450px] w-full"
        center={telanganaCenter}
        zoom={7} 
        zoomControl={false}
        attributionControl={false}
      >
        {/* Base map layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* District Boundaries Layer */}
        {districtBoundaries && (
          <GeoJSON 
            data={districtBoundaries} 
            style={districtStyle}
            interactive={false}
          />
        )}
        
        {/* Crime Markers Layer */}
        {regions.map(region => (
          <CrimeRegionMarker 
            key={region.id}
            region={region}
            severityColor={getSeverityColor(region)}
            circleRadius={FIXED_CIRCLE_RADIUS}
          />
        ))}

        {/* Controls */}
        <ZoomControl position="topright" />
      </MapContainer>
    </div>
  );
};
