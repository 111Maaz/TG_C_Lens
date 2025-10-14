import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { telanganaDataService } from "@/services/telanganaDataService";
import { CrimeSeverityLegend } from './map/CrimeSeverityLegend';
import { TelanganaMapView } from './map/TelanganaMapView';
import { UnofficialReportsMap } from './map/UnofficialReportsMap';
import { useFilters } from '@/contexts/FilterContext';
import { useTelanganaStats } from '@/hooks/useDashboardData';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

export const CrimeMap: React.FC = () => {
  const { activeFilters } = useFilters();
  const { data: stats } = useTelanganaStats(activeFilters);
  const [showUnofficialReports, setShowUnofficialReports] = useState(false);
  
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
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-blue-500" />
          <span className="font-medium">Unofficial Crime Reports</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            {showUnofficialReports ? 'Showing user-submitted reports' : 'Only showing official data'}
          </span>
          <div className="flex items-center space-x-2">
            <Switch
              id="show-unofficial"
              checked={showUnofficialReports}
              onCheckedChange={setShowUnofficialReports}
            />
            <Label htmlFor="show-unofficial" className="font-medium">
              {showUnofficialReports ? 'Hide Reports' : 'Show Reports'}
            </Label>
          </div>
        </div>
      </div>

      <Card className="w-full">
        <CardHeader>
          <div>
            <CardTitle>Crime Distribution Map</CardTitle>
            <CardDescription>
              {showUnofficialReports 
                ? 'User-submitted unofficial crime reports across Telangana'
                : 'Geographical distribution of reported incidents across Telangana'
              }
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {showUnofficialReports ? (
            <UnofficialReportsMap />
          ) : (
            <TelanganaMapView regions={regions} />
          )}
          <div className="p-4 space-y-4">
            {!showUnofficialReports && <CrimeSeverityLegend />}
            {showUnofficialReports && (
              <div className="flex items-center text-sm text-gray-500">
                <div className="w-4 h-4 rounded-full bg-blue-500 mr-2" />
                <span>Unofficial Reports (User Submitted)</span>
                <span className="text-xs ml-2 text-gray-400">⚠️ Unverified Data</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
