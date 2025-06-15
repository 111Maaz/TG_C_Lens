import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle, Gavel, Clock, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { useTelanganaStats } from '@/hooks/useDashboardData';
import { useFilters } from '@/contexts/FilterContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  change?: {
    value: string;
    positive: boolean;
  };
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon,
  change,
  className
}) => {
  return (
    <Card className={`glass-card transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="rounded bg-primary/20 p-2 text-primary animate-pulse">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold animate-fade-in">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {change && (
          <div className={`mt-2 flex items-center text-xs font-medium ${change.positive ? 'text-green-500' : 'text-red-500'}`}>
            {change.positive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {change.value}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const StatsCardGrid: React.FC = () => {
  const { activeFilters } = useFilters();
  const { data: stats, isLoading } = useTelanganaStats(activeFilters);

  // Calculate enhanced statistics from CSV data
  const enhancedStats = React.useMemo(() => {
    if (!stats?.districtData || stats.districtData.length === 0) {
      return {
        hotspotDistrict: { name: 'N/A', rate: 0 },
        safestDistrict: { name: 'N/A', rate: 0 },
        topCrimeType: { type: 'N/A', count: 0 },
        yearOverYearTrend: { change: 0, positive: false }
      };
    }

    // Filter out RP SECUNDERABAD and CID when no filters are applied
    const filteredData = activeFilters.district === 'all' && activeFilters.crimeCategory === 'all' && activeFilters.crimeType === 'all'
      ? stats.districtData.filter(d => d.units !== 'RP SECUNDERABAD' && d.units !== 'CID')
      : stats.districtData;

    // Crime Hotspot: District with highest crime rate
    const districtRates = filteredData.reduce((acc, item) => {
      if (!acc[item.units]) {
        acc[item.units] = {
          totalCrimes: 0,
          population: item.populationInLakhs,
          crimeRate: 0
        };
      }
      acc[item.units].totalCrimes += item.crimes;
      return acc;
    }, {} as Record<string, any>);

    // Filter out districts with 0 or invalid population and calculate actual crime rates
    const validDistricts = Object.entries(districtRates)
      .filter(([_, data]) => data.population > 0 && isFinite(data.population))
      .map(([name, data]) => ({
        name,
        rate: data.totalCrimes / data.population
      }));

    const hotspotDistrict = validDistricts
      .sort((a, b) => b.rate - a.rate)[0] || { name: 'N/A', rate: 0 };

    // Safest District: District with lowest crime rate (excluding 0 rates)
    const safestDistrict = validDistricts
      .sort((a, b) => a.rate - b.rate)[0] || { name: 'N/A', rate: 0 };

    // Top Crime Type: Most reported crime type
    const crimeTypeCounts = filteredData.reduce((acc, item) => {
      if (!acc[item.crimeType]) {
        acc[item.crimeType] = 0;
      }
      acc[item.crimeType] += item.crimes;
      return acc;
    }, {} as Record<string, number>);

    const topCrimeType = Object.entries(crimeTypeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)[0] || { type: 'N/A', count: 0 };

    // Year-over-Year Trend: Calculate from variation data
    const avgVariation = filteredData.length > 0 
      ? filteredData.reduce((sum, d) => sum + d.percentVariationIn2021Over2020, 0) / filteredData.length
      : 0;

    const yearOverYearTrend = {
      change: Math.abs(avgVariation * 100),
      positive: avgVariation > 0
    };

    return {
      hotspotDistrict,
      safestDistrict,
      topCrimeType,
      yearOverYearTrend
    };
  }, [stats, activeFilters]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[120px] w-full" />
        ))}
      </div>
    );
  }

  const getYearText = () => {
    return activeFilters.year === 'all' ? 'both years' : activeFilters.year;
  };

  const getDistrictText = () => {
    return activeFilters.district === 'all' ? 'all districts' : activeFilters.district;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-fade-in">
  <StatsCard
    title="Crime Hotspot"
    value={enhancedStats.hotspotDistrict.name}
    description={`${enhancedStats.hotspotDistrict.rate.toFixed(1)} crimes/lakh population`}
    icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
    className="relative backdrop-blur-sm bg-white/5 p-4 rounded-2xl ring-1 ring-black/30 shadow-md"
  />

  <StatsCard
    title="Safest District"
    value={enhancedStats.safestDistrict.name}
    description={`${enhancedStats.safestDistrict.rate.toFixed(1)} crimes/lakh population`}
    icon={<Shield className="h-5 w-5 text-blue-500" />}
    className="relative backdrop-blur-sm bg-white/5 p-4 rounded-2xl ring-1 ring-black/30 shadow-md"
  />

  <StatsCard
    title="Top Crime Type"
    value={enhancedStats.topCrimeType.type}
    description={`${enhancedStats.topCrimeType.count.toLocaleString()} total cases`}
    icon={<Gavel className="h-5 w-5 text-purple-500" />}
    className="relative backdrop-blur-sm bg-white/5 p-4 rounded-2xl ring-1 ring-black/30 shadow-md"
  />

  <StatsCard
    title="Crime Trend (2020→2021)"
    value={`${enhancedStats.yearOverYearTrend.positive ? '↑' : '↓'} ${enhancedStats.yearOverYearTrend.change.toFixed(1)}%`}
    description="Year-over-year change"
    icon={
      enhancedStats.yearOverYearTrend.positive
        ? <TrendingUp className="h-5 w-5 text-green-500" />
        : <TrendingDown className="h-5 w-5 text-red-500" />
    }
    className="relative backdrop-blur-sm bg-white/5 p-4 rounded-2xl ring-1 ring-black/30 shadow-md"
  />
</div>

  );
};
