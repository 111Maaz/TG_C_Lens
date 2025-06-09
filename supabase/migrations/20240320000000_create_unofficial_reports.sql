-- Create the unofficial_reports table
CREATE TABLE unofficial_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crime_type TEXT NOT NULL,
  location GEOGRAPHY(POINT) NOT NULL,
  district TEXT NOT NULL,
  description TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create a table to track request counts
CREATE TABLE request_limits (
  ip_address TEXT PRIMARY KEY,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW()
);

-- Function to check and update rate limits
CREATE OR REPLACE FUNCTION check_rate_limit(client_ip TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  window_size INTERVAL := INTERVAL '1 hour';
  max_requests INTEGER := 5;
  current_count INTEGER;
  current_window TIMESTAMPTZ;
BEGIN
  -- Clean up old entries
  DELETE FROM request_limits
  WHERE window_start < NOW() - window_size;
  
  -- Get or create rate limit record
  INSERT INTO request_limits (ip_address, request_count, window_start)
  VALUES (client_ip, 1, NOW())
  ON CONFLICT (ip_address) DO UPDATE
  SET request_count = 
    CASE 
      WHEN request_limits.window_start < NOW() - window_size 
      THEN 1
      ELSE request_limits.request_count + 1
    END,
    window_start = 
    CASE 
      WHEN request_limits.window_start < NOW() - window_size 
      THEN NOW()
      ELSE request_limits.window_start
    END
  RETURNING request_count INTO current_count;
  
  -- Check if limit exceeded
  RETURN current_count <= max_requests;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE unofficial_reports ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting reports (with rate limiting)
CREATE POLICY "Enable insert for authenticated users with rate limit" ON unofficial_reports
FOR INSERT TO authenticated
WITH CHECK (
  check_rate_limit(current_setting('request.headers')::json->>'cf-connecting-ip')
);

-- Create policy for viewing reports (public read)
CREATE POLICY "Enable read access for all users" ON unofficial_reports
FOR SELECT USING (true);

-- Create policy for deleting reports (admin only)
CREATE POLICY "Enable delete for admin users" ON unofficial_reports
FOR DELETE USING (
  auth.jwt()->>'role' = 'admin'
); 