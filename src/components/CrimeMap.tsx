
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { telanganaDataService } from "@/services/telanganaDataService";
import { CrimeSeverityLegend } from './map/CrimeSeverityLegend';
import { TelanganaMapView } from './map/TelanganaMapView';
import { useFilters } from '@/contexts/FilterContext';
import { useTelanganaStats } from '@/hooks/useDashboardData';

export const CrimeMap: React.FC = () => {
  const { activeFilters } = useFilters();
  const { data: stats } = useTelanganaStats(activeFilters);
  
  // Get district coordinates
  const districtCoordinates = telanganaDataService.getDistrictCoordinates();
  
  // Convert filtered data to map regions format
  const regions = React.useMemo(() => {
    if (!stats?.districtData) return [];
    
    const districtCrimes = stats.districtData.reduce((acc, d) => {
      if (!acc[d.units]) {
        acc[d.units] = 0;
      }
      acc[d.units] += d.crimes;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(districtCrimes)
      .filter(([district]) => districtCoordinates[district])
      .map(([district, crimes]) => ({
        id: district.toLowerCase().replace(/\s+/g, '-'),
        name: district,
        center: districtCoordinates[district] as [number, number],
        crimeCount: {
          total: crimes,
          low: Math.floor(crimes * 0.4),
          medium: Math.floor(crimes * 0.3),
          high: Math.floor(crimes * 0.2),
          critical: Math.floor(crimes * 0.1)
        }
      }));
  }, [stats?.districtData, districtCoordinates]);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Crime Distribution Map</CardTitle>
        <CardDescription>
          Geographical distribution of reported incidents across Telangana
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <TelanganaMapView regions={regions} />
        <CrimeSeverityLegend />
      </CardContent>
    </Card>
  );
};
