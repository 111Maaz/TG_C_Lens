export interface TelanganaDistrictData {
  slNo: number;
  units: string; // District name
  populationInLakhs: number;
  crimeRateFor2021: number;
  category: string;
  crimeType: string;
  crimes: number;
  year: number;
  percentVariationIn2021Over2020: number;
}

export interface FilteredData {
  totalIncidents: number;
  detectionRate: number;
  convictionRate: number;
  pendingTrialCases: number;
  districtData: TelanganaDistrictData[];
}

class TelanganaDataService {
  private csvData: TelanganaDistrictData[] = [];

  async loadCSVData(): Promise<void> {
    try {
      const response = await fetch('/telangana-crime-data.csv');
      const csvText = await response.text();
      this.csvData = this.parseCSV(csvText);
      console.log('CSV data loaded:', this.csvData.length, 'records');
    } catch (error) {
      console.error('Failed to load CSV data:', error);
      // Fallback to mock data for development
      this.csvData = this.generateMockData();
    }
  }

  private parseCSV(csvText: string): TelanganaDistrictData[] {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1).map(line => {
      const values = line.split(',');
      return {
        slNo: parseInt(values[0]) || 0,
        units: values[1] || '',
        populationInLakhs: parseFloat(values[2]) || 0,
        crimeRateFor2021: parseFloat(values[3]) || 0,
        category: values[4] || '',
        crimeType: values[5] || '',
        crimes: parseInt(values[6]) || 0,
        year: parseInt(values[7]) || 2021,
        percentVariationIn2021Over2020: parseFloat(values[8]) || 0,
      };
    });
  }

  private generateMockData(): TelanganaDistrictData[] {
    const districts = [
      'Cyberabad', 'Hyderabad', 'Karimnagar', 'Khammam', 'Nizamabad', 
      'Rachakonda', 'Ramagundam', 'Siddipet'
    ];

    const categories = ['Bodily Crimes', 'Property Crime', 'Economic Offences', 'Cyber Crime'];
    const crimeTypes = ['Hurt', 'Murder', 'Theft', 'Fraud'];

    const mockData: TelanganaDistrictData[] = [];
    
    districts.forEach((district, index) => {
      categories.forEach(category => {
        crimeTypes.forEach(crimeType => {
          const baseValue = Math.floor(Math.random() * 1000) + 100;
          mockData.push({
            slNo: index + 1,
            units: district,
            populationInLakhs: Math.random() * 50 + 5,
            crimeRateFor2021: Math.random() * 100 + 20,
            category,
            crimeType,
            crimes: baseValue,
            year: 2021,
            percentVariationIn2021Over2020: (Math.random() - 0.5) * 0.2,
          });
        });
      });
    });

    return mockData;
  }

  getDistricts(): string[] {
    const districts = [...new Set(this.csvData.map(d => d.units))];
    return districts.sort();
  }

  getCrimeCategories(): string[] {
    const categories = [...new Set(this.csvData.map(d => d.category))];
    return categories.sort();
  }

  getCrimeTypesByCategory(category: string): string[] {
    const types = [...new Set(
      this.csvData
        .filter(d => d.category === category)
        .map(d => d.crimeType)
    )];
    
    return types.sort();
  }

  getYears(): string[] {
    const years = [...new Set(this.csvData.map(d => d.year.toString()))];
    return years.sort();
  }

  getFilteredData(filters: any): FilteredData {
    let filteredData = this.csvData.filter(d => {
      // Exclude RP SECUNDERABAD and CID when no filters are applied
      if (filters.year === 'all' && filters.district === 'all' && 
          filters.crimeCategory === 'all' && filters.crimeType === 'all') {
        if (d.units === 'RP SECUNDERABAD' || d.units === 'CID') return false;
      }
      
      if (filters.year !== 'all' && d.year.toString() !== filters.year) return false;
      if (filters.district !== 'all' && d.units !== filters.district) return false;
      if (filters.crimeCategory !== 'all' && d.category !== filters.crimeCategory) return false;
      if (filters.crimeType !== 'all' && d.crimeType !== filters.crimeType) return false;
      return true;
    });

    const totalIncidents = filteredData.reduce((sum, d) => sum + d.crimes, 0);

    // Mock detection and conviction rates since they're not in the CSV
    const avgDetectionRate = 72.5;
    const avgConvictionRate = 58.3;
    const totalPendingCases = Math.floor(totalIncidents * 0.6); // Estimate

    return {
      totalIncidents,
      detectionRate: avgDetectionRate,
      convictionRate: avgConvictionRate,
      pendingTrialCases: totalPendingCases,
      districtData: filteredData
    };
  }

  getTop10Districts(filters: any): any[] {
    const filteredData = this.getFilteredData(filters);
    
    const districtCrimes = filteredData.districtData.reduce((acc, d) => {
      if (!acc[d.units]) {
        acc[d.units] = 0;
      }
      acc[d.units] += d.crimes;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(districtCrimes)
      .map(([district, crimes]) => ({ district, crimes }))
      .sort((a, b) => b.crimes - a.crimes)
      .slice(0, 10);
  }

  getYearComparison(filters: any): any[] {
    // Use % Variation data to show comparison
    const filteredData = this.getFilteredData(filters);
    
    const totalCrimes2021 = filteredData.totalIncidents;
    const avgVariation = filteredData.districtData.length > 0 
      ? filteredData.districtData.reduce((sum, d) => sum + d.percentVariationIn2021Over2020, 0) / filteredData.districtData.length
      : 0;
    
    // Calculate 2020 data by reversing the variation
    const totalCrimes2020 = avgVariation !== 0 
      ? Math.floor(totalCrimes2021 / (1 + avgVariation))
      : totalCrimes2021;

    return [
      { year: '2020', incidents: totalCrimes2020 },
      { year: '2021', incidents: totalCrimes2021 }
    ];
  }

  getDistrictCoordinates(): Record<string, [number, number]> {
    return {
      'Cyberabad': [17.4401, 78.3489],
      'Hyderabad': [17.3617, 78.4747],
      'Karimnagar': [18.4386, 79.1288],
      'Khammam': [17.2473, 80.1514],
      'Nizamabad': [18.6720, 78.0940],
      'Rachakonda': [17.2960, 78.7890],
      'Ramagundam': [18.7639, 79.4750],
      'Siddipet': [18.1019, 78.8521],
      'Warangal': [17.9784, 79.5941],
      'Adilabad': [19.6667, 78.5333],
      'Bhadradri Kothagudem': [17.5500, 80.6167],
      'Jagtial': [18.8000, 78.9333],
      'Jayashankar Bhupalpally': [18.4000, 79.9000],
      'Jogulamba Gadwal': [16.2333, 77.8000],
      'Kamareddy': [18.3200, 78.3400],
      'Kumaram Bheem Asifabad': [19.3667, 79.2833],
      'Mahabubabad': [17.6000, 80.0000],
      'Mahabubnagar': [16.7500, 77.9833],
      'Medak': [18.0333, 78.2667],
      'Mulugu': [18.2000, 80.1000],
      'Nagarkurnool': [16.4833, 78.3167],
      'Nalgonda': [17.0500, 79.2667],
      'Narayanpet': [16.7500, 77.5000],
      'Nirmal': [19.1000, 78.3500],
      'Rajanna Siricilla': [18.3833, 78.8000],
      'Sangareddy': [17.6250, 78.0867],
      'Suryapet': [17.1500, 79.6167],
      'Vikarabad': [17.3333, 77.9000],
      'Wanaparthy': [16.3667, 78.0667],
      'Secunderabad': [17.4399, 78.4983],
      'CID Headquarters': [17.3850, 78.4867]
    };
  }

  getDistrictData(districtName: string, filters: any): TelanganaDistrictData[] {
    return this.csvData.filter(d => {
      if (d.units !== districtName) return false;
      if (filters.year !== 'all' && d.year.toString() !== filters.year) return false;
      if (filters.crimeCategory !== 'all' && d.category !== filters.crimeCategory) return false;
      if (filters.crimeType !== 'all' && d.crimeType !== filters.crimeType) return false;
      return true;
    });
  }
}

export const telanganaDataService = new TelanganaDataService();
