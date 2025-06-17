import React, { useEffect, useState } from 'react';
import { SidebarWrapper } from '@/components/AppSidebar';
import { StatsCardGrid } from '@/components/StatsCards';
import { CrimeMap } from '@/components/CrimeMap';
import { CrimeStatisticsChart, CrimeTrendsChart } from '@/components/CrimeCharts';
import { DashboardFilters } from '@/components/Filters';
import { EmergencyNumbers } from '@/components/EmergencyNumbers';
import { MapPin, Shield, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useTelanganaStats } from '@/hooks/useDashboardData';
import { useFilters } from '@/contexts/FilterContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UnifiedFooter } from '@/components/UnifiedFooter';

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
  
  useEffect(() => {
    refetch();
  }, [activeFilters, refetch]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedElements(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  const getDistrictName = () => {
    const district = activeFilters.district;
    return district === 'all' ? 'All Districts' : district;
  };
  
  return (
    <SidebarWrapper>
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
        <section id="overview" className={`
          transition-all duration-500 ease-out
          ${isFiltered ? 'bg-muted/20' : ''}
          relative overflow-hidden
        `}>
          {/* Background pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

          <div className="container mx-auto px-4 py-8 relative">
            {/* <div className="flex justify-between items-center mb-8 transform hover:scale-[1.01] transition-transform"> */}
              {/* <div className="backdrop-blur-sm bg-white/5 p-4 rounded-2xl border border-white/10 shadow-xl ring-1 ring-black/30 rounded-t-2xl"> */}
                {/* <h2 className="text-2xl font-bold text-foreground">Dashboard Overview</h2> */}
                {isFiltered && (
                  <p className="text-sm text-muted-foreground animate-fade-in mt-2">
                    Showing data for {getDistrictName()}
                    {activeFilters.crimeCategory !== 'Total Cognizable Crime' ? ` • ${activeFilters.crimeCategory}` : ''}
                    {activeFilters.crimeType !== 'all' ? ` • ${activeFilters.crimeType}` : ''}
                    {activeFilters.year !== 'all' ? ` • Year ${activeFilters.year}` : ''}
                  </p>
                )}
              {/* </div> */}
            {/* </div> */}
            
            <div className="relative mb-8 transform hover:scale-[1.01] transition-transform">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl blur-xl"></div>
              {/* <div className="relative backdrop-blur-sm bg-white/5 p-4 rounded-2xl border border-white/10 shadow-xl"> */}
              <div className="relative backdrop-blur-sm bg-white/5 p-4 rounded-2xl ring-1 ring-black/30 shadow-md">
                <DashboardFilters />
              </div>

            </div>
            
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl blur-xl 
                                  group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300"></div>
                    <Skeleton className="h-[120px] w-full relative backdrop-blur-sm bg-white/5 rounded-2xl border border-white/10" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="relative group transform hover:scale-[1.01] transition-transform">
                <div className="absolute inset-0 bg-gradient-to-r from-destructive/20 to-destructive/10 rounded-2xl blur-xl"></div>
                <div className="relative backdrop-blur-sm bg-destructive/10 p-4 rounded-2xl border border-destructive/20 shadow-xl text-destructive">
                  Failed to load dashboard data. Please try again.
                </div>
              </div>
            ) : (
              <div className={`relative group transform hover:scale-[1.01] transition-transform ${animatedElements ? 'animate-fade-in' : ''}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl blur-xl 
                              group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300"></div>
                <div className="relative">
                  <StatsCardGrid />
                </div>
              </div>
            )}
            
            {activeFilters.district !== 'all' && (
              <div className="mt-8 animate-fade-in">
                <Card className="relative group transform hover:scale-[1.01] transition-transform overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl 
                                group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all duration-300"></div>
                  <CardHeader className="relative backdrop-blur-sm bg-white/5 border-b border-white/10">
                    <CardTitle className="flex items-center text-xl">
                      <AlertCircle className="h-5 w-5 mr-2 text-primary animate-pulse" />
                      District Focus - {getDistrictName()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative backdrop-blur-sm bg-white/5 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <SafetyFocusZone 
                        title="Urban Areas" 
                        description="Higher crime density in urban centers with increased police patrols deployed." 
                      />
                      <SafetyFocusZone 
                        title="Transport Corridors" 
                        description="Highway crime monitoring with specialized units for inter-district coordination." 
                        className="bg-primary/5 border-primary/20"
                      />
                      <SafetyFocusZone 
                        title="Commercial Zones" 
                        description="Enhanced surveillance in business districts and markets during peak hours." 
                      />
                      <SafetyFocusZone 
                        title="Community Programs" 
                        description="Village-level crime prevention initiatives showing positive results." 
                        className="bg-green-500/5 border-green-500/20"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            <div className="mt-12 space-y-12">
              <section id="crime-map" className="relative group transform hover:scale-[1.01] transition-transform">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl blur-xl 
                              group-hover:from-cyan-500/20 group-hover:to-blue-500/20 transition-all duration-300"></div>
                <div className="relative backdrop-blur-sm bg-white/5 p-6 rounded-2xl border border-white/10 shadow-xl ring-1 ring-black/30 rounded-t-2xl">
                  <div className="glass-card overflow-hidden rounded-xl shadow-lg">
                    <CrimeMap />
                  </div>
                </div>
              </section>
              
              <section id="crime-statistics" className="grid grid-cols-1 md:grid-cols-2 gap-8">
  <div className="relative group transform hover:scale-[1.01] transition-transform">
    {/* Gradient Background Blur */}
    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl 
                    group-hover:from-purple-500/20 group-hover:to-pink-500/20 transition-all duration-300"></div>
    
    {/* Chart Card with new styling */}
    <div className="relative backdrop-blur-sm bg-white/5 p-6 rounded-2xl ring-1 ring-black/30 shadow-md">
      <h2 className="text-xl font-bold mb-4 text-purple-800">District Rankings</h2>
      {isLoading ? (
        <Skeleton className="h-[400px] w-full rounded-xl" />
      ) : (
        <div className={`chart-container rounded-xl overflow-hidden ${animatedElements ? 'animate-fade-in' : ''}`}>
          <CrimeStatisticsChart />
        </div>
      )}
    </div>
  </div>

  <div className="relative group transform hover:scale-[1.01] transition-transform">
    {/* Gradient Background Blur */}
    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl blur-xl 
                    group-hover:from-emerald-500/20 group-hover:to-teal-500/20 transition-all duration-300"></div>
    
    {/* Chart Card with new styling */}
    <div className="relative backdrop-blur-sm bg-white/5 p-6 rounded-2xl ring-1 ring-black/30 shadow-md">
      <h2 className="text-xl font-bold mb-4 text-emerald-800">Year-on-Year Trends</h2>
      {isLoading ? (
        <Skeleton className="h-[400px] w-full rounded-xl" />
      ) : (
        <div className={`chart-container rounded-xl overflow-hidden ${animatedElements ? 'animate-fade-in' : ''}`}>
          <CrimeTrendsChart />
        </div>
      )}
    </div>
  </div>
</section>

            </div>
          </div>
        </section>

        <UnifiedFooter />
      </div>
    </SidebarWrapper>
  );
};

export default Index;
