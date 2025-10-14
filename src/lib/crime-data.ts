
export interface CrimeData {
  id: number;
  type: string;
  location: string;
  coordinates: [number, number]; // [latitude, longitude]
  date: string;
  time: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  status: 'open' | 'investigating' | 'closed';
}

export interface RegionData {
  id: string;
  name: string;
  center: [number, number]; // [latitude, longitude]
  crimeCount: {
    low: number;
    medium: number;
    high: number;
    critical: number;
    total: number;
  };
}

export interface FilterOptions {
  timePeriod?: string;
  crimeType?: string;
  region?: string;
  severity?: string;
}

// Hyderabad regions with approximate coordinates
const hyderabadRegions: RegionData[] = [
  {
    id: 'hitech-city',
    name: 'HITEC City',
    center: [17.4456, 78.3772],
    crimeCount: { low: 35, medium: 24, high: 12, critical: 3, total: 74 }
  },
  {
    id: 'banjara-hills',
    name: 'Banjara Hills',
    center: [17.4156, 78.4347],
    crimeCount: { low: 29, medium: 31, high: 18, critical: 7, total: 85 }
  },
  {
    id: 'secunderabad',
    name: 'Secunderabad',
    center: [17.4399, 78.4983],
    crimeCount: { low: 42, medium: 38, high: 22, critical: 9, total: 111 }
  },
  {
    id: 'old-city',
    name: 'Old City',
    center: [17.3616, 78.4747],
    crimeCount: { low: 56, medium: 45, high: 28, critical: 14, total: 143 }
  },
  {
    id: 'gachibowli',
    name: 'Gachibowli',
    center: [17.4400, 78.3489],
    crimeCount: { low: 27, medium: 22, high: 11, critical: 2, total: 62 }
  },
  {
    id: 'kukatpally',
    name: 'Kukatpally',
    center: [17.4849, 78.4138],
    crimeCount: { low: 48, medium: 37, high: 19, critical: 6, total: 110 }
  },
  {
    id: 'madhapur',
    name: 'Madhapur',
    center: [17.4478, 78.3916],
    crimeCount: { low: 32, medium: 29, high: 15, critical: 4, total: 80 }
  },
  {
    id: 'begumpet',
    name: 'Begumpet',
    center: [17.4366, 78.4665],
    crimeCount: { low: 31, medium: 26, high: 14, critical: 5, total: 76 }
  }
];

// Common crime types
const crimeTypes = [
  'Theft', 'Burglary', 'Vehicle Theft', 'Assault', 'Robbery', 
  'Vandalism', 'Fraud', 'Public Disorder', 'Drug Offenses'
];

// Generate a random date within the last 6 months
function randomRecentDate(): string {
  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(now.getMonth() - 6);
  
  const randomTime = sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime());
  const randomDate = new Date(randomTime);
  
  return randomDate.toISOString().split('T')[0];
}

// Generate random time
function randomTime(): string {
  const hours = String(Math.floor(Math.random() * 24)).padStart(2, '0');
  const minutes = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Add slight randomness to coordinates to spread points
function randomizeCoordinates(base: [number, number]): [number, number] {
  const variance = 0.015; // About 1-1.5km
  return [
    base[0] + (Math.random() * variance * 2 - variance),
    base[1] + (Math.random() * variance * 2 - variance)
  ];
}

// Generate mock crime data
export function generateCrimeData(count = 500): CrimeData[] {
  const crimeData: CrimeData[] = [];
  
  for (let i = 0; i < count; i++) {
    // Select random region
    const region = hyderabadRegions[Math.floor(Math.random() * hyderabadRegions.length)];
    
    // Select random crime type
    const type = crimeTypes[Math.floor(Math.random() * crimeTypes.length)];
    
    // Weighted severity (more low and medium than high and critical)
    const severityRoll = Math.random();
    let severity: 'low' | 'medium' | 'high' | 'critical';
    if (severityRoll < 0.5) severity = 'low';
    else if (severityRoll < 0.8) severity = 'medium';
    else if (severityRoll < 0.95) severity = 'high';
    else severity = 'critical';
    
    // Status (most crimes are under investigation)
    const statusRoll = Math.random();
    let status: 'open' | 'investigating' | 'closed';
    if (statusRoll < 0.3) status = 'open';
    else if (statusRoll < 0.85) status = 'investigating';
    else status = 'closed';
    
    crimeData.push({
      id: i + 1,
      type,
      location: region.name,
      coordinates: randomizeCoordinates(region.center),
      date: randomRecentDate(),
      time: randomTime(),
      severity,
      description: `${severity.charAt(0).toUpperCase() + severity.slice(1)} ${type.toLowerCase()} reported in ${region.name} area.`,
      status
    });
  }
  
  return crimeData;
}

// Get regions data
export function getRegionsData(filters?: FilterOptions) {
  if (!filters) return hyderabadRegions;
  
  let filteredRegions = [...hyderabadRegions];
  
  // Filter by region if specified
  if (filters.region && filters.region !== 'all') {
    filteredRegions = filteredRegions.filter(region => region.id === filters.region);
  }
  
  return filteredRegions;
}

// Get crime data aggregated by location with filters
export function getCrimeByLocation(filters?: FilterOptions) {
  const filteredRegions = getRegionsData(filters);
  return filteredRegions.map(region => ({
    name: region.name,
    ...region.crimeCount
  }));
}

// Get crime data aggregated by type with filters
export function getCrimeByType(filters?: FilterOptions) {
  // In a real app, this would filter based on the provided filters
  // For demonstration, we're returning the same data
  return [
    { name: 'Theft', value: 127 },
    { name: 'Burglary', value: 85 },
    { name: 'Vehicle Theft', value: 63 },
    { name: 'Assault', value: 49 },
    { name: 'Robbery', value: 38 },
    { name: 'Vandalism', value: 72 },
    { name: 'Fraud', value: 54 },
    { name: 'Public Disorder', value: 43 },
    { name: 'Drug Offenses', value: 31 }
  ];
}

// Get crime data trends by month with filters
export function getCrimeByMonth(filters?: FilterOptions) {
  // In a real app, this would filter based on time period
  // For demonstration, we're returning the same data
  return [
    { name: 'Jan', thefts: 43, assaults: 12, burglary: 22, fraud: 15 },
    { name: 'Feb', thefts: 37, assaults: 18, burglary: 26, fraud: 21 },
    { name: 'Mar', thefts: 45, assaults: 15, burglary: 30, fraud: 18 },
    { name: 'Apr', thefts: 52, assaults: 19, burglary: 25, fraud: 16 },
    { name: 'May', thefts: 49, assaults: 21, burglary: 28, fraud: 19 },
    { name: 'Jun', thefts: 55, assaults: 17, burglary: 23, fraud: 24 },
  ];
}
