import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UnofficialReportForm } from './UnofficialReportForm';

interface ReportCrimeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportCrimeModal({ open, onOpenChange }: ReportCrimeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle>Report a Crime</DialogTitle>
              <DialogDescription>
                Submit an unofficial crime report. Your report will be displayed on the map with a blue marker.
                All reports are anonymous by default.
              </DialogDescription>
            </DialogHeader>
            <UnofficialReportForm onClose={() => onOpenChange(false)} />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 