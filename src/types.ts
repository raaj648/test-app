export interface CredentialAccount {
  id: string;
  account_name: string;
  email: string;
  password: string;
  session_cookies_json: string; // Stores the cached SeleniumBase browser cookies to reuse
  status: 'active' | 'expired' | 'failed' | 'disabled';
  is_primary: boolean;
  last_login: string | null;
  last_success: string | null;
  last_failure: string | null;
  created_at: string;
  updated_at: string;
}

export interface Filter {
  id: string;
  name: string;
  tlds: string[]; // e.g. ['.com', '.net']
  min_age_years: number;
  max_spam_score: number;
  min_backlinks: number;
  indexed_only: boolean;
  no_adult: boolean;
  no_casino: boolean;
  is_active: boolean;
  schedule_cron: string; // e.g. "*/30 * * * *" or "disabled"
}

export interface Domain {
  id: string;
  domain_name: string;
  tld: string;
  domain_age_years: number;
  archive_count: number;
  backlinks: number;
  moz_da: number;
  status: 'available' | 'bid' | 'offer' | 'expired_drop';
  first_detected: string;
  last_detected: string;
  notes: string;
  filter_matched_id?: string;
  clean_history: boolean;
  has_adult_history: boolean;
  has_casino_history: boolean;
}

export interface ScrapeLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  cookie_account_id?: string;
}
