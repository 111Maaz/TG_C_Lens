# T-G Crime Lens

A comprehensive crime analytics platform for Telangana, featuring both official crime data visualization and unofficial crime reporting.

## Features

### Official Crime Data
- Interactive map visualization of crime statistics across Telangana districts
- Crime severity indicators and trends
- Demographic analysis
- Administrative tools for data management

### Unofficial Crime Reporting (New)
- Anonymous crime reporting system for citizens
- Interactive map for location selection
- Rate-limited submissions (5 reports/hour/IP)
- Admin moderation panel for report management
- Toggle between official and unofficial data on the main map

## Technical Stack

- Frontend: React + TypeScript + Vite
- UI Components: shadcn/ui + TailwindCSS
- Maps: Leaflet + MapLibre
- Backend: Supabase (PostgreSQL + PostGIS)
- Form Handling: react-hook-form + zod validation
- State Management: TanStack Query

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details
