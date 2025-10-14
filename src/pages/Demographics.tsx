import React, { useState, useMemo } from 'react';
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
import { Button } from '@/components/ui/button';

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
  const { data: stats, isLoading } = useTelanganaStats({ year: 'all', district: 'all', crimeCategory: 'all', crimeType: 'all' });
  const [correlationYear, setCorrelationYear] = useState(2021);

  // Population vs Crime Rate Correlation (Scatter plot with trend line)
  const populationCrimeCorrelation = useMemo(() => {
    if (!stats?.districtData) return { scatterData: [], trendLine: [] };
    // Filter data for the selected year only
    const yearData = stats.districtData.filter(item => item.year === correlationYear);
    const districtSummary = yearData.reduce((acc, item) => {
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
      acc[item.units].avgVariation += item.percentVariationFromPreviousYear;
      acc[item.units].count += 1;
      return acc;
    }, {} as Record<string, any>);
    const scatterData = Object.values(districtSummary)
      .map((district: any) => ({
        ...district,
        avgVariation: district.avgVariation / district.count
      }))
      .sort((a, b) => a.population - b.population);
    const trendLine = calculateTrendLine(scatterData);
    return { scatterData, trendLine };
  }, [stats, correlationYear]);

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

  // Updated variation analysis logic
  const variationAnalysis = React.useMemo(() => {
    if (!stats?.districtData) return [];
    const yearA = 2021;
    const yearB = 2020;
    // Filter for the two years
    const dataA = stats.districtData.filter(item => item.year === yearA);
    const dataB = stats.districtData.filter(item => item.year === yearB);
    // Sum crimes for each district for each year
    const sumCrimesByDistrict = (data) => {
      return data.reduce((acc, item) => {
        acc[item.units] = (acc[item.units] || 0) + item.crimes;
        return acc;
      }, {});
    };
    const crimesA = sumCrimesByDistrict(dataA);
    const crimesB = sumCrimesByDistrict(dataB);
    const allDistricts = Array.from(new Set([...Object.keys(crimesA), ...Object.keys(crimesB)]));
    const variations = allDistricts.map(district => {
      const a = crimesA[district] || 0;
      const b = crimesB[district] || 0;
      let value;
      if (b === 0 || b < 5) {
        value = null; // Mark as N/A if baseline is zero or too low
      } else {
        value = ((a - b) / b) * 100;
      }
      return { name: district, value };
    });
    // Sort by absolute variation and show all districts, skip N/A
    return variations
      .filter(item => item.value !== null && !isNaN(item.value))
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
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
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="lg:col-span-2 ring-1 ring-black/30 rounded-t-2xl">
            <CardHeader>
              <CardTitle>Population vs Crime Rate Correlation</CardTitle>
              <CardDescription>
                Bubble size represents total crime incidents. Line shows the trend.
              </CardDescription>
              <div className="flex gap-2 mt-2">
                {[2018, 2019, 2020, 2021].map(year => (
                  <Button
                    key={year}
                    size="sm"
                    variant={correlationYear === year ? 'default' : 'outline'}
                    onClick={() => setCorrelationYear(year)}
                  >
                    {year}
                  </Button>
                ))}
              </div>
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
                    name={`Crime Rate ${correlationYear}`}
                    label={{ value: `Crime Rate ${correlationYear}`, angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value, name, props) => {
                      if (name === 'totalCrimes') return [value, 'Total Crimes'];
                      if (name === 'population') return [value, 'Population (Lakhs)'];
                      if (name === 'crimeRate') return [value, `Crime Rate ${correlationYear}`];
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
          
          <Card className="lg:col-span-2 w-full ring-1 ring-black/30 rounded-t-2xl">
            <CardHeader>
              <CardTitle>Year-over-Year Variation Analysis</CardTitle>
              <CardDescription>
                Districts with significant crime variation
                <span className="ml-2 font-semibold text-primary">
                  (Currently showing: 2021 vs 2020)
                </span>
              </CardDescription>
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
                      if (value === null) return ['N/A', 'Variation'];
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
