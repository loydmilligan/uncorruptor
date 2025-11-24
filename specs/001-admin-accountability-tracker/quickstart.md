# Quickstart Guide: Administration Accountability Tracker

**Branch**: `001-admin-accountability-tracker`
**Date**: 2025-11-24

## Prerequisites

- Node.js 20+ (LTS recommended)
- PostgreSQL 15+
- pnpm 8+ (or npm/yarn)
- Chrome browser (for extension development)

## Initial Setup

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb accountability_tracker

# Or via psql
psql -c "CREATE DATABASE accountability_tracker;"
```

### 2. Environment Configuration

Create `.env` file in project root:

```env
# Database
DATABASE_URL="postgresql://localhost:5432/accountability_tracker"

# Server
PORT=3000
HOST=0.0.0.0

# Frontend (for development)
VITE_API_URL=http://localhost:3000/api
```

### 3. Install Dependencies

```bash
# Install all workspace dependencies
pnpm install

# Or if using monorepo workspaces
pnpm install --recursive
```

### 4. Database Migration

```bash
# Generate Prisma client
cd backend
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev --name init

# Seed default data (tags, publications)
pnpm prisma db seed
```

## Development

### Start All Services

```bash
# Terminal 1: Backend API
cd backend
pnpm dev  # Runs on http://localhost:3000

# Terminal 2: Frontend
cd frontend
pnpm dev  # Runs on http://localhost:5173

# Terminal 3: Extension (optional, for extension development)
cd extension
pnpm dev  # Watches and rebuilds extension
```

### Access the Application

- **Frontend**: http://localhost:5173
- **API**: http://localhost:3000/api
- **API Docs**: http://localhost:3000/documentation (Swagger UI)

## Chrome Extension Setup

### Load Unpacked Extension

1. Build the extension:
   ```bash
   cd extension
   pnpm build
   ```

2. Open Chrome and navigate to `chrome://extensions`

3. Enable "Developer mode" (toggle in top right)

4. Click "Load unpacked" and select the `extension/dist` folder

5. Configure the extension:
   - Click the extension icon
   - Set API URL to `http://localhost:3000/api`

## Project Commands

### Backend

```bash
cd backend

pnpm dev          # Start development server with hot reload
pnpm build        # Build for production
pnpm start        # Start production server
pnpm test         # Run tests
pnpm test:watch   # Run tests in watch mode
pnpm lint         # Run ESLint
pnpm prisma studio # Open Prisma database browser
```

### Frontend

```bash
cd frontend

pnpm dev          # Start Vite dev server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm test         # Run unit tests
pnpm test:e2e     # Run Playwright E2E tests
pnpm lint         # Run ESLint
```

### Extension

```bash
cd extension

pnpm dev          # Watch mode for development
pnpm build        # Build for production
pnpm test         # Run tests
pnpm zip          # Create .zip for Chrome Web Store (if publishing)
```

## Verification Checklist

After setup, verify each component works:

- [ ] Backend starts without errors
- [ ] `curl http://localhost:3000/api/tags` returns default tags
- [ ] Frontend loads at http://localhost:5173
- [ ] Can create a new event through the UI
- [ ] Extension loads in Chrome without errors
- [ ] Extension popup shows when clicking icon
- [ ] Extension can connect to local API

## Common Issues

### Database Connection Failed

```
Error: Can't reach database server at `localhost:5432`
```

**Solution**: Ensure PostgreSQL is running:
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Check if running
pg_isready
```

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution**: Kill the process or use a different port:
```bash
# Find process
lsof -i :3000

# Kill it
kill -9 <PID>

# Or use different port
PORT=3001 pnpm dev
```

### Prisma Client Not Generated

```
Error: @prisma/client did not initialize yet
```

**Solution**: Generate the client:
```bash
cd backend
pnpm prisma generate
```

### Extension Not Connecting

**Solution**: Check that:
1. Backend is running on the configured port
2. Extension API URL matches backend URL
3. No CORS issues (backend should allow localhost origins)

## Next Steps

1. Review the [spec.md](./spec.md) for feature requirements
2. Review the [data-model.md](./data-model.md) for entity structure
3. Review the [contracts/api.yaml](./contracts/api.yaml) for API endpoints
4. Run `/speckit.tasks` to generate implementation tasks
