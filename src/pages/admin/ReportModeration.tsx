
import React from 'react';
import { SidebarWrapper } from '@/components/AppSidebar';
import { useQuery } from '@tanstack/react-query';
import { crimeDataService } from '@/services/crimeDataService';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

const ReportModeration: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['reports', 'moderation'],
    queryFn: () => crimeDataService.getCrimes({ status: 'pending' }),
  });

  const reports = data?.data || [];

  // This would be replaced with actual mutation hooks
  const handleApprove = (id: number) => {
    // Implementation would use useUpdateCrime mutation
    console.log(`Approve report ${id}`);
  };

  const handleReject = (id: number) => {
    // Implementation would use useUpdateCrime mutation
    console.log(`Reject report ${id}`);
  };

  const handleViewDetails = (id: number) => {
    // Implementation would open modal or navigate to detail page
    console.log(`View report ${id}`);
  };

  return (
    <SidebarWrapper>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Report Moderation</h1>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Pending Reports</CardTitle>
            <CardDescription>
              Review and moderate submitted crime reports before they appear on the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                Error loading reports. Please refresh the page.
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No pending reports to moderate</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.date}</TableCell>
                      <TableCell>{report.type}</TableCell>
                      <TableCell>{report.location}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            report.severity === 'critical' ? 'destructive' :
                            report.severity === 'high' ? 'outline' :
                            report.severity === 'medium' ? 'secondary' : 'default'
                          }
                        >
                          {report.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Pending</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(report.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApprove(report.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleReject(report.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarWrapper>
  );
};

export default ReportModeration;
