
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/components/ui/use-toast';

export interface FilterState {
  year: string;
  district: string;
  crimeCategory: string;
  crimeType: string;
}

interface FilterContextType {
  filters: FilterState;
  activeFilters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  applyFilters: () => void;
  isFiltered: boolean;
  resetFilters: () => void;
  districts: string[];
  crimeTypes: string[];
  setDistricts: React.Dispatch<React.SetStateAction<string[]>>;
  setCrimeTypes: React.Dispatch<React.SetStateAction<string[]>>;
}

const defaultFilterState: FilterState = {
  year: 'all',
  district: 'all',
  crimeCategory: 'all',
  crimeType: 'all',
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};

export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<FilterState>(defaultFilterState);
  const [activeFilters, setActiveFilters] = useState<FilterState>(defaultFilterState);
  const [isFiltered, setIsFiltered] = useState(false);
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false);
  const [districts, setDistricts] = useState<string[]>([]);
  const [crimeTypes, setCrimeTypes] = useState<string[]>([]);

  // Apply the current filter selections
  const applyFilters = () => {
    // Add visual effect to show filters being applied
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.classList.add('animate-pulse');
      setTimeout(() => {
        mainContent.classList.remove('animate-pulse');
      }, 500);
    }
    
    setActiveFilters({ ...filters });
    setIsFiltered(
      filters.year !== defaultFilterState.year ||
      filters.district !== defaultFilterState.district ||
      filters.crimeCategory !== defaultFilterState.crimeCategory ||
      filters.crimeType !== defaultFilterState.crimeType
    );
    
    toast({
      title: "Filters applied",
      description: "Dashboard has been updated with your filter selections.",
    });
    
    setHasAppliedFilters(true);
    console.log('Filters applied:', filters);
  };
  
  // Reset filters to default
  const resetFilters = () => {
    setFilters(defaultFilterState);
    setActiveFilters(defaultFilterState);
    setIsFiltered(false);
    
    toast({
      title: "Filters reset",
      description: "All filters have been reset to default values.",
    });
  };
  
  // Visual effect when filters change state
  useEffect(() => {
    if (hasAppliedFilters) {
      const statsElements = document.querySelectorAll('.stats-card');
      statsElements.forEach((el) => {
        el.classList.add('animate-scale-in');
        setTimeout(() => {
          el.classList.remove('animate-scale-in');
        }, 500);
      });
    }
  }, [activeFilters, hasAppliedFilters]);

  return (
    <FilterContext.Provider value={{ 
      filters, 
      setFilters, 
      activeFilters, 
      applyFilters, 
      isFiltered,
      resetFilters,
      districts,
      crimeTypes,
      setDistricts,
      setCrimeTypes
    }}>
      {children}
    </FilterContext.Provider>
  );
};
