
import { supabase } from "@/integrations/supabase/client";
import { FilterState } from '@/contexts/FilterContext';

export interface DashboardStatistics {
  totalCrimes: number;
  monthlyChange: number;
  hotspots: number;
  safeAreas: number;
  crimesByType: { name: string; value: number }[];
  crimesByArea: { name: string; value: number }[];
  trendsByMonth: {
    name: string;
    theft: number;
    assault: number;
    fraud: number;
  }[];
}

export const dashboardService = {
  getDashboardStatistics: async (
    filters: FilterState
  ): Promise<DashboardStatistics> => {
    console.log('Fetching dashboard statistics with filters:', filters);
    
    // This would be replaced with actual API calls to Supabase
    // For now, return mock data with some adjustments based on filters
    
    let totalCrimes = 1247;
    let monthlyChange = 3.2;
    
    // Adjust data based on year
    switch (filters.year) {
      case '2020':
        totalCrimes = 1100;
        monthlyChange = 1.5;
        break;
      case '2021':
        totalCrimes = 1247;
        monthlyChange = 3.2;
        break;
      default:
        totalCrimes = 1247;
        monthlyChange = 3.2;
    }
    
    // Adjust data if a specific district is selected
    if (filters.district !== 'all') {
      totalCrimes = Math.floor(totalCrimes * 0.4); // Show only crimes for that district
    }
    
    // Adjust data if a specific crime type is selected
    if (filters.crimeType !== 'all') {
      totalCrimes = Math.floor(totalCrimes * 0.3); // Show only crimes of that type
    }
    
    // Adjust data based on crime category
    if (filters.crimeCategory !== 'Total Cognizable Crime') {
      totalCrimes = Math.floor(totalCrimes * 0.25); // Show only crimes of that category
    }
    
    return {
      totalCrimes,
      monthlyChange,
      hotspots: filters.district !== 'all' ? 2 : 7,
      safeAreas: filters.district !== 'all' ? 4 : 12,
      crimesByType: [
        { name: 'Theft', value: 42 },
        { name: 'Assault', value: 28 },
        { name: 'Fraud', value: 15 },
        { name: 'Other', value: 15 },
      ],
      crimesByArea: [
        { name: 'Downtown', value: 35 },
        { name: 'Suburban', value: 28 },
        { name: 'Industrial', value: 20 },
        { name: 'Rural', value: 17 },
      ],
      trendsByMonth: [
        {
          name: 'Jan',
          theft: 65,
          assault: 28,
          fraud: 23,
        },
        {
          name: 'Feb',
          theft: 59,
          assault: 32,
          fraud: 25,
        },
        {
          name: 'Mar',
          theft: 80,
          assault: 27,
          fraud: 29,
        },
        {
          name: 'Apr',
          theft: 81,
          assault: 30,
          fraud: 20,
        },
        {
          name: 'May',
          theft: 56,
          assault: 36,
          fraud: 22,
        },
        {
          name: 'Jun',
          theft: 55,
          assault: 34,
          fraud: 28,
        },
      ],
    };
  },
};
