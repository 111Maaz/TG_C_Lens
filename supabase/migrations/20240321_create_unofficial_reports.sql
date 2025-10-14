-- Create unofficial reports table
CREATE TABLE IF NOT EXISTS unofficial_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    crime_category TEXT NOT NULL,
    crime_type TEXT NOT NULL,
    district TEXT NOT NULL,
    description TEXT NOT NULL,
    location POINT NOT NULL,
    exact_location TEXT NOT NULL,
    email TEXT,
    is_anonymous BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE unofficial_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON unofficial_reports
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON unofficial_reports
    FOR INSERT WITH CHECK (true);

-- Create function to update updated_at timestamp
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