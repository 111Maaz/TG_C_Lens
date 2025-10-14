-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add crime_category if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'unofficial_reports' AND column_name = 'crime_category') THEN
        ALTER TABLE unofficial_reports ADD COLUMN crime_category TEXT NOT NULL DEFAULT 'Unknown';
    END IF;

    -- Add exact_location if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'unofficial_reports' AND column_name = 'exact_location') THEN
        ALTER TABLE unofficial_reports ADD COLUMN exact_location TEXT NOT NULL DEFAULT 'Not specified';
    END IF;

    -- Add email if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'unofficial_reports' AND column_name = 'email') THEN
        ALTER TABLE unofficial_reports ADD COLUMN email TEXT;
    END IF;

    -- Add status if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'unofficial_reports' AND column_name = 'status') THEN
        ALTER TABLE unofficial_reports ADD COLUMN status TEXT DEFAULT 'pending';
        ALTER TABLE unofficial_reports ADD CONSTRAINT status_check CHECK (status IN ('pending', 'approved', 'rejected'));
    END IF;

    -- Add updated_at if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'unofficial_reports' AND column_name = 'updated_at') THEN
        ALTER TABLE unofficial_reports ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        
        -- Create function to update updated_at timestamp if it doesn't exist
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';

        -- Create trigger to automatically update updated_at
        CREATE TRIGGER update_unofficial_reports_updated_at
            BEFORE UPDATE ON unofficial_reports
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Update any existing rows to have a status if they don't
    UPDATE unofficial_reports SET status = 'pending' WHERE status IS NULL;
END $$; 