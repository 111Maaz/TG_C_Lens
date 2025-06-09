-- Change default status to approved
ALTER TABLE unofficial_reports 
ALTER COLUMN status SET DEFAULT 'approved'; 