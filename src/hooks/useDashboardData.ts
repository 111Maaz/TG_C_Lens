import { useQuery } from '@tanstack/react-query';
import { telanganaDataService } from '@/services/telanganaDataService';
import { toast } from '@/components/ui/use-toast';
import { FilterState } from '@/contexts/FilterContext';

export const useTelanganaStats = (filters: FilterState) => {
  return useQuery({
    queryKey: ['telanganaStats', filters],
    queryFn: async () => {
      await telanganaDataService.loadCSVData();
      return telanganaDataService.getFilteredData(filters);
    },
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Error loading Telangana statistics",
          description: error.message,
          variant: "destructive"
        });
      },
    },
  });
};

export const useDistrictData = () => {
  return useQuery({
    queryKey: ['districts'],
    queryFn: async () => {
      await telanganaDataService.loadCSVData();
      return telanganaDataService.getDistricts();
    },
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Error loading district data",
          description: error.message,
          variant: "destructive"
        });
      },
    },
  });
};

// Keep the old hook name for backward compatibility but use new service
export const useDashboardStats = (filters: FilterState) => {
  return useTelanganaStats(filters);
};
