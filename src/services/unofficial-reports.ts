import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface UnofficialReport {
  id: string;
  crime_category: string;
  crime_type: string;
  district: string;
  description: string;
  location: { lat: number; lng: number };
  exact_location: string;
  email?: string;
  is_anonymous: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface CreateUnofficialReport
  extends Omit<UnofficialReport, 'id' | 'status' | 'created_at' | 'updated_at'> {}

export const unofficialReportsService = {
  async create(report: CreateUnofficialReport) {
    console.log("Creating report with data:", report);
    const { location, ...rest } = report;
    try {
      const { data, error } = await supabase
        .from('unofficial_reports')
        .insert([
          {
            ...rest,
            location: `(${location.lng},${location.lat})`,
            status: 'approved', // Automatically set status to approved
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to create report: ${error.message}`);
      }
      
      console.log("Created report:", data);
      return data;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  },

  async getAll() {
    console.log("Fetching all reports...");
    try {
      const { data, error } = await supabase
        .from('unofficial_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to fetch reports: ${error.message}`);
      }

      console.log("Raw reports data:", data);
      
      const processedData = data.map((report) => {
        try {
          const [lng, lat] = report.location
            .replace('(', '')
            .replace(')', '')
            .split(',')
            .map(Number);

          if (isNaN(lat) || isNaN(lng)) {
            console.error(`Invalid coordinates in report ${report.id}:`, report.location);
            return null;
          }

          return {
            ...report,
            location: { lat, lng },
          };
        } catch (error) {
          console.error(`Error processing report ${report.id}:`, error);
          return null;
        }
      }).filter(Boolean) as UnofficialReport[];

      console.log("Processed reports:", processedData);
      return processedData;
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  },

  async getApproved() {
    console.log("Fetching approved reports...");
    try {
      const { data, error } = await supabase
        .from('unofficial_reports')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to fetch approved reports: ${error.message}`);
      }

      console.log("Raw approved reports data:", data);
      
      const processedData = data.map((report) => {
        try {
          const [lng, lat] = report.location
            .replace('(', '')
            .replace(')', '')
            .split(',')
            .map(Number);

          if (isNaN(lat) || isNaN(lng)) {
            console.error(`Invalid coordinates in report ${report.id}:`, report.location);
            return null;
          }

          return {
            ...report,
            location: { lat, lng },
          };
        } catch (error) {
          console.error(`Error processing report ${report.id}:`, error);
          return null;
        }
      }).filter(Boolean) as UnofficialReport[];

      console.log("Processed approved reports:", processedData);
      return processedData;
    } catch (error) {
      console.error('Error fetching approved reports:', error);
      throw error;
    }
  },

  async updateStatus(id: string, status: 'approved' | 'rejected') {
    console.log(`Updating report ${id} status to ${status}`);
    try {
      const { data, error } = await supabase
        .from('unofficial_reports')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to update report status: ${error.message}`);
      }

      console.log("Updated report:", data);
      return data;
    } catch (error) {
      console.error('Error updating report status:', error);
      throw error;
    }
  },

  subscribeToReports(callback: (payload: any) => void): RealtimeChannel {
    return supabase
      .channel('unofficial_reports_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'unofficial_reports',
        },
        callback
      )
      .subscribe();
  }
}; 