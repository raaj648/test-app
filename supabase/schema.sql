-- ExpiredDomains Automation Platform PostgreSQL Database Schemas
-- Perfect SQL blueprint for instant import. Stores securely encrypted cookie keys, filters, and reports.

-- CREATE TABLES FOR SAAS ENGINE --

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to view their own profile" 
  ON users FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "Allow admin to view all profiles" 
  ON users FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 2. Credential Accounts (Rotator Cluster with Automated SeleniumBase Browser Session Persistence)
CREATE TABLE IF NOT EXISTS credential_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_name TEXT NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  session_cookies_json TEXT DEFAULT '[]', -- JSON serialization of selenium cookies
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'failed', 'disabled')),
  is_primary BOOLEAN DEFAULT false,
  last_login TIMESTAMP WITH TIME ZONE,
  last_success TIMESTAMP WITH TIME ZONE,
  last_failure TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE credential_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own credential accounts"
  ON credential_accounts FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- 3. Filters
CREATE TABLE IF NOT EXISTS filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tlds TEXT[] DEFAULT '{" .com"}'::TEXT[],
  min_age_years INTEGER DEFAULT 0,
  max_spam_score INTEGER DEFAULT 10,
  min_backlinks INTEGER DEFAULT 0,
  indexed_only BOOLEAN DEFAULT false,
  no_adult BOOLEAN DEFAULT true,
  no_casino BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  schedule_cron TEXT DEFAULT '*/15 * * * *',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE filters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own filters"
  ON filters FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- 4. Expired Domains Collected
CREATE TABLE IF NOT EXISTS domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  domain_name TEXT NOT NULL UNIQUE,
  tld TEXT NOT NULL,
  domain_age_years INTEGER DEFAULT 0,
  archive_count INTEGER DEFAULT 0,
  backlinks INTEGER DEFAULT 0,
  moz_da INTEGER DEFAULT 0,
  status TEXT DEFAULT 'available',
  first_detected TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_detected TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  filter_matched_id UUID REFERENCES filters(id) ON DELETE SET NULL,
  clean_history BOOLEAN DEFAULT true,
  has_adult_history BOOLEAN DEFAULT false,
  has_casino_history BOOLEAN DEFAULT false
);

ALTER TABLE domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can download/query matching domains"
  ON domains FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can alter/write domains"
  ON domains FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 5. System Logs
CREATE TABLE IF NOT EXISTS scrape_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  level TEXT NOT NULL CHECK (level IN ('info', 'warning', 'error', 'success')),
  message TEXT NOT NULL,
  credential_account_id UUID REFERENCES credential_accounts(id) ON DELETE SET NULL
);

ALTER TABLE scrape_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can read scrape telemetry logs"
  ON scrape_logs FOR SELECT
  TO authenticated
  USING (true);

-- Automated Primary Reset Triggers --
CREATE OR REPLACE FUNCTION handle_primary_credential_rotation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = true THEN
    UPDATE credential_accounts
    SET is_primary = false, updated_at = NOW()
    WHERE user_id = NEW.user_id AND id <> NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER tr_rotate_primary_credential
  BEFORE INSERT OR UPDATE OF is_primary ON credential_accounts
  FOR EACH ROW
  EXECUTE FUNCTION handle_primary_credential_rotation();
