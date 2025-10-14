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

  // Year-over-year comparison with variation data (DYNAMIC for all years)
  const yearComparison = React.useMemo(() => {
    if (!stats?.districtData) return [];
    // Aggregate total crimes for each year
    const crimesByYear: Record<string, number> = {};
    stats.districtData.forEach((d) => {
      const year = d.year.toString();
      crimesByYear[year] = (crimesByYear[year] || 0) + d.crimes;
    });
    // Sort years numerically
    const sortedYears = Object.keys(crimesByYear).sort((a, b) => Number(a) - Number(b));
    // Optionally, calculate year-on-year variation
    let prevCrimes: number | null = null;
    return sortedYears.map((yearStr) => {
      const year = Number(yearStr);
      const crimes = Number(crimesByYear[yearStr]);
      let variation: string | undefined = undefined;
      if (prevCrimes !== null && prevCrimes > 0) {
        variation = (((crimes - prevCrimes) / prevCrimes) * 100).toFixed(1);
      }
      const result = {
        year: yearStr,
        crimes,
        variation,
      };
      prevCrimes = crimes;
      return result;
    });
  }, [stats]);

  // District-wise variation trends (DYNAMIC for all years)
  const districtVariationTrends = React.useMemo(() => {
    if (!stats?.districtData) return [];
    // Get all years present in the data
    const allYears = Array.from(new Set(stats.districtData.map(d => d.year))).sort((a, b) => a - b);
    // Aggregate crimes by district and year
    const districtYearMap: Record<string, Record<number, number>> = {};
    stats.districtData.forEach((item) => {
      if (!districtYearMap[item.units]) districtYearMap[item.units] = {};
      districtYearMap[item.units][item.year] = (districtYearMap[item.units][item.year] || 0) + item.crimes;
    });
    // Build the data array for the chart
    const data = Object.entries(districtYearMap).map(([district, yearMap]) => {
      const row: Record<string, any> = { name: district };
      allYears.forEach(year => {
        row[year] = yearMap[year] || 0;
      });
      return row;
    });
    // Sort by the latest year
    const latestYear = allYears[allYears.length - 1];
    return data.sort((a, b) => b[latestYear] - a[latestYear]).slice(0, 8); // Top 8 districts
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
      acc[item.category].avgVariation += item.percentVariationFromPreviousYear;
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
                  <Tooltip />
                  <Legend />
                  {Array.from(new Set(stats?.districtData?.map(d => d.year))).sort((a, b) => a - b).map((year, idx) => (
                    <Bar key={year} dataKey={year.toString()} name={year.toString()} fill={['#82ca9d', '#8884d8', '#ffc658', '#ff7300'][idx % 4]} />
                  ))}
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
