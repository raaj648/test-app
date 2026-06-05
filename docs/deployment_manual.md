# EXPIREDDOMAINS PLATFORM DEPLOYMENT MANUAL
Enterprise SaaS Architecture, Cloud Scheduling, & Secrets Management

---

## 1. System Components

The platform consists of:
- **Next.js Frontend / Admin Panel**: Operates inside Vite on SSL ports, managing filters and viewing reports in real-time.
- **Python Daemon Crawler**: Runs inside containers / GitHub Actions on a 5-minute cron.
- **Supabase Cloud Schema**: Safe RLS authentication, SQL rules, and automated cookie fallback triggers.

---

## 2. Supabase Integration Setup
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Copy the contents of your `/supabase/schema.sql` file.
4. Paste and click **Run** to provision tables, triggers, and RLS tables.
5. In **Auth Settings**, enable **Google Provider** with your Google Client Credentials.

---

## 3. GitHub Actions Crawler Runner Configuration
1. Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**.
2. Add the following secrets:
   - `SUPABASE_URL`: Your project's API endpoint (e.g. `https://xxx.supabase.co`).
   - `SUPABASE_SERVICE_ROLE_KEY`: Service Key (bypasses RLS to write discovered domains).
3. Commit these directories to your default branch.
4. The scraper runs automatically every 5 minutes, or can be triggered via manual click inside the Web dashboard.

---

## 4. Environment Variables Configuration (`.env`)
To run local full-stack server modes, configure your `.env` as:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=ey...your-service-role-key-here
GEMINI_API_KEY=AIzaSy...
```
This file has been declared as `.env.example`. Make sure to never commit your true secret keys!
