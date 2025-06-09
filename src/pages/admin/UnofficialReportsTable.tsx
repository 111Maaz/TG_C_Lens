import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, MapPin, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { unofficialReportsService } from "@/services/unofficial-reports";

interface UnofficialReport {
  id: string;
  crime_type: string;
  crime_category: string;
  description: string;
  district: string;
  created_at: string;
  location: string;
  is_anonymous: boolean;
  status: 'pending' | 'approved' | 'rejected';
}

export function UnofficialReportsTable() {
  const [reports, setReports] = useState<UnofficialReport[]>([]);

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from("unofficial_reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
      return;
    }

    setReports(data || []);
  };

  useEffect(() => {
    fetchReports();

    const subscription = supabase
      .channel("unofficial_reports")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "unofficial_reports",
        },
        () => {
          fetchReports();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("unofficial_reports")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting report:", error);
      toast.error("Failed to delete report");
      return;
    }

    toast.success("Report deleted successfully");
    fetchReports();
  };

  const handleApprove = async (id: string) => {
    try {
      await unofficialReportsService.updateStatus(id, 'approved');
      toast.success("Report approved successfully");
      fetchReports();
    } catch (error) {
      console.error("Error approving report:", error);
      toast.error("Failed to approve report");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await unofficialReportsService.updateStatus(id, 'rejected');
      toast.success("Report rejected successfully");
      fetchReports();
    } catch (error) {
      console.error("Error rejecting report:", error);
      toast.error("Failed to reject report");
    }
  };

  const handleViewLocation = (location: string) => {
    // Extract coordinates from PostGIS POINT format
    const coords = location
      .substring(location.indexOf("(") + 1, location.indexOf(")"))
      .split(",")
      .map(Number);
    
    // Open in Google Maps
    window.open(
      `https://www.google.com/maps?q=${coords[1]},${coords[0]}`,
      "_blank"
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Unofficial Reports</h2>
        <p className="text-sm text-gray-500">
          Total Reports: {reports.length}
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>District</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Anonymous</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>
                  {format(new Date(report.created_at), "PPp")}
                </TableCell>
                <TableCell>{report.crime_category}</TableCell>
                <TableCell className="font-medium">
                  {report.crime_type}
                </TableCell>
                <TableCell>{report.district}</TableCell>
                <TableCell className="max-w-[300px] truncate">
                  {report.description}
                </TableCell>
                <TableCell>
                  {getStatusBadge(report.status)}
                </TableCell>
                <TableCell>
                  {report.is_anonymous ? "Yes" : "No"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {report.status === 'pending' && (
                        <>
                          <DropdownMenuItem
                            onClick={() => handleApprove(report.id)}
                            className="cursor-pointer text-green-600"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve Report
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleReject(report.id)}
                            className="cursor-pointer text-red-600"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject Report
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleViewLocation(report.location)}
                        className="cursor-pointer"
                      >
                        <MapPin className="mr-2 h-4 w-4" />
                        View Location
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(report.id)}
                        className="cursor-pointer text-red-600"
                      >
                        Delete Report
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 