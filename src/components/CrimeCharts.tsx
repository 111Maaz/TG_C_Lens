
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { useFilters } from '@/contexts/FilterContext';
import { telanganaDataService } from '@/services/telanganaDataService';
import { useTelanganaStats } from '@/hooks/useDashboardData';

export const CrimeStatisticsChart: React.FC = () => {
  const { activeFilters } = useFilters();
  const { data: stats } = useTelanganaStats(activeFilters);
  
  // Get top 10 districts data
  const top10Districts = React.useMemo(() => {
    return telanganaDataService.getTop10Districts(activeFilters);
  }, [activeFilters]);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Crime Statistics</CardTitle>
        <CardDescription>
          Top 10 districts by {activeFilters.crimeCategory.toLowerCase()} incidents in {activeFilters.year}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={top10Districts}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 70
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="district" 
                angle={-45} 
                textAnchor="end" 
                height={70}
                interval={0}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="crimes" 
                name={activeFilters.crimeCategory} 
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export const CrimeTrendsChart: React.FC = () => {
  const { activeFilters } = useFilters();
  
  // Get year comparison data
  const yearComparison = React.useMemo(() => {
    return telanganaDataService.getYearComparison(activeFilters);
  }, [activeFilters]);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Crime Trends</CardTitle>
        <CardDescription>
          {activeFilters.crimeCategory} comparison between 2020 and 2021
          {activeFilters.district !== 'all' ? ` in ${activeFilters.district}` : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={yearComparison}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar 
              dataKey="incidents" 
              name="Incidents" 
              fill="#10B981"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
