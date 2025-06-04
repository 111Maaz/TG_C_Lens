
import React, { useEffect, useState } from 'react';
import { SidebarWrapper } from '@/components/AppSidebar';
import { StatsCardGrid } from '@/components/StatsCards';
import { CrimeMap } from '@/components/CrimeMap';
import { CrimeStatisticsChart, CrimeTrendsChart } from '@/components/CrimeCharts';
import { DashboardFilters } from '@/components/Filters';
import { MapPin, Shield, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useTelanganaStats } from '@/hooks/useDashboardData';
import { useFilters } from '@/contexts/FilterContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SafetyFocusZone = ({ title, description, className }: { title: string; description: string; className?: string }) => {
  return (
    <div className={`safety-zone ${className}`}>
      <div className="flex items-start gap-3">
        <div className="bg-primary/20 p-2 rounded-full">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-medium flex items-center">
            <MapPin className="h-4 w-4 mr-1 text-primary" /> {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  const { activeFilters, isFiltered } = useFilters();
  const { data: telanganaStats, isLoading, error, refetch } = useTelanganaStats(activeFilters);
  const [searchParams] = useSearchParams();
  const [animatedElements, setAnimatedElements] = useState<boolean>(false);
  
  // Refetch data when filters change
  useEffect(() => {
    refetch();
  }, [activeFilters, refetch]);
  
  // Initial animation on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedElements(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Get district name from filter
  const getDistrictName = () => {
    const district = activeFilters.district;
    return district === 'all' ? 'All Districts' : district;
  };
  
  return (
    <SidebarWrapper>
      <section id="overview" className={`transition-all duration-500 ${isFiltered ? 'bg-muted/20' : ''}`}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Dashboard Overview</h2>
            {isFiltered && (
              <p className="text-sm text-muted-foreground animate-fade-in">
                Showing data for {getDistrictName()}
                {activeFilters.crimeCategory !== 'Total Cognizable Crime' ? ` • ${activeFilters.crimeCategory}` : ''}
                {activeFilters.crimeType !== 'all' ? ` • ${activeFilters.crimeType}` : ''}
                {activeFilters.year !== 'all' ? ` • Year ${activeFilters.year}` : ''}
              </p>
            )}
          </div>
        </div>
        
        <DashboardFilters />
        
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 shimmer">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[120px] w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            Failed to load dashboard data. Please try again.
          </div>
        ) : (
          <div className={animatedElements ? 'animate-fade-in' : ''}>
            <StatsCardGrid />
          </div>
        )}
        
        {activeFilters.district !== 'all' && (
          <div className="mt-6 animate-fade-in">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-crime-high" />
                  District Focus - {getDistrictName()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SafetyFocusZone 
                    title="Urban Areas" 
                    description="Higher crime density in urban centers with increased police patrols deployed." 
                  />
                  <SafetyFocusZone 
                    title="Transport Corridors" 
                    description="Highway crime monitoring with specialized units for inter-district coordination." 
                    className="bg-crime-high/5 border-crime-high/20"
                  />
                  <SafetyFocusZone 
                    title="Commercial Zones" 
                    description="Enhanced surveillance in business districts and markets during peak hours." 
                  />
                  <SafetyFocusZone 
                    title="Community Programs" 
                    description="Village-level crime prevention initiatives showing positive results." 
                    className="bg-green-50 border-green-200"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <div className="mt-8 space-y-8">
          <section id="crime-map">
            <h2 className="text-xl font-bold mb-4">Telangana Crime Map</h2>
            <div className="glass-card p-1 rounded-xl shadow-sm overflow-hidden">
              <CrimeMap />
            </div>
          </section>
          
          <section id="crime-statistics" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-bold mb-4">District Rankings</h2>
              {isLoading ? (
                <Skeleton className="h-[400px] w-full shimmer" />
              ) : (
                <div className={`chart-container ${animatedElements ? 'animate-fade-in' : ''}`}>
                  <CrimeStatisticsChart />
                </div>
              )}
            </div>
            
            <div>
              <h2 className="text-xl font-bold mb-4">Year-on-Year Trends</h2>
              {isLoading ? (
                <Skeleton className="h-[400px] w-full shimmer" />
              ) : (
                <div className={`chart-container ${animatedElements ? 'animate-fade-in' : ''}`}>
                  <CrimeTrendsChart />
                </div>
              )}
            </div>
          </section>
        </div>
      </section>

      <footer className="mt-16 border-t pt-6 text-center text-sm text-muted-foreground">
        <p>Telangana Crime Dashboard - Official data from Telangana Police Department</p>
        <p className="mt-2">© 2025 Telangana State Police Analytics Division</p>
      </footer>
    </SidebarWrapper>
  );
};

export default Index;
