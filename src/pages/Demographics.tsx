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
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell,
  Line,
  ComposedChart
} from 'recharts';
import { useFilters } from '@/contexts/FilterContext';
import { telanganaDataService } from '@/services/telanganaDataService';
import { useTelanganaStats } from '@/hooks/useDashboardData';

// Helper function to calculate trend line
const calculateTrendLine = (data: any[]) => {
  const n = data.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  data.forEach(point => {
    sumX += point.population;
    sumY += point.crimeRate;
    sumXY += point.population * point.crimeRate;
    sumXX += point.population * point.population;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const minX = Math.min(...data.map(d => d.population));
  const maxX = Math.max(...data.map(d => d.population));

  return [
    { population: minX, crimeRate: slope * minX + intercept },
    { population: maxX, crimeRate: slope * maxX + intercept }
  ];
};

const Demographics = () => {
  const { activeFilters } = useFilters();
  const { data: stats, isLoading } = useTelanganaStats(activeFilters);

  // Population vs Crime Rate Correlation (Scatter plot with trend line)
  const populationCrimeCorrelation = React.useMemo(() => {
    if (!stats?.districtData) return { scatterData: [], trendLine: [] };
    
    const districtSummary = stats.districtData.reduce((acc, item) => {
      if (!acc[item.units]) {
        acc[item.units] = {
          district: item.units,
          population: item.populationInLakhs,
          crimeRate: item.crimeRateFor2021,
          totalCrimes: 0,
          avgVariation: 0,
          count: 0
        };
      }
      acc[item.units].totalCrimes += item.crimes;
      acc[item.units].avgVariation += item.percentVariationIn2021Over2020;
      acc[item.units].count += 1;
      return acc;
    }, {} as Record<string, any>);

    const scatterData = Object.values(districtSummary)
      .map((district: any) => ({
        ...district,
        avgVariation: district.avgVariation / district.count
      }))
      .sort((a, b) => a.population - b.population); // Sort by population

    const trendLine = calculateTrendLine(scatterData);

    return { scatterData, trendLine };
  }, [stats]);

  // Crime distribution by district (replacing age distribution)
  const crimeDistribution = React.useMemo(() => {
    if (!stats?.districtData) return [];
    
    const districtCrimes = stats.districtData.reduce((acc, item) => {
      if (!acc[item.units]) {
        acc[item.units] = 0;
      }
      acc[item.units] += item.crimes;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(districtCrimes)
      .map(([district, crimes]) => ({ name: district, value: crimes }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 districts
  }, [stats]);

  // Year-over-year variation analysis (replacing gender distribution)
  const variationAnalysis = React.useMemo(() => {
    if (!stats?.districtData) return [];
    
    const avgVariationByDistrict = stats.districtData.reduce((acc, item) => {
      if (!acc[item.units]) {
        acc[item.units] = { sum: 0, count: 0 };
      }
      acc[item.units].sum += item.percentVariationIn2021Over2020;
      acc[item.units].count += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(avgVariationByDistrict)
      .map(([district, data]) => ({
        name: district,
        value: (data.sum / data.count * 100) // Convert to percentage
      }))
      .filter(item => Math.abs(item.value) > 1) // Only show significant variations
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
      .slice(0, 6);
  }, [stats]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28AE8', '#FF6B6B'];

  if (isLoading) {
    return (
      <SidebarWrapper>
        <div className="container py-6">
          <h1 className="text-2xl font-bold mb-6">Demographic Analysis</h1>
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
        <h1 className="text-2xl font-bold mb-6">Demographic Analysis</h1>
        
        <p className="text-muted-foreground mb-8">
          This section provides demographic data related to crime incidents, including population correlation, 
          district distribution, and year-over-year variation analysis based on real Telangana crime data.
          {activeFilters.crimeCategory !== 'all' && ` Filtered by: ${activeFilters.crimeCategory}`}
          {activeFilters.district !== 'all' && ` • District: ${activeFilters.district}`}
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Population vs Crime Rate Correlation</CardTitle>
              <CardDescription>
                Bubble size represents total crime incidents. Line shows the trend.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={populationCrimeCorrelation.scatterData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="population" 
                    name="Population (Lakhs)"
                    label={{ value: 'Population (Lakhs)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    dataKey="crimeRate" 
                    name="Crime Rate 2021"
                    label={{ value: 'Crime Rate 2021', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value, name, props) => {
                      if (name === 'totalCrimes') return [value, 'Total Crimes'];
                      if (name === 'population') return [value, 'Population (Lakhs)'];
                      if (name === 'crimeRate') return [value, 'Crime Rate'];
                      return [value, name];
                    }}
                    labelFormatter={(value, payload) => {
                      return payload?.[0]?.payload?.district || 'District';
                    }}
                  />
                  <Legend />
                  <Scatter 
                    data={populationCrimeCorrelation.scatterData}
                    dataKey="totalCrimes"
                    fill="#8884d8"
                    name="District Data"
                  >
                    {populationCrimeCorrelation.scatterData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={entry.avgVariation >= 0 ? '#FF6B6B' : '#4ECDC4'}
                      />
                    ))}
                  </Scatter>
                  <Line
                    data={populationCrimeCorrelation.trendLine}
                    type="linear"
                    dataKey="crimeRate"
                    stroke="#ff7300"
                    strokeWidth={2}
                    dot={false}
                    name="Trend Line"
                    activeDot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Crime Distribution by District</CardTitle>
              <CardDescription>Top districts by total incidents</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={crimeDistribution}
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
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Total Incidents">
                    {crimeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Year-over-Year Variation Analysis</CardTitle>
              <CardDescription>Districts with significant crime variation (2021 vs 2020)</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={variationAnalysis}
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
                    formatter={(value) => {
                      const numValue = typeof value === 'number' ? value : parseFloat(value as string);
                      return [`${numValue.toFixed(1)}%`, 'Variation'];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="value" name="Variation %">
                    {variationAnalysis.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.value >= 0 ? '#FF6B6B' : '#00C49F'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarWrapper>
  );
};

export default Demographics;
