
import React from 'react';
import { SidebarWrapper } from '@/components/AppSidebar';
import CrimeReportUpload from '@/components/CrimeReportUpload';

const SubmitReport = () => {
  return (
    <SidebarWrapper>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Submit Crime Report</h1>
        <p className="text-muted-foreground mb-8">
          Help us keep the community informed by submitting crime reports. All submissions are reviewed 
          before being added to our database and displayed on the dashboard. Your contribution helps 
          improve safety and awareness in Hyderabad.
        </p>
        
        <CrimeReportUpload />
        
        <div className="mt-12 bg-muted/40 border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Emergency Resources</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-background p-4 rounded-md border">
              <h3 className="font-medium mb-2">Police Emergency</h3>
              <p className="text-primary text-lg font-bold">100</p>
              <p className="text-sm text-muted-foreground">For immediate police assistance</p>
            </div>
            <div className="bg-background p-4 rounded-md border">
              <h3 className="font-medium mb-2">Women's Helpline</h3>
              <p className="text-primary text-lg font-bold">181</p>
              <p className="text-sm text-muted-foreground">For women in distress</p>
            </div>
            <div className="bg-background p-4 rounded-md border">
              <h3 className="font-medium mb-2">Ambulance</h3>
              <p className="text-primary text-lg font-bold">108</p>
              <p className="text-sm text-muted-foreground">For medical emergencies</p>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="mt-16 border-t pt-6 text-center text-sm text-muted-foreground">
        <p>HydCrime Lens - Data is for demonstration purposes only</p>
        <p className="mt-2">© 2025 Hyderabad Police Department Analytics Team</p>
      </footer>
    </SidebarWrapper>
  );
};

export default SubmitReport;
