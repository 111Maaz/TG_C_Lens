
import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { toast } from 'sonner';
import { crimeDataService } from '@/services/crimeDataService';

export interface CrimeData {
  id: number;
  type: string;
  location: string;
  date: string;
  time: string;
  description: string;
  address: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'closed';
  imageUrl?: string;
  reportedBy?: string | null;
  reporterEmail?: string | null;
  reporterName?: string | null;
  coordinates: [number, number];
}

export interface CrimeDataResponse {
  data: CrimeData[];
  error?: string;
}

export interface SingleCrimeResponse {
  data: CrimeData | null;
  error?: string;
}

export interface ImageUploadResponse {
  url: string;
  error?: string;
}

export const useCrimeData = (filters?: Record<string, any>): UseQueryResult<CrimeDataResponse> => {
  return useQuery({
    queryKey: ['crimes', filters],
    queryFn: () => crimeDataService.getCrimes(filters),
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useCrimeDetail = (id: string | undefined): UseQueryResult<SingleCrimeResponse> => {
  return useQuery({
    queryKey: ['crime', id],
    queryFn: () => (id ? crimeDataService.getCrimeById(id) : Promise.reject('No ID provided')),
    enabled: !!id,
  });
};

export const useCreateCrime = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (crimeData: Omit<CrimeData, 'id'>) => {
      // Fixed: Don't check for 'resolved' status as it's not in the allowed types
      return crimeDataService.createCrime(crimeData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crimes'] });
      toast.success('Crime report created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create crime report: ${error.message}`);
    },
  });
};

export const useUpdateCrime = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CrimeData> }) => {
      // Fixed: Don't check for 'resolved' status as it's not in the allowed types
      return crimeDataService.updateCrime(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['crimes'] });
      queryClient.invalidateQueries({ queryKey: ['crime', String(variables.id)] });
      toast.success('Crime report updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update crime report: ${error.message}`);
    },
  });
};

export const useDeleteCrime = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => crimeDataService.deleteCrime(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['crimes'] });
      queryClient.invalidateQueries({ queryKey: ['crime', String(id)] });
      toast.success('Crime report deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete crime report: ${error.message}`);
    },
  });
};

// Add the image upload hook
export const useImageUpload = () => {
  return useMutation({
    mutationFn: (file: File) => crimeDataService.uploadImage(file),
    onSuccess: () => {
      toast.success('Image uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to upload image: ${error.message}`);
    },
  });
};
