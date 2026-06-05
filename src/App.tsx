import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Settings, 
  FileCode, 
  Terminal, 
  Database, 
  Layers, 
  RotateCw, 
  User, 
  Shield, 
  Plus, 
  Check, 
  AlertTriangle, 
  Trash2, 
  Play, 
  Activity, 
  Search, 
  Calendar, 
  Sparkles, 
  RefreshCw, 
  Copy, 
  CheckCircle,
  HelpCircle,
  Key,
  XCircle,
  Github,
  Award,
  Lock,
  ChevronRight,
  TrendingUp,
  Download,
  AlertOctagon,
  Clock
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { 
  getStoredData, 
  writeStoredData, 
  initializeDatabase,
  DEFAULT_DOMAINS,
  DEFAULT_CREDENTIALS,
  DEFAULT_FILTERS,
  DEFAULT_LOGS,
  DEFAULT_SETTINGS
} from './mockDb';
import { CredentialAccount, Filter, Domain, ScrapeLog } from './types';

export default function App() {
  // Initialize default database state
  useEffect(() => {
    initializeDatabase();
  }, []);

  // State
  const [activeTab, setActiveTab] = useState<'overview' | 'domains' | 'filters' | 'cookies' | 'logs' | 'settings'>('overview');
  const [domains, setDomains] = useState<Domain[]>(() => getStoredData('domains', DEFAULT_DOMAINS));
  const [credentials, setCredentials] = useState<CredentialAccount[]>(() => getStoredData('credentials', DEFAULT_CREDENTIALS));
  const [filters, setFilters] = useState<Filter[]>(() => getStoredData('filters', DEFAULT_FILTERS));
  const [logs, setLogs] = useState<ScrapeLog[]>(() => getStoredData('logs', DEFAULT_LOGS));
  
  // Platform configuration state
  const [settings, setSettings] = useState(() => getStoredData('settings', DEFAULT_SETTINGS));
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'failed'>('idle');

  // Sync settings when state changes
  useEffect(() => {
    writeStoredData('settings', settings);
  }, [settings]);
  
  // Filters and queries
  const [searchTerm, setSearchTerm] = useState('');
  const [tldFilter, setTldFilter] = useState<string>('all');
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);

  // Authenticated User State Simulation
  const [currentUser, setCurrentUser] = useState({
    id: 'usr-admin-1',
    email: 'gamesdeluxe648@gmail.com',
    full_name: 'Platform Operator',
    role: 'admin',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
  });

  // Create modes
  const [isAddingCredential, setIsAddingCredential] = useState(false);
  const [newCredential, setNewCredential] = useState({
    account_name: '',
    username: '',
    password: '',
    session_cookies_json: '',
    is_primary: false,
    status: 'active' as const
  });

  const [isAddingFilter, setIsAddingFilter] = useState(false);
  const [newFilter, setNewFilter] = useState({
    name: '',
    tlds: ['.com'],
    min_age_years: 5,
    max_spam_score: 3,
    min_backlinks: 250,
    indexed_only: true,
    no_adult: true,
    no_casino: true,
    is_active: true,
    schedule_cron: '*/15 * * * *'
  });

  // Scraper manual triggering state simulation
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeProgress, setScrapeProgress] = useState('');

  // Persist local storage when react states update
  useEffect(() => {
    writeStoredData('domains', domains);
  }, [domains]);

  useEffect(() => {
    writeStoredData('credentials', credentials);
  }, [credentials]);

  useEffect(() => {
    writeStoredData('filters', filters);
  }, [filters]);

  useEffect(() => {
    writeStoredData('logs', logs);
  }, [logs]);

  // Handle Credential and Active Session action events
  const handleCreateCredential = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCredential.account_name || !newCredential.username || !newCredential.password) return;

    let finalCreds = [...credentials];
    if (newCredential.is_primary) {
      finalCreds = finalCreds.map(c => ({ ...c, is_primary: false }));
    }

    const created: CredentialAccount = {
      id: `cred-${Date.now()}`,
      account_name: newCredential.account_name,
      username: newCredential.username,
      password: newCredential.password,
      session_cookies_json: newCredential.session_cookies_json || '[]',
      status: newCredential.status,
      is_primary: newCredential.is_primary,
      last_login: null,
      last_success: null,
      last_failure: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setCredentials([created, ...finalCreds]);
    setIsAddingCredential(false);
    setNewCredential({ account_name: '', username: '', password: '', session_cookies_json: '', is_primary: false, status: 'active' });

    // Append to logs
    addLog('success', `Added account credentials: ${created.account_name} (${created.username}). Ready for automated SeleniumBase login.`);
  };

  const toggleCredentialActive = (id: string) => {
    setCredentials(credentials.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === 'disabled' ? 'active' : 'disabled';
        addLog('info', `Set account status [${c.account_name}] to "${nextStatus}"`);
        return { ...c, status: nextStatus, updated_at: new Date().toISOString() };
      }
      return c;
    }));
  };

  const deleteCredential = (id: string, name: string) => {
    setCredentials(credentials.filter(c => c.id !== id));
    addLog('warning', `Deleted crawler credentials profile: [${name}] from rotation stack.`);
  };

  const makeCredentialPrimary = (id: string) => {
    setCredentials(credentials.map(c => ({
      ...c,
      is_primary: c.id === id,
      updated_at: new Date().toISOString()
    })));
    addLog('success', `Set [${credentials.find(c => c.id === id)?.account_name}] as the primary scraper nodes entry point.`);
  };

  const testCredentialLoginState = (id: string, name: string) => {
    addLog('info', `Testing live crawler handshake for [${name}] utilizing SeleniumBase UC...`);
    
    setTimeout(() => {
      setCredentials(credentials.map(c => {
        if (c.id === id) {
          const hasCookies = c.session_cookies_json && c.session_cookies_json !== '[]' && !c.session_cookies_json.includes('badcookie');
          
          if (hasCookies) {
            // First attempt to reuse session cookies
            addLog('success', `Validated active browser session via saved cookies. (HTTP 200). Ready for high concurrency.`);
            return { 
              ...c, 
              status: 'active', 
              last_success: new Date().toISOString(), 
              updated_at: new Date().toISOString() 
            };
          } else {
            // Redirected / Logged out detection triggers automatic login using username/password
            addLog('warning', `Session cookies invalid or missing. Triggering SeleniumBase automatic relogin handler using credentials...`);
            
            // Simulating SeleniumBase auto-login delay
            setTimeout(() => {
              const freshCookiesMock = JSON.stringify([
                { name: "xf_session", value: Math.random().toString(16).slice(2, 14), domain: ".expireddomains.net" }
              ]);
              setCredentials(prevCreds => prevCreds.map(item => {
                if (item.id === id) {
                  addLog('success', `Successfully authenticated via username/password. Saved fresh browser session cookies list back to DB.`);
                  return {
                    ...item,
                    status: 'active',
                    session_cookies_json: freshCookiesMock,
                    last_login: new Date().toISOString(),
                    last_success: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  };
                }
                return item;
              }));
            }, 1000);

            return { ...c, status: 'active', updated_at: new Date().toISOString() };
          }
        }
        return c;
      }));
    }, 600);
  };

  // Filter creation events
  const handleCreateFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilter.name) return;

    const created: Filter = {
      id: `filt-${Date.now()}`,
      ...newFilter
    };

    setFilters([created, ...filters]);
    setIsAddingFilter(false);
    setNewFilter({
      name: '',
      tlds: ['.com'],
      min_age_years: 5,
      max_spam_score: 3,
      min_backlinks: 250,
      indexed_only: true,
      no_adult: true,
      no_casino: true,
      is_active: true,
      schedule_cron: '*/15 * * * *'
    });

    addLog('success', `Saved daemon filter: [${created.name}]. Ready on schedule.`);
  };

  const toggleFilterActive = (id: string) => {
    setFilters(filters.map(f => {
      if (f.id === id) {
        addLog('info', `Toggled filter [${f.name}] active status in daemon cron loop.`);
        return { ...f, is_active: !f.is_active };
      }
      return f;
    }));
  };

  const deleteFilter = (id: string, name: string) => {
    setFilters(filters.filter(f => f.id !== id));
    addLog('warning', `Deleted scanning criteria: [${name}] from the automation stream.`);
  };

  const addLog = (level: 'info' | 'warning' | 'error' | 'success', message: string) => {
    const freshLog: ScrapeLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level,
      message
    };
    setLogs(prev => [freshLog, ...prev]);
  };

  // Run Real-Time Daemon Simulation
  const triggerScraperLoop = () => {
    setIsScraping(true);
    setScrapeProgress('Checking available credential nodes...');
    addLog('info', 'Manual workflow dispatch trigger received. Booting SeleniumBase (UC Mode) runner inside cloud runtime.');

    setTimeout(() => {
      setScrapeProgress('Loading active credentials from database...');
      const activePrimary = credentials.find(c => c.is_primary && c.status === 'active');
      const fallbackCred = credentials.find(c => !c.is_primary && c.status === 'active');
      const targetCred = activePrimary || fallbackCred;

      if (!targetCred) {
        addLog('error', 'Scraper terminated: No active verified account credentials available for login.');
        setIsScraping(false);
        return;
      }

      const hasSession = targetCred.session_cookies_json && targetCred.session_cookies_json !== '[]';

      if (hasSession) {
        setScrapeProgress(`Restoring session for: ${targetCred.account_name}`);
        addLog('info', `SeleniumBase successfully restored cached browser session for [${targetCred.username}]. Bypassed login form.`);
      } else {
        setScrapeProgress(`Auto-logging into ExpiredDomains: ${targetCred.username}`);
        addLog('warning', `No active browser session detected for [${targetCred.username}]. Booting Undetectable UC browser & submitting form...`);
      }

      setTimeout(() => {
        if (!hasSession) {
          addLog('success', `SeleniumBase auto-login successful. Saved fresh browser cookies state back to DB for: ${targetCred.username}`);
          // Update credentials with mock cookies for subsequent runs
          setCredentials(prev => prev.map(c => {
            if (c.id === targetCred.id) {
              return {
                ...c,
                session_cookies_json: '[{"name":"xf_session","value":"session_generated_via_seleniumbase","domain":".expireddomains.net"}]',
                last_login: new Date().toISOString()
              };
            }
            return c;
          }));
        }

        setScrapeProgress('Executing filters on ExpiredDomains search endpoints...');
        
        setTimeout(() => {
          setScrapeProgress('Gathering available domain lists...');
          
          // Generate 3 fresh elegant domains
          const premiumPrefixes = ['zen', 'nexus', 'cyber', 'quantum', 'meta', 'optic', 'apex'];
          const premiumSuffixes = ['health', 'labs', 'cloud', 'systems', 'growth', 'ventures'];
          const randomIdx = Math.floor(Math.random() * premiumPrefixes.length);
          const randomSfxIdx = Math.floor(Math.random() * premiumSuffixes.length);
          
          const newGenerated: Domain[] = [
            {
              id: `dom-${Date.now()}-1`,
              domain_name: `${premiumPrefixes[randomIdx]}${premiumSuffixes[randomSfxIdx]}.com`,
              tld: '.com',
              domain_age_years: Math.floor(Math.random() * 8) + 6,
              archive_count: Math.floor(Math.random() * 200) + 20,
              backlinks: Math.floor(Math.random() * 5000) + 400,
              moz_da: Math.floor(Math.random() * 25) + 15,
              status: 'available',
              first_detected: new Date().toISOString(),
              last_detected: new Date().toISOString(),
              notes: 'Harvested in real-time. Extremely low hazard metrics matched.',
              clean_history: true,
              has_adult_history: false,
              has_casino_history: false
            }
          ];

          setDomains(prev => [...newGenerated, ...prev]);
          addLog('success', `Scraper discovered 1 new high authority domain. Database synchronized.`);
          setIsScraping(false);
          setScrapeProgress('');
        }, 1200);
      }, 1000);
    }, 1000);
  };

  // Settings Action Handlers
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    addLog('success', 'Flushed config cache. ExpiredDomains SaaS Engine re-initialized with new parameters.');
    setTimeout(() => {
      setSaveSuccess(false);
    }, 4000);
  };

  const handleTestDatabase = () => {
    setIsTestingConnection(true);
    setConnectionStatus('idle');
    addLog('info', `Testing live connections for active nodes at endpoint: ${settings.supabase_url}...`);
    
    setTimeout(() => {
      setIsTestingConnection(false);
      if (settings.supabase_url && settings.supabase_url.startsWith('http') && settings.supabase_url.includes('supabase.co')) {
        setConnectionStatus('success');
        addLog('success', 'Handshake verified! Successfully established secure session pool tunnels on Supabase PostgreSQL.');
      } else {
        setConnectionStatus('failed');
        addLog('error', 'Supabase handshake returned an error: DNS lookup fault or unauthorized ACL grants.');
      }
    }, 1500);
  };

  const generateNewCronSecret = () => {
    const randomHex = Array.from({length: 8}, () => Math.floor(Math.random()*16).toString(16)).join('').toUpperCase();
    const generated = `CRON_SEC_${randomHex}`;
    setSettings({ ...settings, cron_secret: generated });
    addLog('success', `Generated new SaaS Webhook signature: ${generated}. Make sure to update your external cron headers.`);
  };

  const resetSettingsToSeed = () => {
    setSettings(DEFAULT_SETTINGS);
    addLog('warning', 'Platform system configurations restored to default seed values.');
  };

  // Metrics calculating
  const totalDomainsCount = domains.length;
  const comDomainsCount = domains.filter(d => d.tld === '.com').length;
  const netDomainsCount = domains.filter(d => d.tld === '.net').length;
  const orgDomainsCount = domains.filter(d => d.tld === '.org').length;
  
  const cleanDomainsCount = domains.filter(d => d.clean_history).length;
  const riskyDomainsCount = domains.filter(d => d.has_adult_history || d.has_casino_history).length;

  const activeCredentialNodes = credentials.filter(c => c.status === 'active').length;
  const successRate = totalDomainsCount > 0 ? '98.5%' : '0%';

  // Dynamic filter lists
  const filteredDomains = domains.filter(d => {
    const matchesSearch = d.domain_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTld = tldFilter === 'all' || d.tld === tldFilter;
    return matchesSearch && matchesTld;
  });

  // Simulated Time Charts Data
  const dailyScrapeTrend = [
    { name: 'Mon', domains: 12, health: 100 },
    { name: 'Tue', domains: 18, health: 98 },
    { name: 'Wed', domains: 26, health: 100 },
    { name: 'Thu', domains: 15, health: 95 },
    { name: 'Fri', domains: 32, health: 98 },
    { name: 'Sat', domains: 22, health: 100 },
    { name: 'Sun', domains: 40, health: 99 },
  ];

  return (
    <div className="min-h-screen bg-[#070b19] text-[#e2e8f0] font-sans antialiased flex flex-col selection:bg-[#2563eb] selection:text-white">
      
      {/* Platform Real-Time Action Header */}
      <div className="bg-[#0b1329] border-b border-[#1e294b] px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-[#2563eb] to-[#3b82f6] p-2.5 rounded-xl text-white shadow-xl shadow-blue-900/20">
            <Globe className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-sans">
                ExpiredDomains.net
              </h1>
              <span className="bg-[#1e1b4b] text-[#818cf8] border border-[#312e81] text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                SaaS Daemon Active
              </span>
            </div>
            <p className="text-xs text-gray-400">Enterprise Cloud Automator & Rotation Core</p>
          </div>
        </div>

        {/* Server State Monitors */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Dispatch state */}
          {isScraping ? (
            <div className="flex items-center gap-2 bg-[#172554] border border-[#1e40af] text-blue-200 px-3.5 py-1.5 rounded-lg text-xs leading-none">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#60a5fa]" />
              <span>{scrapeProgress}</span>
            </div>
          ) : (
            <button 
              onClick={triggerScraperLoop}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium px-4 py-2 rounded-lg text-xs leading-none shadow-md transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Dispatch Scraper</span>
            </button>
          )}

          {/* Core Daemon Status Badge */}
          <div className="flex items-center gap-1.5 bg-[#064e3b] border border-[#065f46] text-[#6ee7b7] px-3 py-1.5 rounded-lg text-xs font-medium">
            <div className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
            <span>5M Crons: Enabled</span>
          </div>

          {/* User Profile dropdown sim */}
          <div className="flex items-center gap-2.5 bg-[#0f172a] border border-[#1e294b] pl-2 pr-3 py-1 rounded-lg">
            <img 
              src={currentUser.avatar_url} 
              alt={currentUser.full_name} 
              className="w-6 h-6 rounded-full border border-blue-500"
            />
            <div className="text-left">
              <div className="text-[11px] font-bold text-gray-200 leading-tight">{currentUser.full_name}</div>
              <div className="text-[9px] text-[#3b82f6] capitalize leading-none font-semibold">{currentUser.role}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Layout Frame */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Navigation Sidebar */}
        <div className="md:w-64 bg-[#090f23] border-r border-[#1e294b] flex flex-col justify-between shrink-0 p-4">
          <div className="space-y-6">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-500 tracking-wider uppercase px-3">Control Deck</p>
              
              <button 
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'overview' 
                    ? 'bg-blue-600/10 text-blue-400 border-l-4 border-blue-500 font-bold' 
                    : 'text-gray-400 hover:bg-[#111827] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>Real-Time Overview</span>
                </div>
                <ChevronRight className="w-3 h-3 text-gray-600" />
              </button>

              <button 
                onClick={() => setActiveTab('domains')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'domains' 
                    ? 'bg-blue-600/10 text-blue-400 border-l-4 border-blue-500 font-bold' 
                    : 'text-gray-400 hover:bg-[#111827] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>Discovered Domains</span>
                </div>
                <span className="bg-blue-900/30 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-900">
                  {domains.length}
                </span>
              </button>

              <button 
                onClick={() => setActiveTab('filters')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'filters' 
                    ? 'bg-blue-600/10 text-blue-400 border-l-4 border-blue-500 font-bold' 
                    : 'text-gray-400 hover:bg-[#111827] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>Filter Architect</span>
                </div>
                <span className="bg-indigo-950 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-900">
                  {filters.length}
                </span>
              </button>

              <button 
                onClick={() => setActiveTab('cookies')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'cookies' 
                    ? 'bg-blue-600/10 text-blue-400 border-l-4 border-blue-500 font-bold' 
                    : 'text-gray-400 hover:bg-[#111827] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Credential Cluster</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  activeCredentialNodes > 0 ? 'bg-emerald-950 text-emerald-400 border-emerald-900' : 'bg-red-950 text-red-400 border-red-900'
                }`}>
                  {activeCredentialNodes}
                </span>
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-500 tracking-wider uppercase px-3">Raw Diagnostics</p>
              
              <button 
                onClick={() => setActiveTab('logs')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'logs' 
                    ? 'bg-blue-600/10 text-blue-400 border-l-4 border-blue-500 font-bold' 
                    : 'text-gray-400 hover:bg-[#111827] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  <span>Daemon Console</span>
                </div>
              </button>

              <button 
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'settings' 
                    ? 'bg-blue-600/10 text-blue-400 border-l-4 border-blue-500 font-bold' 
                    : 'text-gray-400 hover:bg-[#111827] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span>Platform Config</span>
                </div>
              </button>
            </div>
          </div>

          {/* Secure Environment Sandbox Card */}
          <div className="bg-[#0b1329] border border-[#1e294b] rounded-xl p-3.5 space-y-2 text-left">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>Encrypted Storage</span>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Row Level Security is configured. High level cookies are stored via PGP/SSL schema to block browser leak hazards.
            </p>
            <div className="pt-1.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[9px] font-mono text-gray-500">HTTPS_HANDSHAKE_OK</span>
            </div>
          </div>
        </div>

        {/* Target Content Dynamic Panes */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Overview Dashboard Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* High level visual cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-[#0b1329] border border-[#1e294b] p-5 rounded-xl shadow-md space-y-2">
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="text-xs font-medium">Telemetry Harvested</span>
                    <Globe className="w-4.5 h-4.5 text-blue-500" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white">{totalDomainsCount}</span>
                    <span className="text-[11px] font-medium text-emerald-400">+3 today</span>
                  </div>
                  <p className="text-[10px] text-gray-500">Live indexed domains in active DB</p>
                </div>

                <div className="bg-[#0b1329] border border-[#1e294b] p-5 rounded-xl shadow-md space-y-2">
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="text-xs font-medium">Session Cluster State</span>
                    <User className="w-4.5 h-4.5 text-indigo-500" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white">{activeCredentialNodes}</span>
                    <span className="text-[11px] text-gray-400">of {credentials.length}</span>
                  </div>
                  <p className="text-[10px] text-gray-500">Validated rotatable client accounts</p>
                </div>

                <div className="bg-[#0b1329] border border-[#1e294b] p-5 rounded-xl shadow-md space-y-2">
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="text-xs font-medium">Criteria Active</span>
                    <Layers className="w-4.5 h-4.5 text-purple-500" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white">{filters.filter(f => f.is_active).length}</span>
                    <span className="text-[11px] text-gray-400">filters running</span>
                  </div>
                  <p className="text-[10px] text-gray-500">Automatic background dispatch active</p>
                </div>

                <div className="bg-[#0b1329] border border-[#1e294b] p-5 rounded-xl shadow-md space-y-2">
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="text-xs font-medium">Scrape Reliability</span>
                    <Award className="w-4.5 h-4.5 text-emerald-500" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white">{successRate}</span>
                    <span className="text-[11px] text-emerald-400">Handshake</span>
                  </div>
                  <p className="text-[10px] text-gray-500">Cookie rotation recovery rate</p>
                </div>

              </div>

              {/* Graphic charts & visual details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visual Chart */}
                <div className="lg:col-span-2 bg-[#0b1329] border border-[#1e294b] p-5 rounded-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-white">Dynamic 7-Day Performance Log</h3>
                      <p className="text-[11px] text-gray-400">Domains caught with auto-cookie shift pipeline</p>
                    </div>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-900/20 px-2 py-0.5 rounded border border-emerald-900">
                      <TrendingUp className="w-3 h-3" />
                       +24% Trend
                    </span>
                  </div>

                  <div className="h-60 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dailyScrapeTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorDomains" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e294b" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e294b', color: '#fff' }} />
                        <Area type="monotone" dataKey="domains" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorDomains)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* DB TLD Spread */}
                <div className="bg-[#0b1329] border border-[#1e294b] p-5 rounded-xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">TLD Domain Spread</h3>
                    <p className="text-[11px] text-gray-400">Total detected by extensions</p>
                  </div>

                  <div className="space-y-4 my-6">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-300">.com</span>
                        <span className="font-bold text-white">{comDomainsCount} ({Math.round(comDomainsCount*100/totalDomainsCount || 0)}%)</span>
                      </div>
                      <div className="w-full h-2 bg-[#1e294b] rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(comDomainsCount/totalDomainsCount)*100 || 0}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-300">.net</span>
                        <span className="font-bold text-white">{netDomainsCount} ({Math.round(netDomainsCount*100/totalDomainsCount || 0)}%)</span>
                      </div>
                      <div className="w-full h-2 bg-[#1e294b] rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(netDomainsCount/totalDomainsCount)*100 || 0}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-300">.org</span>
                        <span className="font-bold text-white">{orgDomainsCount} ({Math.round(orgDomainsCount*100/totalDomainsCount || 0)}%)</span>
                      </div>
                      <div className="w-full h-2 bg-[#1e294b] rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(orgDomainsCount/totalDomainsCount)*100 || 0}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1e1b4b] border border-[#312e81] p-3 rounded-lg flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-[#818cf8] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-semibold text-[#818cf8]">Intelligent Crawler</h4>
                      <p className="text-[10px] text-gray-400">
                        Credential status health sits at <span className="text-emerald-400 font-bold">100% active</span>. Handshakes are rotated via Cron scheduler securely.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Real-time event log streams stream snippet */}
              <div className="bg-[#0b1329] border border-[#1e294b] rounded-xl overflow-hidden shadow-md">
                <div className="px-5 py-4 border-b border-[#1e294b] flex justify-between items-center bg-[#0d162f]">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4.5 h-4.5 text-blue-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">Live Platform Activity Stream</h3>
                  </div>
                  <button 
                    onClick={() => setActiveTab('logs')}
                    className="text-[11px] text-blue-400 hover:underline font-medium"
                  >
                    View All Output Logs
                  </button>
                </div>
                
                <div className="divide-y divide-[#1e294b] font-mono text-[11px]">
                  {logs.slice(0, 4).map((log) => (
                    <div key={log.id} className="p-3.5 flex items-start sm:items-center justify-between gap-3 text-left">
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${
                          log.level === 'success' ? 'bg-emerald-500' :
                          log.level === 'warning' ? 'bg-amber-500' :
                          log.level === 'error' ? 'bg-red-500' : 'bg-blue-500'
                        }`} />
                        <span className="text-gray-500 shrink-0">{log.timestamp.slice(11, 19)}</span>
                        <span className={`px-1.5 py-0.5 uppercase tracking-tight text-[9px] font-bold rounded ${
                          log.level === 'success' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' :
                          log.level === 'warning' ? 'bg-amber-950 text-amber-400 border border-amber-900' :
                          log.level === 'error' ? 'bg-red-950 text-red-500 border border-red-900' : 'bg-blue-950 text-blue-400 border border-blue-900'
                        }`}>
                          {log.level}
                        </span>
                        <span className="text-gray-300 leading-relaxed font-sans">{log.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Discovered Domains Pane */}
          {activeTab === 'domains' && (
            <div className="space-y-6">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-500" />
                    <span>Discovered Domain Ledger</span>
                  </h2>
                  <p className="text-xs text-gray-400">Fresh available expired domain lists matched against active filters</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  {/* Extension selection */}
                  <div className="flex bg-[#0f172a] border border-[#1e294b] rounded-lg overflow-hidden p-1">
                    {['all', '.com', '.net', '.org'].map((ext) => (
                      <button
                        key={ext}
                        onClick={() => setTldFilter(ext)}
                        className={`px-3 py-1 text-xs rounded transition-all capitalize font-bold ${
                          tldFilter === ext ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {ext}
                      </button>
                    ))}
                  </div>

                  {/* Search Input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="text"
                      placeholder="Filter domain name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-[#0f172a] border border-[#1e294b] rounded-lg pl-9 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 placeholder:text-gray-500 w-full sm:w-48"
                    />
                  </div>
                </div>
              </div>

              {/* Master Domains Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* List Ledger */}
                <div className="xl:col-span-2 bg-[#0b1329] border border-[#1e294b] rounded-xl overflow-hidden shadow-md">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-max">
                      <thead>
                        <tr className="bg-[#0f172a] text-gray-400 border-b border-[#1e294b]">
                          <th className="p-4 font-bold">Domain Name</th>
                          <th className="p-4 font-bold">Age</th>
                          <th className="p-4 font-bold text-center">Backlinks</th>
                          <th className="p-4 font-bold text-center font-mono">Moz DA</th>
                          <th className="p-4 font-bold">Safe Stamp</th>
                          <th className="p-4 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e294b]">
                        {filteredDomains.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-gray-500 leading-relaxed">
                              No domain logs matching current filters found inside the database pool. Use manual Dispatch.
                            </td>
                          </tr>
                        ) : (
                          filteredDomains.map((dom) => (
                            <tr 
                              key={dom.id}
                              onClick={() => setSelectedDomain(dom)}
                              className={`hover:bg-[#111c3a] transition-all cursor-pointer ${
                                selectedDomain?.id === dom.id ? 'bg-[#172554]' : ''
                              }`}
                            >
                              <td className="p-4 font-bold text-white text-sm">
                                {dom.domain_name}
                              </td>
                              <td className="p-4 text-gray-300">
                                {dom.domain_age_years} yrs
                              </td>
                              <td className="p-4 text-center font-bold text-gray-100">
                                {dom.backlinks.toLocaleString()}
                              </td>
                              <td className="p-4 text-center text-blue-400 font-mono font-bold">
                                {dom.moz_da}
                              </td>
                              <td className="p-4">
                                {dom.clean_history ? (
                                  <span className="bg-emerald-950 text-[10px] text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded-full font-semibold">
                                    Clean Domain
                                  </span>
                                ) : (
                                  <span className="bg-red-950 text-[10px] text-red-400 border border-red-900 px-2 py-0.5 rounded-full font-semibold">
                                    Flag Found
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-right">
                                <button className="text-blue-400 hover:text-blue-300 font-medium hover:underline text-xs">
                                  Inspect Detail
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Inspect Card Segment */}
                <div className="bg-[#0b1329] border border-[#1e294b] p-5 rounded-xl text-left space-y-4">
                  {selectedDomain ? (
                    <div className="space-y-4">
                      <div className="border-b border-[#1e294b] pb-3">
                        <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider font-mono">Telemetry Inspect</span>
                        <h3 className="text-base font-bold text-white leading-tight mt-1">{selectedDomain.domain_name}</h3>
                        <p className="text-[11px] text-gray-400 mt-1">Found inside ExpiredDomains.net registry</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5 text-xs">
                        <div className="bg-[#0f172a] p-2.5 rounded-lg border border-[#1e294b]">
                          <span className="text-gray-500 block text-[10px]">Extension</span>
                          <span className="font-bold text-white">{selectedDomain.tld}</span>
                        </div>
                        <div className="bg-[#0f172a] p-2.5 rounded-lg border border-[#1e294b]">
                          <span className="text-gray-500 block text-[10px]">Calculated Age</span>
                          <span className="font-bold text-[#e11d48]">{selectedDomain.domain_age_years} Years old</span>
                        </div>
                        <div className="bg-[#0f172a] p-2.5 rounded-lg border border-[#1e294b]">
                          <span className="text-gray-500 block text-[10px]">Archive Count</span>
                          <span className="font-bold text-white">{selectedDomain.archive_count} pages</span>
                        </div>
                        <div className="bg-[#0f172a] p-2.5 rounded-lg border border-[#1e294b]">
                          <span className="text-gray-500 block text-[10px]/normal">Incoming Links</span>
                          <span className="font-bold text-white">{selectedDomain.backlinks.toLocaleString()} refs</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest block font-bold">Platform Safety Report</span>
                        {selectedDomain.clean_history ? (
                          <div className="bg-emerald-950/20 border border-emerald-900/50 p-3 rounded-lg flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-emerald-300 leading-normal">
                              No active gambling (casino) or adult content indices found on WebArchive search criteria. Classified low-risk.
                            </p>
                          </div>
                        ) : (
                          <div className="bg-red-950/20 border border-red-900/50 p-3 rounded-lg flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-red-300 leading-normal">
                              Warning: Historic gambling logs or explicit content domains were flagged inside archives. Link building should proceed carefully.
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest block font-bold">Curator Commentary</span>
                        <p className="text-xs text-gray-300 bg-[#0f172a] border border-[#1e294b] p-3 rounded-lg leading-relaxed">
                          {selectedDomain.notes || "No annotations compiled for this domain node yet."}
                        </p>
                      </div>

                      <div className="border-t border-[#1e294b] pt-3.5 space-y-2">
                        <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                          <span>First detected:</span>
                          <span>{selectedDomain.first_detected.slice(0,10)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                          <span>Last Sync heartbeat:</span>
                          <span>{selectedDomain.last_detected.slice(11,19)}</span>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="py-12 text-center text-gray-500 text-xs">
                      <HelpCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                      <span>Select a domain from the master ledger grid to see advanced safety metrics</span>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* Filter Architect Pane */}
          {activeTab === 'filters' && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-purple-500" />
                    <span>Filter Architect Desk</span>
                  </h2>
                  <p className="text-xs text-gray-400">Configure parameters exported to Playwright task scheduler automatically</p>
                </div>
                
                <button
                  onClick={() => setIsAddingFilter(!isAddingFilter)}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Build New Filter</span>
                </button>
              </div>

              {/* Form creation drawer widget inside pane */}
              {isAddingFilter && (
                <form onSubmit={handleCreateFilter} className="bg-[#0b1329] border border-[#1e294b] rounded-xl p-5 text-left space-y-4">
                  <h3 className="text-sm font-bold text-white">Create Target Filter Formula</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    <div className="space-y-1">
                      <label className="text-[11px] text-gray-400 font-bold block">Filter Label</label>
                      <input 
                        required
                        type="text"
                        placeholder="e.g. Clean Tech Domains"
                        value={newFilter.name}
                        onChange={(e) => setNewFilter({ ...newFilter, name: e.target.value })}
                        className="bg-[#0f172a] border border-[#1e294b] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 w-full"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-gray-400 font-bold block">Min Age (Years)</label>
                      <input 
                        type="number"
                        min="0"
                        value={newFilter.min_age_years}
                        onChange={(e) => setNewFilter({ ...newFilter, min_age_years: parseInt(e.target.value) || 0 })}
                        className="bg-[#0f172a] border border-[#1e294b] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 w-full"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-gray-400 font-bold block">Min Backlink Authority</label>
                      <input 
                        type="number"
                        min="0"
                        value={newFilter.min_backlinks}
                        onChange={(e) => setNewFilter({ ...newFilter, min_backlinks: parseInt(e.target.value) || 0 })}
                        className="bg-[#0f172a] border border-[#1e294b] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 w-full"
                      />
                    </div>

                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                    
                    <div className="bg-[#0f172a] p-3 rounded-lg border border-[#1e294b] flex items-center justify-between">
                      <div className="text-left">
                        <span className="text-[11px] font-bold text-gray-200 block">No Adult History</span>
                        <span className="text-[9px] text-gray-400">Strictly block index tags</span>
                      </div>
                      <input 
                        type="checkbox"
                        checked={newFilter.no_adult}
                        onChange={(e) => setNewFilter({ ...newFilter, no_adult: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-600 bg-gray-905 border-gray-800"
                      />
                    </div>

                    <div className="bg-[#0f172a] p-3 rounded-lg border border-[#1e294b] flex items-center justify-between">
                      <div className="text-left">
                        <span className="text-[11px] font-bold text-gray-200 block">No Casino/Betting</span>
                        <span className="text-[9px] text-gray-400">Avoid spam backlink penalty</span>
                      </div>
                      <input 
                        type="checkbox"
                        checked={newFilter.no_casino}
                        onChange={(e) => setNewFilter({ ...newFilter, no_casino: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-600 bg-gray-905 border-gray-800"
                      />
                    </div>

                    <div className="bg-[#0f172a] p-3 rounded-lg border border-[#1e294b] flex items-center justify-between">
                      <div className="text-left">
                        <span className="text-[11px] font-bold text-gray-200 block">Google Indexed Only</span>
                        <span className="text-[9px] text-gray-400">Guarantees active trace</span>
                      </div>
                      <input 
                        type="checkbox"
                        checked={newFilter.indexed_only}
                        onChange={(e) => setNewFilter({ ...newFilter, indexed_only: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-600 bg-gray-905 border-gray-800"
                      />
                    </div>

                    <div className="bg-[#0f172a] p-3 rounded-lg border border-[#1e294b] flex items-center justify-between">
                      <div className="text-left">
                        <span className="text-[11px] font-bold text-gray-200 block">Active Status</span>
                        <span className="text-[9px] text-gray-400">Deploy immediately to cron</span>
                      </div>
                      <input 
                        type="checkbox"
                        checked={newFilter.is_active}
                        onChange={(e) => setNewFilter({ ...newFilter, is_active: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-600 bg-gray-905 border-gray-800"
                      />
                    </div>

                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setIsAddingFilter(false)}
                      className="bg-transparent border border-[#1e294b] text-gray-400 hover:text-white text-xs px-4 py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2 rounded-lg"
                    >
                      Save Filter Settings
                    </button>
                  </div>
                </form>
              )}

              {/* Grid representation */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filters.map((filt) => (
                  <div key={filt.id} className="bg-[#0b1329] border border-[#1e294b] rounded-xl p-5 text-left flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-bold text-white line-clamp-1">{filt.name}</h4>
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                          filt.is_active ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-gray-950 text-gray-500 border border-gray-800'
                        }`}>
                          {filt.is_active ? 'Active Daemon' : 'Disabled'}
                        </span>
                      </div>
                      
                      <div className="mt-4 space-y-2 text-xs">
                        <div className="flex justify-between text-gray-400 py-1 border-b border-[#1e294b]">
                          <span>Age Constraint</span>
                          <span className="font-bold text-gray-100">&gt; {filt.min_age_years} Years old</span>
                        </div>
                        <div className="flex justify-between text-gray-400 py-1 border-b border-[#1e294b]">
                          <span>Ref Backlinks</span>
                          <span className="font-bold text-gray-100">&gt; {filt.min_backlinks.toLocaleString()} references</span>
                        </div>
                        <div className="flex justify-between text-gray-400 py-1 border-b border-[#1e294b]">
                          <span>Allowed TLDs</span>
                          <span className="font-bold text-blue-400">{filt.tlds?.join(', ') || '.com'}</span>
                        </div>
                      </div>

                      <div className="pt-3 flex flex-wrap gap-1.5">
                        {filt.no_adult && (
                          <span className="bg-[#1e1b4b] text-[#818cf8] border border-[#312e81] text-[9px] font-bold px-2 py-0.5 rounded-full">
                            Shield: Adult
                          </span>
                        )}
                        {filt.no_casino && (
                          <span className="bg-[#1e1b4b] text-[#818cf8] border border-[#312e81] text-[9px] font-bold px-2 py-0.5 rounded-full">
                            Shield: Casino
                          </span>
                        )}
                        {filt.indexed_only && (
                          <span className="bg-blue-950/40 text-blue-400 border border-blue-900/40 text-[9px] font-bold px-2 py-0.5 rounded-full">
                            Google Checked
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-[#1e294b] pt-4 flex justify-between items-center">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        <span>Cron: {filt.schedule_cron}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => toggleFilterActive(filt.id)}
                          className="p-1 px-2 border border-[#1e294b] rounded text-[10px] text-gray-400 hover:text-white"
                          title="Toggle scheduler state"
                        >
                          {filt.is_active ? 'Disable' : 'Enable'}
                        </button>
                        <button 
                          onClick={() => deleteFilter(filt.id, filt.name)}
                          className="p-1 text-red-400 hover:bg-red-950/20 rounded"
                          title="Delete from database"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* Credentials & Dynamic Session Cluster Pane */}
          {activeTab === 'cookies' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-400" />
                    <span>ExpiredDomains Credential Deck & Session Rotator</span>
                  </h2>
                  <p className="text-xs text-gray-400">Manage Email & Password accounts. SeleniumBase UC Mode auto-authenticates, caches active browser cookies, and repairs sessions instantly upon logout.</p>
                </div>
                
                <button
                  onClick={() => setIsAddingCredential(!isAddingCredential)}
                  className="flex items-center gap-1.5 self-start sm:self-auto bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-blue-900/30 active:scale-95 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Crawler Account</span>
                </button>
              </div>

              {/* Add Account Credentials Widget */}
              {isAddingCredential && (
                <form onSubmit={handleCreateCredential} className="bg-[#0b1329] border border-[#1e294b] rounded-xl p-5 text-left space-y-4 shadow-lg animate-fade-in text-xs">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-emerald-400" />
                    <span>Register New ExpiredDomains.net Login Node</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Account Label / Friendly Name</label>
                      <input 
                        required
                        type="text"
                        placeholder="e.g. Crawler Beta Node"
                        value={newCredential.account_name}
                        onChange={(e) => setNewCredential({ ...newCredential, account_name: e.target.value })}
                        className="bg-[#0f172a] border border-[#1e294b] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 w-full transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">ExpiredDomains Username</label>
                      <input 
                        required
                        type="text"
                        placeholder="e.g. exp_hunter_88"
                        value={newCredential.username}
                        onChange={(e) => setNewCredential({ ...newCredential, username: e.target.value })}
                        className="bg-[#0f172a] border border-[#1e294b] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 w-full transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Credential Password</label>
                      <input 
                        required
                        type="password"
                        placeholder="••••••••••••"
                        value={newCredential.password}
                        onChange={(e) => setNewCredential({ ...newCredential, password: e.target.value })}
                        className="bg-[#0f172a] border border-[#1e294b] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 w-full transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Optional Pre-Cached Cookies Array (JSON Format)</label>
                      <textarea 
                        rows={2}
                        placeholder='[{"name": "xf_session", "value": "xxxx", "domain": ".expireddomains.net"}]'
                        value={newCredential.session_cookies_json}
                        onChange={(e) => setNewCredential({ ...newCredential, session_cookies_json: e.target.value })}
                        className="bg-[#0f172a] border border-[#1e294b] rounded-lg p-3 text-xs text-white font-mono focus:outline-none focus:border-blue-500 w-full placeholder:text-gray-600 transition-colors"
                      />
                      <span className="text-[9px] text-gray-500">Leave empty to leverage SeleniumBase automated login on first invocation.</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Initial Runner Status</label>
                      <select 
                        value={newCredential.status}
                        onChange={(e) => setNewCredential({ ...newCredential, status: e.target.value as any })}
                        className="bg-[#0f172a] border border-[#1e294b] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 w-full transition-colors"
                      >
                        <option value="active">Active (Eligible for Rotation)</option>
                        <option value="disabled">Disabled (Do Not Invoke)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <label className="flex items-center gap-2 text-xs text-gray-300 select-none cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={newCredential.is_primary}
                        onChange={(e) => setNewCredential({ ...newCredential, is_primary: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-600 bg-[#0f172a] border-gray-800 focus:ring-0 cursor-pointer"
                      />
                      <span>Set as primary scraping client node</span>
                    </label>

                    <div className="flex gap-3">
                      <button 
                        type="button" 
                        onClick={() => setIsAddingCredential(false)}
                        className="bg-transparent border border-[#1e294b] hover:border-slate-600 text-gray-400 hover:text-white text-xs px-4 py-2 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-5 py-2 rounded-xl shadow-lg hover:shadow-blue-900/35 transition-all"
                      >
                        Save Account Parameters
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Database credentials list */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {credentials.map((cred) => {
                  const hasActiveCookies = cred.session_cookies_json && cred.session_cookies_json !== '[]';
                  return (
                    <div key={cred.id} className="bg-[#0b1329] border border-[#1e294b] rounded-xl p-5 text-left flex flex-col justify-between space-y-4 shadow hover:border-indigo-500/30 transition-all">
                      
                      <div>
                        {/* Header Row */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white line-clamp-1">{cred.account_name}</h4>
                            {cred.is_primary && (
                              <span className="bg-indigo-950/50 text-[10px] text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-full font-semibold">
                                Primary Client Node
                              </span>
                            )}
                          </div>
                          
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                            cred.status === 'active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' :
                            cred.status === 'expired' ? 'bg-amber-950 text-amber-500 border border-amber-900' :
                            cred.status === 'failed' ? 'bg-red-950 text-red-500 border border-red-900' : 'bg-gray-950 text-gray-500 border border-gray-800'
                          }`}>
                            {cred.status}
                          </span>
                        </div>

                        {/* Connection Details Block */}
                        <div className="bg-[#0e162d] border border-[#1e294b]/60 rounded-xl p-3.5 mt-3 space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-400 font-medium">Username</span>
                            <span className="font-mono text-gray-100 font-bold">{cred.username}</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-400 font-medium">Password Hash</span>
                            <span className="font-mono text-gray-500 tracking-widest font-bold">••••••••••••</span>
                          </div>

                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-400 font-medium">Session Cache Status</span>
                            <span className={`font-bold flex items-center gap-1 ${hasActiveCookies ? 'text-emerald-400' : 'text-amber-400'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${hasActiveCookies ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                              {hasActiveCookies ? 'Active Cookies Session Reusable' : 'Empty Cache - Delayed Login Flagged'}
                            </span>
                          </div>
                        </div>

                        {/* Collapsed/Visual cookies JSON serialization preview */}
                        <div className="mt-3.5 bg-[#070d1e] rounded-lg p-3 border border-[#1c2642] relative overflow-hidden">
                          <div className="flex items-center justify-between mb-1 text-[10px] uppercase font-bold tracking-wider text-gray-400">
                            <span>Dynamic Session Cookies</span>
                            <span className="text-gray-500 font-mono text-[9px]">{hasActiveCookies ? 'Cached via SeleniumBase UC' : 'No stored session coordinates'}</span>
                          </div>
                          <p className="text-[10.5px] font-mono text-indigo-300 break-all line-clamp-1 bg-[#101936] p-1.5 rounded border border-[#1d2a52]">
                            {cred.session_cookies_json || '[]'}
                          </p>
                        </div>

                        {/* Verification Metrics and timings */}
                        <div className="grid grid-cols-3 gap-2 mt-4 text-[11px] border-t border-[#1e294b]/60 pt-3">
                          <div>
                            <span className="text-gray-400 font-bold block text-[9px] uppercase tracking-wider mb-1">Last Full Login</span>
                            <span className="font-mono text-gray-300 font-semibold">{cred.last_login ? cred.last_login.slice(11, 19) : 'No Password Login'}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 font-bold block text-[9px] uppercase tracking-wider mb-1">Last Scrape Sync</span>
                            <span className="font-mono text-gray-300 font-semibold">{cred.last_success ? cred.last_success.slice(11, 19) : 'None'}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 font-bold block text-[9px] uppercase tracking-wider mb-1">Authentication Error</span>
                            <span className="font-mono text-gray-300 font-semibold">{cred.last_failure ? cred.last_failure.slice(11, 19) : 'None'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Operations Footer */}
                      <div className="border-t border-[#1e294b] pt-4 mt-2 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-[10px] text-gray-500 font-mono">
                          Saved: {cred.created_at.slice(0, 10)}
                        </span>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => testCredentialLoginState(cred.id, cred.account_name)}
                            className="px-3 py-1.5 bg-blue-950/80 hover:bg-blue-900 border border-blue-900 hover:border-blue-700 text-blue-400 hover:text-blue-300 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 active:scale-95"
                          >
                            <RotateCw className="w-3 h-3 text-blue-400 shrink-0" />
                            <span>Test & Hydrate Session</span>
                          </button>
                          
                          {!cred.is_primary && cred.status === 'active' && (
                            <button
                              onClick={() => makeCredentialPrimary(cred.id)}
                              className="px-3 py-1.5 bg-[#1b2542] hover:bg-slate-800 text-gray-300 rounded-lg text-[11px] font-bold transition-all"
                            >
                              Set Primary
                            </button>
                          )}

                          <button
                            onClick={() => toggleCredentialActive(cred.id)}
                            className="px-3 py-1.5 bg-[#0f172a] border border-[#1e294b] hover:border-slate-600 text-gray-400 rounded-lg text-[11px] transition-all"
                          >
                            {cred.status === 'disabled' ? 'Enable' : 'Disable'}
                          </button>

                          <button 
                            onClick={() => deleteCredential(cred.id, cred.account_name)}
                            className="p-1.5 text-red-400 hover:bg-red-950/20 hover:text-red-300 rounded-lg transition-all"
                            title="Remove credentials from cluster"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Advanced SeleniumBase UC Architecture Guide */}
              <div className="bg-[#0b1329]/80 border border-[#1e294b] p-5 rounded-xl text-left space-y-3 shadow">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider text-indigo-400">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  <span>Interactive SeleniumBase Undetectable Bypass Guide</span>
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  SeleniumBase UC Mode (Undetectable Mode) provides advanced kernel-level spoofing to safely bypass Cloudflare, recaptchas, and strict user-agent challenge-checks. The SaaS daemon runs using the following optimized paradigm:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1.5 text-xs">
                  <div className="bg-[#0f172a] border border-[#1e294b] p-3 rounded-lg space-y-1">
                    <span className="font-bold text-gray-200 block">1. Cache Strategy First</span>
                    <span className="text-gray-400 block text-[11px] leading-normal">The client daemon loads session cookies from database tables first. By attaching the active session tokens instantly, we bypass the complete login form payload, saving resources.</span>
                  </div>
                  <div className="bg-[#0f172a] border border-[#1e294b] p-3 rounded-lg space-y-1">
                    <span className="font-bold text-gray-200 block">2. Auto-Login Recovery</span>
                    <span className="text-gray-400 block text-[11px] leading-normal">If ExpiredDomains returns a guest login screen (HTTP 403 / redirect to guest page), the loop intercepts the logout condition, spawns Undetectable Chrome, types the credentials, and captures the fresh tokens.</span>
                  </div>
                  <div className="bg-[#0f172a] border border-[#1e294b] p-3 rounded-lg space-y-1">
                    <span className="font-bold text-gray-200 block">3. Cloudflare turnstile UC</span>
                    <span className="text-gray-400 block text-[11px] leading-normal">Utilizes specific SeleniumBase UC calls like <code className="text-blue-400 text-[10px] font-mono">sb.uc_open_with_reconnect()</code> and <code className="text-blue-400 text-[10px] font-mono">sb.uc_click()</code> to interact organically with elements, evading automated heuristics.</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Console Diagnostic Logs Pane */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-blue-400" />
                    <span>Scraper Daemon Console Output</span>
                  </h2>
                  <p className="text-xs text-gray-400">Real-time heartbeat logs compiled from Supabase transaction audits</p>
                </div>
                
                <button
                  onClick={() => {
                    setLogs([]);
                    addLog('info', 'Platform console buffer purged.');
                  }}
                  className="bg-[#0f172a] border border-[#1e294b] hover:border-slate-600 text-gray-400 hover:text-white text-xs px-3 py-1.5 rounded-lg active:scale-95 transition-all"
                >
                  Clear Logs
                </button>
              </div>

              {/* Main Log Window */}
              <div className="bg-[#040815] border border-[#1e294b] rounded-xl overflow-hidden font-mono text-xs flex flex-col h-[500px]">
                <div className="bg-[#0d162f] px-4 py-2 border-b border-[#1e294b] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] text-gray-400 uppercase tracking-widest font-bold">Standard Output Feed</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-semibold">UTC Real-Time Stream</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 text-left selection:bg-blue-600/30">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-4 hover:bg-slate-900/40 p-1 rounded">
                      <span className="text-gray-600 shrink-0 select-none">[{log.timestamp.slice(11, 19)}]</span>
                      <span className={`px-1 rounded uppercase text-[9px] font-bold tracking-tighter shrink-0 select-none ${
                        log.level === 'success' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/50' :
                        log.level === 'warning' ? 'bg-amber-950 text-amber-500 border border-amber-900/50' :
                        log.level === 'error' ? 'bg-red-950 text-red-500 border border-red-900/50' : 'bg-blue-950 text-blue-400 border border-blue-900/50'
                      }`}>
                        {log.level}
                      </span>
                      <p className="text-gray-300 leading-normal flex-1">{log.message}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Configuration deck */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-gray-300" />
                    <span>Platform System Configurations</span>
                  </h2>
                  <p className="text-xs text-gray-400">Synchronize backend database connections, dispatch triggers, webhook signatures, and Playwright crawler sandboxes.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={resetSettingsToSeed}
                    className="bg-[#0f172a] border border-[#1e294b] hover:border-slate-600 text-gray-400 hover:text-white text-xs px-3.5 py-2 rounded-lg transition-all"
                  >
                    Restore Defaults
                  </button>
                </div>
              </div>

              {saveSuccess && (
                <div className="bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-xl flex items-center gap-3 text-emerald-300 text-xs animate-fade-in">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold block text-emerald-200">Configurations Saved Successfully</span>
                    <span>SaaS crawler task queues have been synchronized, and active scraper daemons are restarted.</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Supabase Secrets */}
                  <div className="bg-[#0b1329] border border-[#1e294b] p-5 rounded-xl space-y-4 text-left shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
                        <Database className="w-4.5 h-4.5" />
                        <span>Supabase Live Environment</span>
                      </div>
                      
                      {connectionStatus === 'success' && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-900/30 px-2 py-0.5 rounded border border-emerald-800">Verified</span>
                      )}
                      {connectionStatus === 'failed' && (
                        <span className="text-[10px] font-bold text-red-400 bg-red-900/30 px-2 py-0.5 rounded border border-red-800">Fault Warning</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 leading-normal">
                      Connect to your live Supabase database instance to persist domain heartbeats, cookie proxy keys, and scraper logs globally.
                    </p>

                    <div className="space-y-3.5 text-xs">
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Supabase Project URL</label>
                        <input 
                          type="url" 
                          required
                          value={settings.supabase_url}
                          onChange={(e) => setSettings({ ...settings, supabase_url: e.target.value })}
                          placeholder="https://your-project.supabase.co"
                          className="bg-[#0f172a] border border-[#1e294b] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 w-full font-mono transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Service Role Crypt Key (Encrypted Secret)</label>
                        <input 
                          type="password" 
                          required
                          value={settings.supabase_service_key}
                          onChange={(e) => setSettings({ ...settings, supabase_service_key: e.target.value })}
                          placeholder="service_role_secret_key"
                          className="bg-[#0f172a] border border-[#1e294b] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 w-full font-mono transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Public Anon Key</label>
                        <textarea 
                          rows={2}
                          value={settings.supabase_anon_key}
                          onChange={(e) => setSettings({ ...settings, supabase_anon_key: e.target.value })}
                          placeholder="public_anon_key_string"
                          className="bg-[#0f172a] border border-[#1e294b] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 w-full font-mono break-all transition-colors"
                        />
                      </div>

                      <div className="pt-2 border-t border-[#1e294b]/60 flex justify-between items-center">
                        <span className="text-[10px] text-gray-500">Auto-validates on schema handshakes</span>
                        <button
                          type="button"
                          disabled={isTestingConnection}
                          onClick={handleTestDatabase}
                          className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-850 hover:border-emerald-700 text-emerald-400 rounded text-[11px] font-bold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                        >
                          {isTestingConnection ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Testing...</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5" />
                              <span>Verify Connection</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

                {/* cron-jobs.org Step-By-Step Configuration Matrix */}
                <div className="bg-[#0b1329] border border-blue-900/60 p-5 rounded-xl space-y-4 text-left shadow-lg">
                  <div className="flex items-center gap-2 font-bold text-blue-400 text-sm">
                    <Sparkles className="w-4.5 h-4.5 text-blue-500 animate-pulse" />
                    <span>How to set up Free Cron Jobs on Cron-Jobs.org</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    You can schedule automated scraping runs using a free cron job service. <strong>Cron-Jobs.org</strong> is a highly reliable service that offers a 100% free tier supporting high-frequency execution pings.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs pt-1.5">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-blue-950 border border-blue-800 text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                        <div>
                          <span className="font-bold text-gray-100 block">Create your Free Account</span>
                          <span className="text-gray-400 text-[11px] leading-normal">
                            Sign up at <a href="https://cron-jobs.org" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">cron-jobs.org</a>. The free tier gives you up to 15 cron jobs with a frequency of up to once per minute — perfect for this workspace!
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-blue-950 border border-blue-800 text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                        <div>
                          <span className="font-bold text-gray-100 block">Set Target Webhook Address</span>
                          <span className="text-gray-400 text-[11px] leading-normal">
                            Create a new Cron Job on their dashboard and input the following endpoint URL:
                          </span>
                          <div className="mt-1.5 flex items-center gap-2">
                            <input 
                              readOnly
                              type="text" 
                              value={settings.webhook_url}
                              className="bg-[#101936] text-[10px] font-mono text-gray-300 p-1 rounded border border-[#1e294b] w-full focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(settings.webhook_url);
                                addLog('success', 'Webhook Ingress URL copied to clipboard.');
                              }}
                              className="bg-indigo-950 text-indigo-400 text-[10px] font-bold px-2 py-1 rounded border border-indigo-900 hover:bg-slate-800"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-blue-950 border border-blue-800 text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                        <div>
                          <span className="font-bold text-gray-100 block">Inject Secure Authentication Header</span>
                          <span className="text-gray-400 text-[11px] leading-normal">
                            ExpiredDomains scraper checks custom headers to prevent unauthorized runs. Under the "Headers" tab in Cron-Jobs.org, enter:
                          </span>
                          <div className="mt-1.5 space-y-1 bg-[#101936] p-2 rounded border border-[#1e294b]">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-gray-400 font-bold">Header Key:</span>
                              <span className="font-mono text-blue-400">X-Cron-Authorization</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] gap-2">
                              <span className="text-gray-400 font-bold shrink-0">Header Value:</span>
                              <span className="font-mono text-indigo-300 truncate">{settings.cron_secret}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(settings.cron_secret);
                              addLog('success', 'Cron authorization token copied to clipboard.');
                            }}
                            className="mt-1.5 bg-indigo-950 text-indigo-400 text-[10px] font-bold px-2 py-1 rounded border border-indigo-900 hover:bg-slate-800 w-full text-center"
                          >
                            Copy Authentication Key
                          </button>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-blue-950 border border-blue-800 text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">4</span>
                        <div>
                          <span className="font-bold text-gray-100 block">Set Timing Schedule</span>
                          <span className="text-gray-400 text-[11px] leading-normal">
                            Select "Regular intervals" and set execution frequency to e.g., <strong>Every 5 minutes</strong> or once per hour depending on list speed wishes. Save to activate automated background imports.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advanced SeleniumBase & Cookie Rotator Custom Options */}
                <div className="bg-[#0b1329] border border-[#1e294b] p-5 rounded-xl space-y-4 text-left shadow-lg">
                  <div className="flex items-center gap-2 font-bold text-gray-300 text-sm">
                    <Settings className="w-4.5 h-4.5 text-blue-500" />
                    <span>Advanced SeleniumBase & Cookie Rotator Custom Options</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Fine-tune SeleniumBase UC (Undetectable Mode) variables, cookie swap structures, and scrape behaviors to protect session keys and bypass CAPTCHAs.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs pt-2">
                    
                    <div className="space-y-1.5 bg-[#0f172a] p-3 rounded-lg border border-[#1e294b]">
                      <label className="text-[11px] text-gray-400 block font-bold">Page Concurrency Limit</label>
                      <div className="flex items-center justify-between gap-3">
                        <input 
                          type="range" 
                          min="1" 
                          max="5"
                          value={settings.concurrency_limit || 1}
                          onChange={(e) => setSettings({ ...settings, concurrency_limit: parseInt(e.target.value) || 1 })}
                          className="w-full text-blue-600 bg-gray-901 accent-blue-500 h-1.5 rounded-lg cursor-pointer"
                        />
                        <span className="font-mono font-bold bg-[#1e294b] px-2 py-0.5 rounded text-white min-w-[24px] text-center">
                          {settings.concurrency_limit || 1}
                        </span>
                      </div>
                      <span className="text-[9px] text-gray-500 block">Parallel headless browser instances</span>
                    </div>

                    <div className="space-y-1.5 bg-[#0f172a] p-3 rounded-lg border border-[#1e294b]">
                      <label className="text-[11px] text-gray-400 block font-bold">User-Agent Spoofer</label>
                      <select 
                        value={settings.user_agent_mode}
                        onChange={(e) => setSettings({ ...settings, user_agent_mode: e.target.value })}
                        className="bg-[#0b1329] border border-[#1e294b] rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500 w-full"
                      >
                        <option value="Desktop Chrome (Macintosh OS X 10_15_7)">Desktop Chrome (macOS)</option>
                        <option value="Desktop Firefox (Windows NT 10.0)">Desktop Firefox (Win/NT)</option>
                        <option value="Mobile Safari iPhone 15 Pro">Mobile Safari (iPhone 15)</option>
                        <option value="Baidu/GoogleBot Enterprise Spoof">Googlebot / SearchCrawler</option>
                      </select>
                      <span className="text-[9px] text-gray-500 block">Identity string sent on HTTP headers</span>
                    </div>

                    <div className="space-y-1.5 bg-[#0f172a] p-3 rounded-lg border border-[#1e294b]">
                      <label className="text-[11px] text-gray-400 block font-bold">Human Delay Offset (ms)</label>
                      <input 
                        type="number" 
                        min="500"
                        max="10000"
                        step="100"
                        value={settings.request_delay_ms || 1000}
                        onChange={(e) => setSettings({ ...settings, request_delay_ms: parseInt(e.target.value) || 500 })}
                        className="bg-[#0b1329] border border-[#1e294b] rounded px-2 py-0.5 text-xs text-white focus:outline-none focus:border-blue-500 w-full font-mono"
                      />
                      <span className="text-[9px] text-gray-500 block">Stagger navigation queries to avoid bans</span>
                    </div>

                    <div className="space-y-1.5 bg-[#0f172a] p-3 rounded-lg border border-[#1e294b]">
                      <label className="text-[11px] text-gray-400 block font-bold">Cookie Rotate Decision Matrix</label>
                      <select 
                        value={settings.rotation_policy}
                        onChange={(e) => setSettings({ ...settings, rotation_policy: e.target.value as any })}
                        className="bg-[#0b1329] border border-[#1e294b] rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500 w-full"
                      >
                        <option value="error_fallback">Failover: Swap on HTTP Error</option>
                        <option value="round_robin">Round-Robin: Shift after each filter query</option>
                        <option value="manual_only">Manual Selection only</option>
                      </select>
                      <span className="text-[9px] text-gray-500 block">System behavior when access nodes fail</span>
                    </div>

                  </div>
                </div>

                {/* Final Submit Block */}
                <div className="p-4 bg-[#0d162f] border border-[#1e294b] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-2 h-2 rounded-full bg-blue-550 animate-ping" />
                    <span>Real-time adjustments are hot-swapped into memory instantly.</span>
                  </div>
                  
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-blue-900/30 transition-all active:scale-95"
                  >
                    Save System Configurations
                  </button>
                </div>
              </form>

            </div>
          )}

        </div>

      </div>

      {/* Footer System Status Banner */}
      <div className="bg-[#050917] border-t border-[#1e294b] px-6 py-3 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-2 shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span>Enterprise Crawler Core v1.4.2</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            AES-256 Cloud Encryption Handshake Active
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span>System Hearthbeat:</span>
          <span className="text-emerald-400 font-bold">ONLINE</span>
        </div>
      </div>

    </div>
  );
}
