import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet';
import { Icon, LatLngBounds, LatLng } from 'leaflet';
import { Badge } from "@/components/ui/badge";
import { unofficialReportsService, UnofficialReport } from "@/services/unofficial-reports";
import { Marker, Popup } from "react-leaflet";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import 'leaflet/dist/leaflet.css';

const unofficialMarkerIcon = new Icon({
  iconUrl: "/unofficial-marker.svg",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Component to update map view based on markers
const MapBoundsUpdater: React.FC<{ reports: UnofficialReport[] }> = ({ reports }) => {
  const map = useMap();

  useEffect(() => {
    if (reports.length === 0) {
      // Default view for Telangana if no reports
      map.setView([18.1124, 79.0193], 7);
      return;
    }

    // Create bounds object from report locations
    const bounds = new LatLngBounds([]);
    reports.forEach(report => {
      bounds.extend([report.location.lat, report.location.lng]);
    });

    // Add padding to bounds
    const paddedBounds = bounds.pad(0.2); // 20% padding
    map.fitBounds(paddedBounds);

    // If only one marker, zoom in more
    if (reports.length === 1) {
      map.setZoom(12); // Closer zoom for single location
    }
  }, [reports, map]);

  return null;
};

export const UnofficialReportsMap: React.FC = () => {
  const [reports, setReports] = useState<UnofficialReport[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Calculate center based on reports or use Telangana default
  const mapCenter = useMemo(() => {
    if (reports.length === 0) return [18.1124, 79.0193] as [number, number];
    
    const total = reports.reduce(
      (acc, report) => ({
        lat: acc.lat + report.location.lat,
        lng: acc.lng + report.location.lng,
      }),
      { lat: 0, lng: 0 }
    );
    
    return [
      total.lat / reports.length,
      total.lng / reports.length,
    ] as [number, number];
  }, [reports]);

  const fetchReports = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("Fetching unofficial reports...");
      const data = await unofficialReportsService.getApproved();
      console.log("Fetched reports:", data);
      setReports(data);
      if (data.length === 0) {
        toast.info("No reports found");
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch reports");
      toast.error("Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();

    // Set up real-time subscription
    const subscription = unofficialReportsService.subscribeToReports((payload) => {
      console.log("Received real-time update:", payload);
      fetchReports();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchReports]);

  const handleRefresh = () => {
    fetchReports();
  };

  return (
    <div className="relative w-full overflow-hidden rounded-lg">
      <div className="absolute top-4 right-4 z-[1000]">
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isLoading}
          className="bg-white shadow-md hover:bg-gray-100"
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Map
        </Button>
      </div>

      <MapContainer 
        className="h-[450px] w-full"
        center={mapCenter}
        zoom={7} 
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="topright" />
        <MapBoundsUpdater reports={reports} />
        
        {reports.map((report) => {
          console.log("Rendering report:", report);
          return (
            <Marker
              key={report.id}
              position={[report.location.lat, report.location.lng]}
              icon={unofficialMarkerIcon}
            >
              <Popup>
                <div className="space-y-2 p-1">
                  <div className="flex flex-col gap-1">
                    <Badge variant="outline" className="w-fit">
                      {report.crime_category}
                    </Badge>
                    <Badge variant="secondary" className="w-fit">
                      {report.crime_type}
                    </Badge>
                  </div>
                  <h3 className="font-medium">District: {report.district}</h3>
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      Unofficial Report
                    </Badge>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      {error && (
        <div className="absolute bottom-4 left-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {reports.length === 0 && !error && !isLoading && (
        <div className="absolute bottom-4 left-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          No reports found.
        </div>
      )}
    </div>
  );
}; 