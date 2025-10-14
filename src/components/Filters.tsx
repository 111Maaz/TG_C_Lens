import React, { useEffect } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFilters } from '@/contexts/FilterContext';
import { toast } from '@/components/ui/use-toast';
import { useSearchParams } from 'react-router-dom';
import { Filter, RefreshCw, HelpCircle } from 'lucide-react';
import { useDistrictData } from '@/hooks/useDashboardData';
import { telanganaDataService } from '@/services/telanganaDataService';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const DashboardFilters: React.FC = () => {
  const { 
    filters, 
    setFilters, 
    applyFilters, 
    isFiltered, 
    resetFilters,
    districts,
    crimeTypes,
    setDistricts,
    setCrimeTypes
  } = useFilters();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: districtData } = useDistrictData();
  const [categories, setCategories] = React.useState<string[]>([]);
  const [years, setYears] = React.useState<string[]>([]);

  // Load dynamic options from CSV
  useEffect(() => {
    const loadOptions = async () => {
      await telanganaDataService.loadCSVData();
      
      // Get districts
      const csvDistricts = telanganaDataService.getDistricts();
      setDistricts(csvDistricts);
      
      // Get categories
      const csvCategories = telanganaDataService.getCrimeCategories();
      setCategories(csvCategories);
      
      // Get years
      const csvYears = telanganaDataService.getYears();
      setYears(csvYears);
    };
    
    loadOptions();
  }, [setDistricts]);

  // Update crime types when category changes
  useEffect(() => {
    if (filters.crimeCategory !== 'all') {
      const newCrimeTypes = telanganaDataService.getCrimeTypesByCategory(filters.crimeCategory);
      setCrimeTypes(newCrimeTypes);
      
      // Reset crime type to 'all' when category changes
      if (filters.crimeType !== 'all' && !newCrimeTypes.includes(filters.crimeType)) {
        setFilters(prev => ({ ...prev, crimeType: 'all' }));
      }
    }
  }, [filters.crimeCategory, setCrimeTypes, setFilters, filters.crimeType]);

  // Apply URL parameters as filters on mount
  useEffect(() => {
    const urlParams = Object.fromEntries([...searchParams]);
    const newFilters = { ...filters };
    let hasChanges = false;

    if (urlParams.year && years.includes(urlParams.year)) {
      newFilters.year = urlParams.year;
      hasChanges = true;
    }

    if (urlParams.district) {
      newFilters.district = urlParams.district;
      hasChanges = true;
    }

    if (urlParams.crimeCategory) {
      newFilters.crimeCategory = urlParams.crimeCategory;
      hasChanges = true;
    }

    if (urlParams.crimeType) {
      newFilters.crimeType = urlParams.crimeType;
      hasChanges = true;
    }

    if (hasChanges) {
      setFilters(newFilters);
      setTimeout(() => applyFilters(), 100);
    }
  }, [years]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    // Update URL with filters for shareable links
    const params = new URLSearchParams();
    if (filters.year !== 'all') params.set('year', filters.year);
    if (filters.district !== 'all') params.set('district', filters.district);
    if (filters.crimeCategory !== 'all') params.set('crimeCategory', filters.crimeCategory);
    if (filters.crimeType !== 'all') params.set('crimeType', filters.crimeType);
    setSearchParams(params);
    
    // Add animation to show filter application
    const filterCard = document.querySelector('.filter-card');
    filterCard?.classList.add('animate-pulse');
    setTimeout(() => filterCard?.classList.remove('animate-pulse'), 500);
    
    applyFilters();
  };
  
  const handleResetFilters = () => {
    setSearchParams({});
    resetFilters();
  };

  return (
    <Card className="mb-6 filter-card transition-all duration-300 glass-card hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[150px]">
            <div className="flex items-center gap-2 mb-1">
              <label htmlFor="year" className="block text-sm font-medium">Year</label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select a specific year to view crime data for that period</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select 
              value={filters.year} 
              onValueChange={(value) => handleFilterChange('year', value)}
            >
              <SelectTrigger id="year" className="hover:border-primary transition-colors">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent className="animate-fade-in bg-background z-50">
                <SelectItem value="all">All Years</SelectItem>
                {years.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1 min-w-[180px]">
            <div className="flex items-center gap-2 mb-1">
              <label htmlFor="district" className="block text-sm font-medium">District</label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Filter crime data by specific districts in Telangana</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select 
              value={filters.district}
              onValueChange={(value) => handleFilterChange('district', value)}
            >
              <SelectTrigger id="district" className="hover:border-primary transition-colors">
                <SelectValue placeholder="Select district" />
              </SelectTrigger>
              <SelectContent className="animate-fade-in bg-background z-50 max-h-60">
                <SelectItem value="all">All Districts</SelectItem>
                {districts.map(district => (
                  <SelectItem key={district} value={district}>{district}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1 min-w-[180px]">
            <div className="flex items-center gap-2 mb-1">
              <label htmlFor="crime-category" className="block text-sm font-medium">Crime Category</label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select a broad category of crimes to analyze</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select 
              value={filters.crimeCategory}
              onValueChange={(value) => handleFilterChange('crimeCategory', value)}
            >
              <SelectTrigger id="crime-category" className="hover:border-primary transition-colors">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="animate-fade-in bg-background z-50">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1 min-w-[180px]">
            <div className="flex items-center gap-2 mb-1">
              <label htmlFor="crime-type" className="block text-sm font-medium">Crime Type</label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select specific types of crimes within the chosen category</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select 
              value={filters.crimeType}
              onValueChange={(value) => handleFilterChange('crimeType', value)}
            >
              <SelectTrigger id="crime-type" className="hover:border-primary transition-colors">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="animate-fade-in bg-background z-50">
                <SelectItem value="all">All Types</SelectItem>
                {crimeTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end h-[68px] gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={handleApplyFilters} 
                    className={`${isFiltered ? 'bg-accent hover:bg-accent/90' : 'bg-primary'} transition-colors duration-300 hover:shadow-md flex items-center gap-2`}
                  >
                    <Filter className="h-4 w-4" />
                    Apply Filters
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Apply selected filters to update the dashboard data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {isFiltered && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={handleResetFilters} 
                      variant="outline"
                      className="transition-colors duration-300 hover:bg-destructive/10"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Clear all filters and return to default view</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
