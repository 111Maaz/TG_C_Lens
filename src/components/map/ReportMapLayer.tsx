import { useEffect, useState } from "react";
import { Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import { Badge } from "@/components/ui/badge";
import { unofficialReportsService, UnofficialReport } from "@/services/unofficial-reports";

const unofficialMarkerIcon = new Icon({
  iconUrl: "/unofficial-marker.svg",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export function ReportMapLayer({ visible = true }: { visible?: boolean }) {
  const [reports, setReports] = useState<UnofficialReport[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await unofficialReportsService.getApproved();
        setReports(data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchReports();
  }, []);

  if (!visible) return null;

  return (
    <>
      {reports.map((report) => (
        <Marker
          key={report.id}
          position={[report.location.lat, report.location.lng]}
          icon={unofficialMarkerIcon}
        >
          <Popup>
            <div className="space-y-2 p-1">
              <div className="flex flex-col gap-1">
                <Badge variant="outline" className="w-fit">
                  {report.crime_category}
                </Badge>
                <Badge variant="secondary" className="w-fit">
                  {report.crime_type}
                </Badge>
              </div>
              <h3 className="font-medium">District: {report.district}</h3>
              <p className="text-sm text-muted-foreground">{report.description}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {new Date(report.created_at).toLocaleDateString()}
                </span>
                <Badge variant="outline" className="text-xs">
                  Unofficial Report
                </Badge>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
} 