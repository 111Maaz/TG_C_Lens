# T-G Crime Lens (Telangana Crime Lens Mobile) - Comprehensive Project Report

**Date of Report:** June 2026  
**Project Age:** Approximately 1.5 - 2 years  
**Project Type:** React/Vite web app with Capacitor Android mobile wrapper  
**Primary Scope:** Telangana crime data analytics, district-wise visualization, community reporting, and admin-side report review

---

## Executive Summary

T-G Crime Lens is a crime analytics and visualization platform focused on Telangana. The project combines official static crime datasets, Telangana boundary GeoJSON files, interactive dashboard visualizations, and a Supabase-backed community report layer.

The app is built with React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router, TanStack Query, Leaflet, Recharts, and Capacitor. The core dashboard is driven mainly by static CSV files in `public/`, while user-submitted unofficial reports are stored in Supabase in the `unofficial_reports` table. The Android project under `android/` wraps the Vite build output from `dist/`.

Important implementation note: parts of the codebase are fully wired into the current app, while some modules are placeholders, older experiments, or partially integrated services. This report distinguishes between active routed functionality and supporting or unused files.

---

## 1. Current Application Routes

The active route map is defined in `src/App.tsx`.

### Public Routes

- `/` - Main dashboard (`src/pages/Index.tsx`)
- `/trends` - Crime trend analysis (`src/pages/CrimeTrends.tsx`)
- `/demographics` - Demographic and population/crime correlation analysis (`src/pages/Demographics.tsx`)
- `/admin/administrative-units` - Administrative unit explanation page (`src/pages/admin/administrative-units.tsx`)
- `/auth/login` - Login page (`src/auth/pages/Login.tsx`)
- `/auth/register` - Register page (`src/auth/pages/Register.tsx`)
- `/auth/reset-password` - Reset password page (`src/auth/pages/ResetPassword.tsx`)

### Protected Routes

- `/submit-report` - Crime report submission page (`src/pages/SubmitReport.tsx`)
- `/profile` - User profile page (`src/auth/pages/Profile.tsx`)
- `/admin/reports` - Admin reports table (`src/pages/admin/reports.tsx`)

`/submit-report` and `/profile` require a locally authenticated user through `ProtectedRoute`. `/admin/reports` requires `user.role === "admin"`. The app redirects unauthorized role access to `/unauthorized`, but there is no explicit `/unauthorized` route currently defined, so that path falls through to the Not Found page.

---

## 2. Dataset and Data Files

### Official Crime CSV Data

Located in `public/`:

- `public/telangana-crime-data.csv`
  - 1,488 data rows.
  - Covers 2020 and 2021-style records based on columns such as `UNITS`, `Population in Lakhs`, `Crime rate for 2021`, `Category`, `Crime_Type`, `Crimes`, `Year`, and `% Variation in 2021 over 2020`.

- `public/telangana-crime-data 18-19.csv`
  - 1,426 data rows.
  - Covers 2018 and 2019-style records based on columns such as `Crime rate for 2019`, `Year`, and `% Variation in 2019 over 2018`.

These two CSV files are loaded and merged by `src/services/telanganaDataService.ts`. The service parses the CSV text in the browser, stores it as `TelanganaDistrictData[]`, and exposes helpers for:

- district list generation
- crime category list generation
- crime type list generation by category
- year list generation
- filtered totals
- top 10 districts
- year comparison data
- district-specific records
- fixed map coordinates for known police units/districts

The app does not currently use PapaParse for these CSV files even though `papaparse` is installed; parsing is done manually with `split("\n")` and `split(",")`.

### Mock Community Report Data

- `public/mock_reports.csv`

This file contains sample unofficial report-style rows. It is useful for reference/demo purposes, but the active unofficial report map and admin report table fetch from Supabase rather than this CSV.

### GeoJSON Boundary Data

Located in `public/` and `telangana_boundaries-master/`:

- `public/districts.json`
  - Used directly by `src/components/map/TelanganaMapView.tsx`.
  - Contains 10 district boundary features: Adilabad, Karimnagar, Nizamabad, Khammam, Warangal, Medak, Nalgonda, Rangareddy, Hyderabad, and Mahabubnagar.
  - Rendered through `react-leaflet` as a non-interactive `GeoJSON` layer.

- `telangana_boundaries-master/districts.json`
  - Same source-style district boundary dataset as the public copy.

- `telangana_boundaries-master/blocks.json`
  - Contains 444 block-level features.
  - Present in the repository for deeper administrative mapping, but not actively loaded by the current app.

- `telangana_boundaries-master/village_boundaries.json.xz`
  - Compressed village boundary dataset.
  - Stored for future hyper-local mapping, but not actively decompressed or rendered by the current frontend.

The `telangana_boundaries-master/README.md` notes that the boundary data was extracted from the Telangana Government Tank Information System and stored in GeoJSON format.

### Images, Icons, and Static Assets

Located in `public/`:

- `section1.jpg`, `section4.jpg`, `section12.jpg` - imagery used by informational UI sections, especially the administrative unit page.
- `Maaz1.jpg` - static image asset present in the public folder.
- `unofficial-marker.svg` - Leaflet marker icon for unofficial reports.
- `public/icons/*.webp` - app icons referenced by `public/manifest.webmanifest`.
- `public/icons/assets/icon.png` - source icon asset.

---

## 3. Current Supabase Database Structure

The current database structure shared for this report contains two public tables.

### `public.unofficial_reports`

Columns:

- `id uuid primary key default gen_random_uuid()`
- `crime_category text not null`
- `crime_type text not null`
- `district text not null`
- `description text not null`
- `location point not null`
- `exact_location text not null`
- `email text`
- `is_anonymous boolean not null default true`
- `status text not null default 'approved'`
- `created_at timestamp with time zone not null default now()`
- `updated_at timestamp with time zone not null default now()`

Constraint:

- `status` must be one of `pending`, `approved`, or `rejected`.

Frontend behavior:

- `src/services/unofficial-reports.ts` inserts reports into this table.
- Location is sent as a PostgreSQL point string in `(lng,lat)` order.
- The frontend parses Supabase `POINT` strings back into `{ lat, lng }`.
- New reports are currently inserted with `status: "approved"` in the service, matching the database default.
- `getApproved()` fetches only approved reports for the map.
- `updateStatus()` changes status for moderation workflows.
- `subscribeToReports()` listens to realtime changes on the table.

### `public.request_limits`

Columns:

- `ip_address text primary key`
- `request_count integer not null default 1`
- `window_start timestamp with time zone not null default now()`

Current usage:

- The table exists for rate-limiting support.
- The current frontend does not call a rate-limit function before report submission.
- Older migrations include a `check_rate_limit(client_ip text)` function, but the active UI submits directly through the Supabase client.

### Schema Files in the Repository

- `supabase/migrations/20240320000000_create_unofficial_reports.sql`
  - Older schema version using `GEOGRAPHY(POINT)` and authenticated insert policy with rate limiting.

- `supabase/migrations/20240321_create_unofficial_reports.sql`
  - Later schema using PostgreSQL `POINT`, public insert/read policies, status, email, exact location, and timestamps.

- `supabase/migrations/20240322_update_unofficial_reports.sql`
  - Reconciliation migration for missing columns.

- `supabase/migrations/20240323_update_status_default.sql`
  - Changes default report status to `approved`.

- `public/DB-Supabase/tables.txt`
  - Most aligned with the current frontend and the database structure shared above.
  - Includes notes that public anon access is used by the current client and that `request_limits` is optional/currently not used by the UI.

---

## 4. Official Dashboard Data Flow

### Main Files

- `src/hooks/useDashboardData.ts`
- `src/services/telanganaDataService.ts`
- `src/contexts/FilterContext.tsx`
- `src/components/Filters.tsx`
- `src/components/StatsCards.tsx`
- `src/components/CrimeCharts.tsx`
- `src/pages/Index.tsx`

### Flow

1. `DashboardFilters` loads CSV options through `telanganaDataService`.
2. Available years, districts, categories, and crime types are generated from the merged CSV data.
3. The selected filter state lives in `FilterContext`.
4. Applying filters updates `activeFilters` and the URL search params.
5. `useTelanganaStats(activeFilters)` reloads CSV data and returns filtered aggregate results.
6. Dashboard cards, charts, and map markers recalculate from the filtered dataset.

### Computed Statistics

`StatsCards.tsx` computes:

- Crime Hotspot: district/police unit with highest crimes per lakh population.
- Safest District: district/police unit with lowest crimes per lakh population.
- Top Crime Type: crime type with the highest aggregate count.
- Crime Trend: aggregate latest-year vs previous-year change.

`telanganaDataService.ts` also provides mock detection and conviction values:

- `detectionRate` is hardcoded as `72.5`.
- `convictionRate` is hardcoded as `58.3`.
- `pendingTrialCases` is estimated as `60%` of total incidents.

These are not sourced from the CSV files and should be treated as dashboard placeholders.

---

## 5. Map and Geospatial Architecture

### Official Map

Main files:

- `src/components/CrimeMap.tsx`
- `src/components/map/TelanganaMapView.tsx`
- `src/components/map/CrimeRegionMarker.tsx`
- `src/components/map/CrimeSeverityLegend.tsx`
- `src/components/map/map-utils.ts`
- `src/components/map/map.css`

Official map behavior:

- Loads `public/districts.json`.
- Renders district boundaries as a Leaflet `GeoJSON` layer.
- Aggregates CSV crime counts by district/police unit.
- Uses hardcoded coordinates from `telanganaDataService.getDistrictCoordinates()`.
- Draws fixed-radius district markers.
- Colors markers by crime-count thresholds:
  - Green: 500-3,999 crimes
  - Yellow: 4,000-10,000 crimes
  - Orange/red: 10,001-20,000 crimes
  - Dark red: above 20,000 crimes

### Unofficial Reports Map

Main files:

- `src/components/map/UnofficialReportsMap.tsx`
- `src/components/map/ReportMapLayer.tsx`
- `src/services/unofficial-reports.ts`
- `public/unofficial-marker.svg`

Unofficial map behavior:

- Toggled from `CrimeMap.tsx` using the "Unofficial Crime Reports" switch.
- Fetches approved rows from Supabase using `unofficialReportsService.getApproved()`.
- Renders each report as a Leaflet marker.
- Shows category, type, district, description, date, and "Unofficial Report" badge in popups.
- Subscribes to Supabase realtime table changes and refreshes the map when reports change.
- Fits map bounds to available report markers.

---

## 6. Community Reporting Workflows

There are two reporting-related form implementations in the repository.

### Active Routed Submission Page

Files:

- `src/pages/SubmitReport.tsx`
- `src/components/CrimeReportUpload.tsx`
- `src/hooks/useCrimeData.ts`
- `src/services/crimeDataService.ts`

Current behavior:

- `/submit-report` renders `CrimeReportUpload`.
- User must be authenticated through the local auth context.
- Form captures crime type, Hyderabad region, incident date/time, address, description, optional image, anonymous flag, and terms agreement.
- Image upload is mocked through `URL.createObjectURL(file)`.
- Crime creation is mocked through `crimeDataService.createCrime()`, which returns a random local ID.
- Coordinates are currently set to `[0, 0]`.
- This active routed form does not insert into the Supabase `unofficial_reports` table.

### Supabase-Backed Unofficial Report Form

Files:

- `src/components/UnofficialReportForm.tsx`
- `src/services/unofficial-reports.ts`

Current behavior:

- Captures category, crime type, district, email/anonymous preference, exact location, description, and clicked map coordinates.
- Uses a Leaflet map centered on Hyderabad.
- Inserts into Supabase through `unofficialReportsService.create()`.
- This component is implemented but is not currently routed in `src/App.tsx`.

### Practical Interpretation

The project contains both an older/mock authenticated report upload workflow and a newer Supabase-backed unofficial report workflow. The dashboard's unofficial map and admin reports table use Supabase, but the active `/submit-report` route still uses the mock `CrimeReportUpload` path.

---

## 7. Admin and Moderation Features

### Active Admin Reports Page

Files:

- `src/pages/admin/reports.tsx`
- `src/pages/admin/UnofficialReportsTable.tsx`
- `src/services/unofficial-reports.ts`
- `src/integrations/supabase/client.ts`

Behavior:

- `/admin/reports` is protected by `requiredRole="admin"` in `ProtectedRoute`.
- Displays all rows from Supabase `unofficial_reports`.
- Shows date, category, type, district, description, status, and anonymous flag.
- Supports approving pending reports.
- Supports rejecting pending reports.
- Supports deleting reports.
- Can open a report location in Google Maps by parsing the stored PostgreSQL point string.
- Subscribes to realtime changes and refreshes the table automatically.

### Older/Placeholder Moderation Page

File:

- `src/pages/admin/ReportModeration.tsx`

This file uses `crimeDataService.getCrimes({ status: "pending" })`, which is currently mocked. It is not routed in `src/App.tsx`. It appears to be an earlier moderation concept rather than the active admin workflow.

### Administrative Units Page

File:

- `src/pages/admin/administrative-units.tsx`

This page is routed publicly at `/admin/administrative-units`. It explains Telangana administrative districts, police units, commissionerates, missing/directly reported districts, and coverage relationships. Its data is hardcoded in the component rather than loaded from a database.

---

## 8. Authentication and Access Control

Main files:

- `src/auth/contexts/AuthContext.tsx`
- `src/auth/components/ProtectedRoute.tsx`
- `src/services/authService.ts`
- `src/auth/pages/Login.tsx`
- `src/auth/pages/Register.tsx`
- `src/auth/pages/Profile.tsx`
- `src/auth/pages/ResetPassword.tsx`

Current behavior:

- Authentication is implemented as a local/demo layer, not live Supabase Auth.
- Session data is stored in `localStorage` under `crimeapp_user`.
- `authService.login()` only accepts `demo@example.com` with password `password` as the built-in demo login.
- Registration creates a mock local user with role `user`.
- Profile updates are mocked.
- Password reset is mocked.
- `ProtectedRoute` checks local auth state and optional role.

Important note:

The Supabase client is used for unofficial reports, but the auth system currently does not use Supabase Auth sessions. Therefore, database RLS policies must match anon-client behavior if the deployed app is expected to read, insert, update, or delete reports from the browser.

---

## 9. Trends and Demographics Pages

### Crime Trends

File:

- `src/pages/CrimeTrends.tsx`

Features:

- Year-over-year crime totals.
- Crime category analysis.
- District-wise trend comparison.
- Uses CSV-backed `useTelanganaStats`.
- Supports global filters from `FilterContext`.
- Uses Recharts area and bar charts.

### Demographics

File:

- `src/pages/Demographics.tsx`

Features:

- Population vs crime-rate correlation.
- Year selector for 2018, 2019, 2020, and 2021.
- Trend line calculation.
- District variation analysis for 2021 vs 2020.
- Uses CSV population and crime-rate columns.

Note:

The demographic page depends on the `crimeRate` column parsed as `crimeRateFor2021`, even for older files whose header is `Crime rate for 2019`. The field name in TypeScript is fixed, but the value comes from the fourth CSV column for each file.

---

## 10. UI, Styling, and Layout

Main UI areas:

- `src/components/AppSidebar.tsx`
- `src/components/UnifiedFooter.tsx`
- `src/components/WelcomeModal.tsx`
- `src/components/AutoWelcomePage.tsx`
- `src/components/EmergencyNumbers.tsx`
- `src/components/AnimatedTitle.tsx`
- `src/components/GradientText.tsx`
- `src/components/SplashCursor.tsx`
- `src/components/ui/*`

The UI uses:

- Tailwind CSS
- shadcn/ui-style components
- Radix UI primitives
- Lucide icons
- Framer Motion animations
- CountUp animations
- Sonner and shadcn toast notifications

Startup behavior:

- `App.tsx` shows `AutoWelcomePage` for 3 seconds.
- After the splash screen, it opens `WelcomeModal`.

---

## 11. Mobile and PWA Support

### Capacitor Android

Files:

- `capacitor.config.ts`
- `android/`

Configuration:

- `appId`: `com.tgcl.app`
- `appName`: `TGCL`
- `webDir`: `dist`

The Android folder contains the native Capacitor Android project, Gradle files, launcher icons, splash screens, and `MainActivity.java`.

### Web Manifest

File:

- `public/manifest.webmanifest`

The manifest defines app icons in multiple sizes. It is icon-focused and does not currently include fields such as `name`, `short_name`, `start_url`, `display`, or theme colors.

---

## 12. Technical Stack

### Frontend

- React 18
- TypeScript
- Vite
- React Router DOM
- TanStack React Query
- Tailwind CSS
- shadcn/ui-style component structure
- Radix UI primitives
- Lucide React icons
- Framer Motion
- Recharts
- React Hook Form
- Zod

### Maps and Geospatial

- Leaflet
- React Leaflet
- OpenStreetMap tile layer
- GeoJSON boundary rendering
- PostgreSQL `POINT` for Supabase report locations

### Backend / Data

- Supabase JavaScript client
- Supabase PostgreSQL tables:
  - `unofficial_reports`
  - `request_limits`
- Static CSV data in `public/`
- Static GeoJSON boundary data

### Mobile

- Capacitor 7
- Android native project under `android/`

### Installed but Limited/Unused in Current Code

- `mapbox-gl` is installed, but the active map components use Leaflet/OpenStreetMap.
- `papaparse` is installed, but the current CSV service parses manually.
- `dashboardService.ts`, `crimeDataService.ts`, and `regionsService.ts` contain placeholder/mock API implementations.

---

## 13. Key Gaps and Improvement Areas

1. Wire `/submit-report` to the Supabase-backed `UnofficialReportForm` if the intended live workflow is public/community report insertion.
2. Replace mock auth with Supabase Auth or clearly keep it as local demo auth.
3. Add a real `/unauthorized` route because `ProtectedRoute` redirects role failures there.
4. Decide whether new community reports should default to `approved` or `pending`; the current service and DB default are `approved`, while the admin UI still contains pending approval actions.
5. If moderation should be secure, tighten Supabase RLS policies and move admin update/delete operations behind authenticated roles or server-side functions.
6. Replace manual CSV parsing with PapaParse or another robust CSV parser to handle commas/quotes safely.
7. Avoid reloading and reparsing both CSV files repeatedly in multiple hooks/components by caching parsed data in the service or query layer.
8. Align district boundary coverage with the current Telangana administrative map if the app requires all 33 districts instead of the 10-feature historical boundary file.
9. Clarify placeholder statistics such as detection rate, conviction rate, and pending trial cases.
10. Complete PWA manifest metadata if installable web-app behavior is required.

---

## 14. File Location Summary

### Core App

- `src/App.tsx` - route definitions, providers, splash/welcome behavior.
- `src/main.tsx` - React entry point.
- `src/index.css`, `src/App.css` - global styling.

### Data Services

- `src/services/telanganaDataService.ts` - active CSV parsing and dashboard data service.
- `src/services/unofficial-reports.ts` - active Supabase service for unofficial reports.
- `src/services/authService.ts` - mock/local auth service.
- `src/services/crimeDataService.ts` - mock crime report API service.
- `src/services/dashboardService.ts` - mock dashboard service, not the main active dashboard source.
- `src/services/regionsService.ts` - placeholder region service.

### Pages

- `src/pages/Index.tsx` - main dashboard.
- `src/pages/CrimeTrends.tsx` - trend analysis.
- `src/pages/Demographics.tsx` - demographic/correlation analysis.
- `src/pages/SubmitReport.tsx` - active protected submission page using mock upload service.
- `src/pages/admin/reports.tsx` - active admin reports route.
- `src/pages/admin/UnofficialReportsTable.tsx` - Supabase report moderation table.
- `src/pages/admin/ReportModeration.tsx` - older placeholder moderation page.
- `src/pages/admin/administrative-units.tsx` - administrative unit explanation page.

### Maps

- `src/components/CrimeMap.tsx` - official/unofficial map toggle.
- `src/components/map/TelanganaMapView.tsx` - official GeoJSON map.
- `src/components/map/UnofficialReportsMap.tsx` - Supabase report map.
- `src/components/map/ReportMapLayer.tsx` - reusable unofficial report marker layer.
- `src/components/map/CrimeRegionMarker.tsx` - official district marker.
- `src/components/map/CrimeSeverityLegend.tsx` - severity legend.
- `src/components/map/map-utils.ts` - Leaflet icon setup and severity colors.

### Data Assets

- `public/telangana-crime-data.csv`
- `public/telangana-crime-data 18-19.csv`
- `public/mock_reports.csv`
- `public/districts.json`
- `telangana_boundaries-master/districts.json`
- `telangana_boundaries-master/blocks.json`
- `telangana_boundaries-master/village_boundaries.json.xz`

### Supabase

- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/types.ts`
- `supabase/migrations/*.sql`
- `public/DB-Supabase/tables.txt`

### Mobile

- `capacitor.config.ts`
- `android/`

---

## Final Assessment

T-G Crime Lens has grown into a substantial Telangana-focused analytics app with a strong dashboard layer, useful geospatial visualization, CSV-backed trend analysis, and a working Supabase-backed unofficial report display/admin path.

The main thing to preserve in future work is clarity between three layers:

1. Official static analytics data from CSV and GeoJSON files.
2. Live community report data from Supabase.
3. Mock/demo services that still exist from earlier development phases.

Once the active `/submit-report` route is connected to the Supabase-backed report form and auth/RLS decisions are finalized, the project will be much more internally consistent and easier to explain, maintain, and deploy.
