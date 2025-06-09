
import React from 'react';
import { SidebarWrapper } from '@/components/AppSidebar';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useFilters } from '@/contexts/FilterContext';
import { telanganaDataService } from '@/services/telanganaDataService';
import { useTelanganaStats } from '@/hooks/useDashboardData';

const CrimeTrends = () => {
  const { activeFilters } = useFilters();
  const { data: stats, isLoading } = useTelanganaStats(activeFilters);

  // Year-over-year comparison with variation data
  const yearComparison = React.useMemo(() => {
    if (!stats?.districtData) return [];
    
    const totalCrimes2021 = stats.totalIncidents;
    const avgVariation = stats.districtData.length > 0 
      ? stats.districtData.reduce((sum, d) => sum + d.percentVariationIn2021Over2020, 0) / stats.districtData.length
      : 0;
    
    // Calculate 2020 data by reversing the variation
    const totalCrimes2020 = avgVariation !== 0 
      ? Math.floor(totalCrimes2021 / (1 + avgVariation))
      : totalCrimes2021;

    return [
      { 
        year: '2020', 
        crimes: totalCrimes2020,
        variation: 0 
      },
      { 
        year: '2021', 
        crimes: totalCrimes2021,
        variation: (avgVariation * 100).toFixed(1)
      }
    ];
  }, [stats]);

  // District-wise variation trends
  const districtVariationTrends = React.useMemo(() => {
    if (!stats?.districtData) return [];
    
    const districtData = stats.districtData.reduce((acc, item) => {
      if (!acc[item.units]) {
        acc[item.units] = {
          name: item.units,
          crimes2021: 0,
          totalVariation: 0,
          count: 0
        };
      }
      acc[item.units].crimes2021 += item.crimes;
      acc[item.units].totalVariation += item.percentVariationIn2021Over2020;
      acc[item.units].count += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(districtData)
      .map((district: any) => {
        const avgVariation = district.totalVariation / district.count;
        const crimes2020 = Math.floor(district.crimes2021 / (1 + avgVariation));
        return {
          name: district.name,
          '2020': crimes2020,
          '2021': district.crimes2021,
          variation: (avgVariation * 100).toFixed(1)
        };
      })
      .sort((a, b) => b['2021'] - a['2021'])
      .slice(0, 8); // Top 8 districts
  }, [stats]);

  // Crime category trends (if multiple categories available)
  const categoryTrends = React.useMemo(() => {
    if (!stats?.districtData) return [];
    
    const categoryData = stats.districtData.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = {
          category: item.category,
          totalCrimes: 0,
          avgVariation: 0,
          count: 0
        };
      }
      acc[item.category].totalCrimes += item.crimes;
      acc[item.category].avgVariation += item.percentVariationIn2021Over2020;
      acc[item.category].count += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(categoryData).map((cat: any) => ({
      name: cat.category,
      incidents: cat.totalCrimes,
      variation: (cat.avgVariation / cat.count * 100).toFixed(1)
    }));
  }, [stats]);

  if (isLoading) {
    return (
      <SidebarWrapper>
        <div className="container py-6">
          <h1 className="text-2xl font-bold mb-6">Crime Trend Analysis</h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="h-[350px] bg-gray-100 rounded" />
              </Card>
            ))}
          </div>
        </div>
      </SidebarWrapper>
    );
  }

  return (
    <SidebarWrapper>
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Crime Trend Analysis</h1>
        
        <p className="text-muted-foreground mb-8">
          This page provides detailed trend analysis of crime patterns based on real Telangana data.
          Year-over-year variations and district comparisons help identify crime patterns and trends.
          {activeFilters.crimeCategory !== 'all' && ` Filtered by: ${activeFilters.crimeCategory}`}
          {activeFilters.district !== 'all' && ` • District: ${activeFilters.district}`}
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="ring-1 ring-black/30 rounded-t-2xl">
              <CardHeader>
                <CardTitle>Year-over-Year Crime Totals</CardTitle>
                <CardDescription>
                  Total incidents comparison with variation percentage
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={yearComparison}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'crimes') return [value, 'Total Crimes'];
                        return [value, name];
                      }}
                      labelFormatter={(label, payload) => {
                        const data = payload?.[0]?.payload;
                        return `${label}${data?.variation ? ` (${data.variation}% variation)` : ''}`;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="crimes" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      name="crimes"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </div>
          </Card>

          <Card>
          <div className="ring-1 ring-black/30 rounded-t-2xl">
              <CardHeader>
                <CardTitle>Crime Category Analysis</CardTitle>
                <CardDescription>Incidents by category with variation data</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryTrends}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'incidents') return [value, 'Total Incidents'];
                        return [value, name];
                      }}
                      labelFormatter={(label, payload) => {
                        const data = payload?.[0]?.payload;
                        return `${label}${data?.variation ? ` (${data.variation}% variation)` : ''}`;
                      }}
                    />
                    <Legend />
                    <Bar dataKey="incidents" fill="#ffc658" name="incidents" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </div>
          </Card>
          
          <Card className="lg:col-span-2 ring-1 ring-black/30 rounded-t-2xl">
            <CardHeader>
              <CardTitle>District-wise Trend Comparison (2020 vs 2021)</CardTitle>
              <CardDescription>Top districts showing year-over-year crime changes</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={districtVariationTrends}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [value, name === '2020' ? '2020 Crimes' : '2021 Crimes']}
                    labelFormatter={(label, payload) => {
                      const data = payload?.[0]?.payload;
                      return `${label}${data?.variation ? ` (${data.variation}% variation)` : ''}`;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="2020" fill="#82ca9d" name="2020" />
                  <Bar dataKey="2021" fill="#8884d8" name="2021" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarWrapper>
  );
};

export default CrimeTrends;
