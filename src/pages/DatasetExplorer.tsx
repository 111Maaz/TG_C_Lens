
import React, { useState } from 'react';
import { SidebarWrapper } from '@/components/AppSidebar';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Download, Filter } from 'lucide-react';

const DatasetExplorer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock crime data entries
  const crimeData = [
    { id: 1, date: '2025-04-12', type: 'Theft', location: 'Banjara Hills', severity: 'Medium', status: 'Solved' },
    { id: 2, date: '2025-04-10', type: 'Assault', location: 'HITEC City', severity: 'High', status: 'Under Investigation' },
    { id: 3, date: '2025-04-08', type: 'Fraud', location: 'Gachibowli', severity: 'Low', status: 'Solved' },
    { id: 4, date: '2025-04-05', type: 'Burglary', location: 'Secunderabad', severity: 'Medium', status: 'Closed' },
    { id: 5, date: '2025-04-02', type: 'Robbery', location: 'Old City', severity: 'Critical', status: 'Under Investigation' },
    { id: 6, date: '2025-03-28', type: 'Theft', location: 'Kukatpally', severity: 'Low', status: 'Solved' },
    { id: 7, date: '2025-03-25', type: 'Assault', location: 'HITEC City', severity: 'High', status: 'Closed' },
    { id: 8, date: '2025-03-20', type: 'Fraud', location: 'Banjara Hills', severity: 'Medium', status: 'Under Investigation' },
    { id: 9, date: '2025-03-15', type: 'Burglary', location: 'Gachibowli', severity: 'High', status: 'Solved' },
    { id: 10, date: '2025-03-10', type: 'Robbery', location: 'Secunderabad', severity: 'Critical', status: 'Under Investigation' },
  ];

  // Filter data based on search term
  const filteredData = crimeData.filter(
    crime => 
      crime.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crime.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crime.severity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crime.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SidebarWrapper>
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Dataset Explorer</h1>
        
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between">
              <div>
                <CardTitle>Crime Dataset</CardTitle>
                <CardDescription>Browse and analyze raw crime data</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Search crimes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Filter by Date</DropdownMenuItem>
                    <DropdownMenuItem>Filter by Type</DropdownMenuItem>
                    <DropdownMenuItem>Filter by Location</DropdownMenuItem>
                    <DropdownMenuItem>Filter by Severity</DropdownMenuItem>
                    <DropdownMenuItem>Filter by Status</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>A list of recent crime reports</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((crime) => (
                  <TableRow key={crime.id}>
                    <TableCell>{crime.id}</TableCell>
                    <TableCell>{crime.date}</TableCell>
                    <TableCell>{crime.type}</TableCell>
                    <TableCell>{crime.location}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded ${
                        crime.severity === 'Low' ? 'bg-green-100 text-green-800' :
                        crime.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        crime.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {crime.severity}
                      </span>
                    </TableCell>
                    <TableCell>{crime.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>
              Showing {filteredData.length} of {crimeData.length} entries
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </SidebarWrapper>
  );
};

export default DatasetExplorer;
