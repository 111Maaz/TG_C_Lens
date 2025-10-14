
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon, MapPin, Calendar, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Mock search results - in a real app, this would be a real API call
    setTimeout(() => {
      // Mock results based on search query
      const results = [
        {
          id: 1,
          title: 'Theft at HITEC City Mall',
          type: 'theft',
          date: '2025-04-15',
          location: 'HITEC City',
          description: 'A mobile phone was reported stolen from the food court area of HITEC City Mall.',
          severity: 'Medium'
        },
        {
          id: 2,
          title: 'Vehicle Break-in at Gachibowli',
          type: 'burglary',
          date: '2025-04-12',
          location: 'Gachibowli',
          description: 'A car parked near the Gachibowli Stadium was broken into and valuables were stolen.',
          severity: 'Medium'
        },
        {
          id: 3,
          title: 'Fraud Case at Financial District',
          type: 'fraud',
          date: '2025-04-10',
          location: 'Financial District',
          description: 'A report of financial fraud involving credit card skimming at an ATM in the Financial District.',
          severity: 'High'
        }
      ];
      
      setSearchResults(results);
      setIsSearching(false);
    }, 1000);
  };

  return (
    <SidebarWrapper>
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Search Crime Reports</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Advanced Search</CardTitle>
            <CardDescription>
              Search through crime reports by keywords, locations, or dates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch}>
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <Input
                    placeholder="Search for crime reports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={isSearching}>
                  {isSearching ? "Searching..." : (
                    <>
                      <SearchIcon className="h-4 w-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </form>
            
            {searchQuery && (
              <Tabs defaultValue="all" className="mt-6">
                <TabsList>
                  <TabsTrigger value="all">All Results</TabsTrigger>
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                  <TabsTrigger value="high-severity">High Severity</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-4">
                  <div className="space-y-4">
                    {isSearching ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-pulse text-center">
                          <SearchIcon className="h-10 w-10 mx-auto text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">Searching...</p>
                        </div>
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((result) => (
                        <Card key={result.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-lg font-medium">{result.title}</h3>
                                <div className="flex items-center text-sm text-muted-foreground mt-1">
                                  <MapPin className="h-3.5 w-3.5 mr-1" />
                                  <span>{result.location}</span>
                                  <span className="mx-2">•</span>
                                  <Calendar className="h-3.5 w-3.5 mr-1" />
                                  <span>{result.date}</span>
                                </div>
                                <p className="mt-2 text-sm">{result.description}</p>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded ${
                                result.severity === 'Low' ? 'bg-green-100 text-green-800' :
                                result.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {result.severity}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : searchQuery ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <AlertCircle className="h-10 w-10 text-muted-foreground" />
                        <p className="mt-2 text-muted-foreground">No results found for "{searchQuery}"</p>
                      </div>
                    ) : null}
                  </div>
                </TabsContent>
                <TabsContent value="recent" className="mt-4">
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">Recent results will appear here</p>
                  </div>
                </TabsContent>
                <TabsContent value="high-severity" className="mt-4">
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">High severity results will appear here</p>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarWrapper>
  );
};

export default Search;
