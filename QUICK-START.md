# 🚀 Quick Start Guide - Real Estate Platform

## Prerequisites
- Node.js 18+ installed
- Docker Desktop running (for PostgreSQL)
- Windows PowerShell

## 🎯 First Time Setup

1. **Start the system:**
   ```powershell
   npm run dev
   ```
   
   This will:
   - Check if Docker/Postgres is running (starts it if needed)
   - Open 2 PowerShell windows (backend on port 8001, frontend on port 3000)
   - Display access URLs

2. **Access the application:**
   - **Frontend:** http://localhost:3000
   - **Backend API:** http://localhost:8001
   - **API Health:** http://localhost:8001/health

## 📋 Available Commands

### Starting/Stopping
```powershell
npm run dev      # Start all services (opens 2 windows)
npm run stop     # Stop all Node.js dev servers
npm run status   # Check running Node processes
```

### Docker/Database
```powershell
npm run docker:up     # Start Postgres container
npm run docker:down   # Stop Postgres container
npm run docker:logs   # View Postgres logs
```

### Development
```powershell
npm run lint          # Run linters on backend and frontend
npm run lint:fix      # Auto-fix backend linting issues
npm run setup         # Install all dependencies and run migrations
```

### Backend Only
```powershell
cd backend
npm run dev           # Start backend only
npm run db:migrate    # Run database migrations
npm run db:studio     # Open Prisma Studio (DB GUI)
npm test              # Run tests
```

### Frontend Only
```powershell
cd main-app
npm run dev           # Start frontend only
npm run build         # Build for production
```

## 🛠️ Troubleshooting

### Postgres not connecting?
```powershell
docker ps                    # Check if container is running
docker-compose up -d         # Start Postgres
docker-compose logs postgres # View logs
```

### Port already in use?
```powershell
# Check what's using the ports
netstat -ano | findstr :3000    # Frontend
netstat -ano | findstr :8001    # Backend

# Stop all Node processes
npm run stop
```

### Database migration issues?
```powershell
cd backend
npx prisma migrate reset   # Reset DB (⚠️ deletes all data)
npx prisma migrate dev     # Create new migration
npx prisma generate        # Regenerate Prisma client
```

### Clean restart?
```powershell
npm run stop               # Stop all servers
npm run docker:down        # Stop Postgres
npm run docker:up          # Start Postgres
npm run dev                # Start everything
```

## 📦 Project Structure

```
real-estate-ai/
├── backend/              # Express + Prisma API
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Business logic
│   │   └── middleware/  # Auth, error handling
│   └── prisma/          # Database schema & migrations
├── main-app/            # Next.js frontend
│   └── src/
│       ├── app/         # Pages and API routes
│       ├── components/  # React components
│       └── lib/         # API client, utilities
├── start-dev.ps1        # Windows dev starter script
├── stop-dev.ps1         # Windows stop script
└── package.json         # Root commands
```

## 🔐 Default Credentials

See `backend/SEED-CREDENTIALS.txt` for test user accounts.

## 📝 Environment Variables

Backend uses `.env` file in `backend/` directory:
- `DATABASE_URL` - Postgres connection string
- `JWT_SECRET` - Token signing key
- `PORT` - Backend port (default: 8001)
- `CORS_ORIGIN` - Allowed frontend URLs

## 🎨 Development Workflow

1. Start services: `npm run dev`
2. Make your changes (hot reload is enabled)
3. Check linting: `npm run lint`
4. Stop services when done: Close the PowerShell windows or `npm run stop`

## 💡 Tips

- **Hot Reload:** Both backend and frontend auto-reload on file changes
- **Database GUI:** Run `cd backend && npm run db:studio` to open Prisma Studio
- **Logs:** Check the individual PowerShell windows for real-time logs
- **Health Check:** Visit http://localhost:8001/health to verify backend is running
- **API Docs:** Check `DOCUMENTACAO-SISTEMA-BUSCA.md` for API documentation

## 🆘 Need Help?

Check the documentation:
- `README.md` - Full project documentation
- `ESTRUTURA-DO-PROJETO.md` - Project structure details
- `EXPLICACAO-DAS-TECNOLOGIAS-USADAS.md` - Technology stack explanation
- `DOCUMENTACAO-SISTEMA-BUSCA.md` - Search system documentation

---

**Made with ❤️ by the Real Estate Platform Team**
