// Simple in-memory mock database with client persistence simulation
// so the dashboard operates beautifully, provides creation, schema exports, and deployment configuration
import { CookieAccount, Filter, Domain, ScrapeLog } from './types';

// Let's seed initial realistic expired domains data
const DEFAULT_DOMAINS: Domain[] = [
  {
    id: 'dom-1',
    domain_name: 'cyberdefensehub.com',
    tld: '.com',
    domain_age_years: 12,
    archive_count: 142,
    backlinks: 2450,
    moz_da: 28,
    status: 'available',
    first_detected: '2026-06-01T10:00:00Z',
    last_detected: '2026-06-05T18:30:00Z',
    notes: 'Premium cybersecurity keyword domain. Clean history.',
    clean_history: true,
    has_adult_history: false,
    has_casino_history: false,
  },
  {
    id: 'dom-2',
    domain_name: 'quantumcomputinglabs.net',
    tld: '.net',
    domain_age_years: 8,
    archive_count: 89,
    backlinks: 530,
    moz_da: 19,
    status: 'available',
    first_detected: '2026-06-02T12:00:00Z',
    last_detected: '2026-06-05T19:00:00Z',
    notes: 'Strong computer-science keyword containing academic references.',
    clean_history: true,
    has_adult_history: false,
    has_casino_history: false,
  },
  {
    id: 'dom-3',
    domain_name: 'lasvegascasinoguides.com',
    tld: '.com',
    domain_age_years: 15,
    archive_count: 840,
    backlinks: 12500,
    moz_da: 42,
    status: 'available',
    first_detected: '2026-06-03T08:15:00Z',
    last_detected: '2026-06-05T19:15:00Z',
    notes: 'Gambling and betting history. Flags found on casino keywords.',
    clean_history: false,
    has_adult_history: false,
    has_casino_history: true,
  },
  {
    id: 'dom-4',
    domain_name: 'ecofriendlylivingtips.org',
    tld: '.org',
    domain_age_years: 6,
    archive_count: 34,
    backlinks: 280,
    moz_da: 14,
    status: 'available',
    first_detected: '2026-06-04T15:00:00Z',
    last_detected: '2026-06-05T19:20:00Z',
    notes: 'Green lifestyle blogs archive. Extremely clean profile.',
    clean_history: true,
    has_adult_history: false,
    has_casino_history: false,
  },
  {
    id: 'dom-5',
    domain_name: 'adultvideoarena.com',
    tld: '.com',
    domain_age_years: 10,
    archive_count: 1100,
    backlinks: 41000,
    moz_da: 52,
    status: 'expired_drop',
    first_detected: '2026-06-04T19:00:00Z',
    last_detected: '2026-06-05T19:30:00Z',
    notes: 'Adult industry backlink history. Marked risky.',
    clean_history: false,
    has_adult_history: true,
    has_casino_history: false,
  },
  {
    id: 'dom-6',
    domain_name: 'healthylifefoods.com',
    tld: '.com',
    domain_age_years: 9,
    archive_count: 76,
    backlinks: 890,
    moz_da: 22,
    status: 'available',
    first_detected: '2026-06-05T01:00:00Z',
    last_detected: '2026-06-05T19:35:00Z',
    notes: 'Excellent high authority organic nutrition domain.',
    clean_history: true,
    has_adult_history: false,
    has_casino_history: false,
  },
  {
    id: 'dom-7',
    domain_name: 'fintechtrends.net',
    tld: '.net',
    domain_age_years: 5,
    archive_count: 42,
    backlinks: 340,
    moz_da: 15,
    status: 'available',
    first_detected: '2026-06-05T06:00:00Z',
    last_detected: '2026-06-05T19:40:00Z',
    notes: 'Strong brandable finances/tech related domain.',
    clean_history: true,
    has_adult_history: false,
    has_casino_history: false,
  }
];

const DEFAULT_COOKIES: CookieAccount[] = [
  {
    id: 'cook-1',
    account_name: 'Primary Scrape Node Alpha',
    cookie_json: '[{"name":"xf_session","value":"8b3f29da57ac4598d123b3f88dd233ef"}]',
    status: 'active',
    is_primary: true,
    last_success: '2026-06-05T19:30:00Z',
    last_failure: null,
    created_at: '2026-06-01T00:00:00Z',
    updated_at: '2026-06-05T19:30:00Z'
  },
  {
    id: 'cook-2',
    account_name: 'Backup Node Beta',
    cookie_json: '[{"name":"xf_session","value":"fffa88112e4deeefaa88383ff9288ee1"}]',
    status: 'active',
    is_primary: false,
    last_success: '2026-06-05T19:15:00Z',
    last_failure: '2026-06-05T19:20:00Z',
    created_at: '2026-06-02T00:00:00Z',
    updated_at: '2026-06-05T19:20:00Z'
  },
  {
    id: 'cook-3',
    account_name: 'Legacy Node Gamma (Expired)',
    cookie_json: '[{"name":"xf_session","value":"123000badcookiesessionvalues"}]',
    status: 'expired',
    is_primary: false,
    last_success: '2026-06-04T12:00:00Z',
    last_failure: '2026-06-05T10:00:00Z',
    created_at: '2026-06-03T00:00:00Z',
    updated_at: '2026-06-05T10:00:00Z'
  }
];

const DEFAULT_FILTERS: Filter[] = [
  {
    id: 'filt-1',
    name: 'High Authority Coms',
    tlds: ['.com'],
    min_age_years: 5,
    max_spam_score: 1,
    min_backlinks: 500,
    indexed_only: true,
    no_adult: true,
    no_casino: true,
    is_active: true,
    schedule_cron: '*/15 * * * *'
  },
  {
    id: 'filt-2',
    name: 'Brandable Nets',
    tlds: ['.net'],
    min_age_years: 3,
    max_spam_score: 2,
    min_backlinks: 100,
    indexed_only: false,
    no_adult: true,
    no_casino: true,
    is_active: true,
    schedule_cron: '0 * * * *'
  },
  {
    id: 'filt-3',
    name: 'Raw Power (All Clean TLDs)',
    tlds: ['.com', '.net', '.org'],
    min_age_years: 8,
    max_spam_score: 3,
    min_backlinks: 1000,
    indexed_only: true,
    no_adult: true,
    no_casino: true,
    is_active: false,
    schedule_cron: 'disabled'
  }
];

const DEFAULT_LOGS: ScrapeLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-06-05T19:00:00Z',
    level: 'info',
    message: 'Cron triggered. Starting platform scrape tasks for active filters.'
  },
  {
    id: 'log-2',
    timestamp: '2026-06-05T19:01:05Z',
    level: 'info',
    message: 'Loading active session cookies. Selected "Primary Scrape Node Alpha".'
  },
  {
    id: 'log-3',
    timestamp: '2026-06-05T19:02:15Z',
    level: 'success',
    message: 'Successfully authenticated with ExpiredDomains.net. Retrieving filter list.'
  },
  {
    id: 'log-4',
    timestamp: '2026-06-05T19:04:10Z',
    level: 'success',
    message: 'Filter [High Authority Coms] returned 3 new domains under strict compliance schema.'
  },
  {
    id: 'log-5',
    timestamp: '2026-06-05T19:20:00Z',
    level: 'warning',
    message: 'Primary Scrape Node Alpha cookie failed handshake (HTTP 403 Forbidden). Rotating key...'
  },
  {
    id: 'log-6',
    timestamp: '2026-06-05T19:20:15Z',
    level: 'info',
    message: 'Database check. Primary rotated. Switched to Backup Node Beta.'
  },
  {
    id: 'log-7',
    timestamp: '2026-06-05T19:21:40Z',
    level: 'success',
    message: 'Handshake restored using Backup Node Beta. Domain collection re-aligned.'
  },
  {
    id: 'log-8',
    timestamp: '2026-06-05T19:40:02Z',
    level: 'info',
    message: 'Regular heartbeat checker executed. All database nodes online.'
  }
];

export function getStoredData<T>(key: string, initial: T): T {
  const data = localStorage.getItem(`expireddomains_${key}`);
  if (!data) {
    localStorage.setItem(`expireddomains_${key}`, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
}

export function writeStoredData<T>(key: string, data: T): void {
  localStorage.setItem(`expireddomains_${key}`, JSON.stringify(data));
}

export function initializeDatabase() {
  getStoredData('domains', DEFAULT_DOMAINS);
  getStoredData('cookies', DEFAULT_COOKIES);
  getStoredData('filters', DEFAULT_FILTERS);
  getStoredData('logs', DEFAULT_LOGS);
}
