-- Create Uploads table
CREATE TABLE IF NOT EXISTS uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  outlet TEXT NOT NULL,
  tally_filename TEXT,
  doc_count INTEGER DEFAULT 0,
  fraud_count INTEGER DEFAULT 0,
  user_id UUID REFERENCES auth.users(id)
);

-- Create Fraud Results table
CREATE TABLE IF NOT EXISTS fraud_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  upload_id UUID REFERENCES uploads(id) ON DELETE CASCADE,
  invoice_no TEXT NOT NULL,
  date TEXT,
  amt_tally NUMERIC,
  amt_doc NUMERIC,
  ven_tally TEXT,
  ven_doc TEXT,
  status TEXT, -- 'match', 'partial', 'fraud'
  score INTEGER,
  reviewed BOOLEAN DEFAULT FALSE,
  image_url TEXT
);

-- Enable RLS (Optional but recommended)
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_results ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage their own data
CREATE POLICY "Users can manage their own uploads" ON uploads
  FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage results for their uploads" ON fraud_results
  FOR ALL TO authenticated USING (
    upload_id IN (SELECT id FROM uploads WHERE user_id = auth.uid())
  );

-- Storage bucket setup (Run these in the SQL editor or create via UI)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('document', 'document', true);
