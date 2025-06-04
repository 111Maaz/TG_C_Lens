import React, { useState } from 'react';
import { CircleMarker, Popup } from 'react-leaflet';
import { telanganaDataService, TelanganaDistrictData } from '@/services/telanganaDataService';
import { useFilters } from '@/contexts/FilterContext';
import { ChevronDown, ChevronRight } from 'lucide-react';

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

interface CrimeRegionMarkerProps {
  region: RegionData;
  severityColor: string;
  circleRadius: number;
}

const CollapsibleCrimeType = ({ category, crimes }: { category: string; crimes: TelanganaDistrictData[] }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Aggregate crimes by type
  const aggregatedCrimes = crimes.reduce((acc, crime) => {
    const key = crime.crimeType;
    if (!acc[key]) {
      acc[key] = {
        totalIncidents: 0,
        avgRate: 0,
        count: 0,
        latestRate: crime.crimeRateFor2021,
        avgVariation: 0
      };
    }
    acc[key].totalIncidents += crime.crimes;
    acc[key].avgRate += crime.crimeRateFor2021;
    acc[key].avgVariation += crime.percentVariationIn2021Over2020;
    acc[key].count += 1;
    return acc;
  }, {} as Record<string, { totalIncidents: number; avgRate: number; count: number; latestRate: number; avgVariation: number }>);

  // Convert to array and sort by total incidents
  const sortedCrimes = Object.entries(aggregatedCrimes)
    .map(([type, data]) => ({
      type,
      totalIncidents: data.totalIncidents,
      avgRate: data.avgRate / data.count,
      latestRate: data.latestRate,
      avgVariation: data.avgVariation / data.count
    }))
    .sort((a, b) => b.totalIncidents - a.totalIncidents);

  const totalCategoryIncidents = sortedCrimes.reduce((sum, crime) => sum + crime.totalIncidents, 0);

  return (
    <div className="mb-4">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center w-full text-left font-semibold text-gray-800 text-sm mb-2 hover:bg-gray-50 p-2 rounded-lg transition-colors"
      >
        {isExpanded ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
        <div className="flex-1">
          <span className="mr-2">📊 {category}</span>
          <span className="text-xs text-gray-500">
            ({sortedCrimes.length} types, {totalCategoryIncidents.toLocaleString()} total incidents)
          </span>
        </div>
      </button>
      
      {isExpanded && (
        <div className="ml-4 space-y-3 border-l-2 border-gray-200 pl-4">
          {sortedCrimes.map((crime, index) => (
            <div key={index} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-gray-800">{crime.type}</span>
                <span className="text-red-600 font-semibold">{crime.totalIncidents.toLocaleString()} incidents</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <span className="text-gray-500">Latest Rate:</span>
                  <span className="ml-1 font-medium">{crime.latestRate.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Avg. Rate:</span>
                  <span className="ml-1 font-medium">{crime.avgRate.toFixed(2)}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Trend:</span>
                  <span className={`ml-1 font-medium ${crime.avgVariation >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {crime.avgVariation >= 0 ? '↑' : '↓'} {Math.abs(crime.avgVariation * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const CrimeRegionMarker: React.FC<CrimeRegionMarkerProps> = ({ region, severityColor, circleRadius }) => {
  const { activeFilters } = useFilters();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  
  const getDistrictPopupContent = () => {
    const districtData = telanganaDataService.getDistrictData(region.name, activeFilters);
    
    if (districtData.length === 0) {
      return (
        <div className="p-3 min-w-[250px]">
          <h3 className="font-bold text-lg text-gray-800 mb-2">{region.name}</h3>
          <p className="text-sm text-gray-600">No data available for current filters</p>
        </div>
      );
    }

    // If specific filters are applied, show filtered data
    if (activeFilters.crimeCategory !== 'all' || activeFilters.crimeType !== 'all') {
      const totalCrimes = districtData.reduce((sum, d) => sum + d.crimes, 0);
      const avgRate = districtData.length > 0 ? districtData.reduce((sum, d) => sum + d.crimeRateFor2021, 0) / districtData.length : 0;
      const avgVariation = districtData.length > 0 ? districtData.reduce((sum, d) => sum + d.percentVariationIn2021Over2020, 0) / districtData.length : 0;
      const population = districtData[0]?.populationInLakhs || 0;

      return (
        <div className="p-3 min-w-[280px]">
          <h3 className="font-bold text-lg text-gray-800 mb-3">{region.name}</h3>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <span className="font-medium text-gray-700">Population:</span>
              <span>{population} lakhs</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="font-medium text-gray-700">Year:</span>
              <span>{districtData[0]?.year || 2021}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="font-medium text-gray-700">Category:</span>
              <span>{districtData[0]?.category || 'N/A'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="font-medium text-gray-700">Crime Type:</span>
              <span>{districtData[0]?.crimeType || 'N/A'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="font-medium text-gray-700">Total Incidents:</span>
              <span className="font-semibold text-red-600">{totalCrimes}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="font-medium text-gray-700">Crime Rate 2021:</span>
              <span>{avgRate.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="font-medium text-gray-700">YoY Variation:</span>
              <span className={`font-medium ${avgVariation >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {avgVariation >= 0 ? '+' : ''}{(avgVariation * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      );
    }

    // If no specific filters, show all data grouped by category with collapsible dropdowns
    const groupedData = districtData.reduce((acc, d) => {
      if (!acc[d.category]) {
        acc[d.category] = [];
      }
      acc[d.category].push(d);
      return acc;
    }, {} as Record<string, TelanganaDistrictData[]>);

    const population = districtData[0]?.populationInLakhs || 0;
    const totalCrimes = districtData.reduce((sum, d) => sum + d.crimes, 0);

    return (
      <div className="p-3 min-w-[320px] max-h-[400px] overflow-y-auto">
        <h3 className="font-bold text-lg text-gray-800 mb-3">{region.name}</h3>
        
        <div className="mb-3 p-2 bg-gray-50 rounded">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="font-medium text-gray-700">Population:</span>
            <span>{population} lakhs</span>
            <span className="font-medium text-gray-700">Total Incidents:</span>
            <span className="font-semibold text-red-600">{totalCrimes}</span>
          </div>
        </div>

        {Object.entries(groupedData).map(([category, crimes]) => (
          <CollapsibleCrimeType key={category} category={category} crimes={crimes} />
        ))}
      </div>
    );
  };

  return (
    <CircleMarker 
      center={region.center}
      radius={circleRadius}
      pathOptions={{
        fillColor: severityColor,
        fillOpacity: 0.7,
        color: '#333',
        weight: 1
      }}
      eventHandlers={{
        click: () => setIsPopupOpen(true),
        popupclose: () => setIsPopupOpen(false)
      }}
    >
      <Popup 
        maxWidth={350} 
        minWidth={280}
        className="crime-popup"
        autoPan={true}
        closeButton={true}
      >
        {getDistrictPopupContent()}
      </Popup>
    </CircleMarker>
  );
};
