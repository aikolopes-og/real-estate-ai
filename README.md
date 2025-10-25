# Real Estate AI Platform# 🏠 Real Estate AI Platform - EasyHome# Goiânia Real Estate Platform



A comprehensive, modern real estate platform built with Next.js 15, Express.js, and PostgreSQL. Features AI-powered property recommendations, advanced search, user authentication, and a fully seeded database.



---A comprehensive, modern real estate platform built with Next.js 15, Express.js, and PostgreSQL. Features AI-powered property recommendations, advanced search, user authentication, and a fully seeded database with Goiânia, Brazil real estate data.A modern, full-stack real estate platform built with Next.js and Node.js, featuring property listings, user authentication, and a seeded database with Goiânia real estate data.



## Table of Contents



- [Features](#features)---## 🚀 Quick Start

- [Tech Stack](#tech-stack)

- [Quick Start](#quick-start)

- [Project Structure](#project-structure)

- [API Documentation](#api-documentation)## 📋 Table of Contents### Prerequisites

- [Development Guide](#development-guide)

- [Testing](#testing)- Node.js 18+ 

- [Troubleshooting](#troubleshooting)

- [Features](#-features)- PostgreSQL database

---

- [Tech Stack](#-tech-stack)- npm or yarn

## Features

- [Quick Start](#-quick-start)

### Frontend

- Modern UI/UX with glassmorphism design- [Project Structure](#-project-structure)### 1. Database Setup

- Complete authentication system (login/register) with JWT

- Advanced property search with filters- [API Documentation](#-api-documentation)```bash

- Property recommendations based on user preferences

- Responsive design (mobile, tablet, desktop)- [Development Guide](#-development-guide)# Start PostgreSQL on port 5433

- Interactive property gallery

- User profile management- [Testing](#-testing)# Make sure PostgreSQL is running with credentials: postgres/password

- Favorites and view history

- [Deployment](#-deployment)```

### Backend

- RESTful API with Express.js and TypeScript- [Troubleshooting](#-troubleshooting)

- Prisma ORM with PostgreSQL

- JWT authentication with refresh tokens### 2. Backend Setup

- Role-based access control (USER, BROKER, CONSTRUCTION)

- Rate limiting and security middleware---```bash

- Comprehensive property management

- Seeded database with test datacd backend



### Database## ✨ Featuresnpm install

- PostgreSQL with Prisma ORM

- 3 user roles: Regular users, Brokers, Construction companiesnpx prisma generate

- Property types: Apartments, Houses, Land, Commercial

- Relationships: Users, Companies, Properties, Favorites, View History### Frontend (EasyHome)npx prisma db push

- Seeded with realistic Goiania, Brazil real estate data

- 🎨 **Modern UI/UX**: Glassmorphism design with smooth animationsnpx tsx prisma/seed-goiania.ts

---

- 🔐 **Authentication**: Complete login/register system with JWTnpm run dev

## Tech Stack

- 🏘️ **Property Listings**: Browse properties with advanced filtering```

### Frontend

- **Framework**: Next.js 15.5.5 (App Router)- 🔍 **Smart Search**: Filter by type, price, location, bedroomsBackend will run on: http://localhost:4101

- **Build Tool**: Turbopack

- **Language**: TypeScript- 📱 **Responsive Design**: Optimized for mobile, tablet, and desktop

- **Styling**: Tailwind CSS

- **HTTP Client**: Fetch API- 🌐 **Brazilian Localization**: Full Portuguese (pt-BR) support### 3. Frontend Setup

- **State Management**: React Context API

- ⚡ **Fast Performance**: Next.js 15 with Turbopack```bash

### Backend

- **Runtime**: Node.js 18+- 🎯 **User Recommendations**: Personalized property suggestionscd main-app

- **Framework**: Express.js

- **Language**: TypeScriptnpm install

- **Database**: PostgreSQL 15

- **ORM**: Prisma 5.22.0### Backend APInpm run dev

- **Authentication**: JWT (jsonwebtoken)

- **Security**: Helmet, bcryptjs, rate-limiter-flexible- 🔒 **Secure Authentication**: JWT-based auth with bcrypt password hashing```

- **Validation**: Zod

- 👥 **User Management**: Role-based access (User, Broker, Construction, Admin)Frontend will run on: http://localhost:4100

### DevOps

- **Database**: Docker Compose (PostgreSQL)- 🏢 **Property Management**: CRUD operations for properties

- **Package Manager**: npm

- **TypeScript Compiler**: tsc- 🏗️ **Company Management**: Real estate and construction companies## 🔧 Port Configuration

- **Process Manager**: tsx (for development)

- 📊 **Advanced Queries**: Filtering, sorting, pagination

---

- 🔄 **Refresh Tokens**: Secure token rotationThis system uses exclusive ports to avoid conflicts:

## Quick Start

- 📈 **Analytics**: Property views tracking- **Frontend**: 4100

### Prerequisites

- Node.js 18 or higher- 🗄️ **Database**: PostgreSQL with Prisma ORM- **Backend**: 4101  

- Docker Desktop

- npm or yarn- **Database**: 5433



### 1. Clone Repository### Database

```bash

git clone <repository-url>- ✅ **Fully Seeded**: 15+ Goiânia neighborhoods## 🏠 Access Points

cd real-estate-ai

```- 🏢 5 Real estate companies



### 2. Setup Database (Automated)- 🏗️ 5 Construction companies- **Main Application**: http://localhost:4100

```powershell

# Windows PowerShell- 👨‍💼 6+ Real estate agents- **API Health Check**: http://localhost:8001/health

.\setup-database.ps1

```- 🏠 Multiple property listings- **Properties API**: http://localhost:8001/api/properties



This script will:- 📍 Real locations in Goiânia, Brazil- **Imoveis API**: http://localhost:8001/imoveis

- Start PostgreSQL in Docker

- Generate Prisma Client

- Apply database schema

- Seed test data (3 users, 4 properties)---## 📊 Database Content



### 3. Start the System

```powershell

# Windows PowerShell## 🛠 Tech Stack- 5 real estate companies

.\start-system.ps1

```- 5 construction companies



This will start both backend (port 8001) and frontend (port 4100).### Frontend- 6+ real estate agents  



### 4. Test Authentication- **Framework**: Next.js 15.5.5 (App Router)- 15 neighborhoods in Goiânia

```powershell

# Windows PowerShell- **UI**: React 19, Tailwind CSS 4- Multiple property listings across all neighborhoods

.\test-auth.ps1

```- **Language**: TypeScript 5



### Manual Setup (Alternative)- **Animations**: Framer Motion## 🛠️ Development



**Database:**- **Forms**: React Hook Form + Zod validation

```bash

docker-compose up -d- **Build Tool**: Turbopack### Frontend (Next.js)

```

- **Testing**: Playwright (E2E)- Located in `main-app/`

**Backend:**

```bash- Uses Turbopack for fast development

cd backend

npm install### Backend- Tailwind CSS for styling

npx prisma generate

npx prisma db push- **Runtime**: Node.js 22- TypeScript for type safety

npx tsx prisma/seed.ts

npm run dev- **Framework**: Express.js 4

```

- **Database**: PostgreSQL + Prisma ORM 5### Backend (Node.js)

**Frontend:**

```bash- **Auth**: JWT (jsonwebtoken) + bcryptjs- Located in `backend/`

cd main-app

npm install- **Validation**: Zod- Express.js REST API

npm run dev

```- **Security**: Helmet, CORS, Rate Limiting- Prisma ORM with PostgreSQL



---- **Language**: TypeScript 5- TypeScript with tsx for development



## Project Structure



```### DevOps## 🧪 Testing

real-estate-ai/

├── backend/                 # Backend API- **Package Manager**: npm

│   ├── prisma/

│   │   ├── schema.prisma   # Database schema- **Version Control**: GitCheck system health:

│   │   ├── seed.ts         # Basic seed data

│   │   ├── seed-goiania.ts # Goiania-specific data- **Database Migrations**: Prisma Migrate```bash

│   │   ├── seed-large.ts   # Large dataset

│   │   └── seed-full.ts    # Complete dataset- **Environment**: dotenvnode check-system.js

│   ├── src/

│   │   ├── server.ts       # Express server entry point```

│   │   ├── middleware/     # Auth, rate limiting, error handling

│   │   ├── routes/         # API endpoints---

│   │   ├── schemas/        # Zod validation schemas

│   │   ├── services/       # Business logic## 📁 Project Structure

│   │   └── utils/          # Utilities

│   ├── .env                # Environment variables## 🚀 Quick Start

│   ├── package.json

│   └── tsconfig.json```

│

├── main-app/                # Frontend Next.js app### Prerequisitesreal-estate-ai/

│   ├── src/

│   │   ├── app/            # Next.js App Router```bash├── main-app/          # Next.js frontend

│   │   │   ├── page.tsx    # Home page

│   │   │   ├── layout.tsx  # Root layout# Required├── backend/           # Node.js API server

│   │   │   ├── globals.css # Global styles

│   │   │   ├── auth/       # Login/Register pagesNode.js 18+ (Recommended: 22.x)├── check-system.js    # System health checker

│   │   │   ├── listings/   # Property listings

│   │   │   └── api/        # API routesPostgreSQL 12+├── start-system.ps1   # Startup script

│   │   ├── components/     # React components

│   │   ├── context/        # React Contextnpm or yarn└── README.md          # This file

│   │   ├── lib/            # Libraries and utilities

│   │   └── types/          # TypeScript types```

│   ├── public/             # Static assets

│   ├── package.json# Optional

│   ├── next.config.ts

│   └── tailwind.config.jsGit## 🚀 Deployment

│

├── docker-compose.yml       # PostgreSQL containerVS Code (recommended)

├── setup-database.ps1       # Database initialization script

├── start-system.ps1         # System startup script```This project is configured for local development. For production deployment:

├── test-auth.ps1            # Authentication test script

└── README.md                # This file1. Build the frontend: `cd main-app && npm run build`

```

### 1. Clone & Install2. Build the backend: `cd backend && npm run build`

---

```powershell3. Configure production database connection

## API Documentation

# Clone repository4. Set up environment variables

### Base URL

- **Development**: `http://localhost:8001`git clone <your-repo-url>5. Deploy to your preferred hosting platform

- **API Prefix**: `/api`

cd real-estate-ai

### Authentication Endpoints

## 🤝 Contributing

**POST /api/auth/register**

Register a new user# Install all dependencies

```json

{cd backend1. Fork the repository

  "email": "user@example.com",

  "password": "senha123",npm install2. Create a feature branch

  "firstName": "John",

  "lastName": "Doe",3. Make your changes

  "role": "USER"

}cd ../main-app4. Test thoroughly

```

npm install5. Submit a pull request

**POST /api/auth/login**

Login with credentials```

```json

{## 📄 License

  "email": "user@example.com",

  "password": "senha123"### 2. Database Setup

}

``````powershellThis project is licensed under the MIT License.



Response:# Make sure PostgreSQL is running

```json# Default credentials: postgres/password on port 5432

{

  "success": true,cd backend

  "data": {

    "user": { ... },# Generate Prisma Client

    "tokens": {npx prisma generate

      "accessToken": "jwt-token",

      "refreshToken": "refresh-token"# Push schema to database

    }npx prisma db push

  }

}# Seed with Goiânia data (15 neighborhoods, companies, agents, properties)

```npx tsx prisma/seed-goiania.ts

```

**POST /api/auth/refresh**

Refresh access token### 3. Environment Variables

```json

{**Backend** (`backend/.env`):

  "refreshToken": "your-refresh-token"```env

}DATABASE_URL="postgresql://postgres:password@localhost:5432/real_estate_db"

```JWT_SECRET="your-super-secret-jwt-key-change-in-production"

JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"

**POST /api/auth/logout**JWT_EXPIRES_IN="24h"

Logout and invalidate refresh tokenJWT_REFRESH_EXPIRES_IN="7d"

PORT=8001

### Property EndpointsCORS_ORIGIN="http://localhost:4100"

NODE_ENV="development"

**GET /api/properties**```

Get all properties with filters

Query params: `type`, `minPrice`, `maxPrice`, `city`, `bedrooms`, `bathrooms`**Frontend** (`main-app/.env.local`):

```env

**GET /api/properties/:id**NEXT_PUBLIC_API_URL="http://localhost:8001/api"

Get single property by IDAPI_BASE_URL="http://localhost:8001"

NEXT_PUBLIC_ML_API_URL="http://localhost:8000"

**POST /api/properties** (Auth required - BROKER/CONSTRUCTION only)```

Create new property

### 4. Start Development Servers

**PUT /api/properties/:id** (Auth required - Owner only)

Update property**Option A: Quick Start (Recommended)**

```powershell

**DELETE /api/properties/:id** (Auth required - Owner only)# From project root

Delete property.\quick-start.ps1

```

### User Endpoints

**Option B: Manual Start**

**GET /api/me** (Auth required)```powershell

Get current user profile# Terminal 1 - Backend

cd backend

**PUT /api/me** (Auth required)npm run dev

Update user profile

# Terminal 2 - Frontend

**GET /api/users/:id**cd main-app

Get public user profilenpm run dev

```

---

**Option C: Integrated Start**

## Development Guide```powershell

# Start both services with pre-verification

### Environment Variablescd backend

npm run start:full

**Backend (.env)**

```env# OR

NODE_ENV=developmentcd main-app

PORT=8001npm run start:full

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/real_estate_db"```

JWT_SECRET=your-secret-key

JWT_REFRESH_SECRET=your-refresh-secret### 5. Access the Application

JWT_EXPIRES_IN=24h- **Frontend**: http://localhost:4100

JWT_REFRESH_EXPIRES_IN=7d- **Backend API**: http://localhost:8001/api

CORS_ORIGIN=http://localhost:3000- **Health Check**: http://localhost:8001/health

```

---

**Frontend (.env.local)**

```env## 📁 Project Structure

NEXT_PUBLIC_API_URL=http://localhost:8001

``````

real-estate-ai/

### Running Development Servers│

├── backend/                          # Express.js API Server

**Backend:**│   ├── src/

```bash│   │   ├── server.ts                # Main server entry point

cd backend│   │   ├── middleware/

npm run dev  # Runs on port 8001│   │   │   ├── auth.ts              # JWT authentication

```│   │   │   ├── errorHandler.ts     # Global error handling

│   │   │   └── rateLimiter.ts      # Rate limiting

**Frontend:**│   │   ├── routes/

```bash│   │   │   ├── auth.ts              # Auth endpoints (login, register, etc.)

cd main-app│   │   │   ├── properties.ts       # Property CRUD

npm run dev  # Runs on port 3000 or 4100│   │   │   ├── companies.ts        # Company management

```│   │   │   ├── admin.ts             # Admin operations

│   │   │   └── ai.ts                # AI/ML endpoints

**Database:**│   │   ├── services/

```bash│   │   │   └── auth.ts              # Auth business logic

docker-compose up -d│   │   ├── schemas/

```│   │   │   └── auth.ts              # Zod validation schemas

│   │   └── utils/

### Database Management│   │       └── logger.ts            # Winston logger

│   ├── prisma/

**Prisma Studio** (Database GUI):│   │   ├── schema.prisma            # Database schema

```bash│   │   ├── seed-goiania.ts          # Goiânia data seeder

cd backend│   │   └── migrations/              # Database migrations

npx prisma studio  # Opens on http://localhost:5555│   ├── package.json

```│   ├── tsconfig.json

│   └── start-with-frontend.js       # Integrated startup script

**Reset Database:**│

```bash├── main-app/                         # Next.js Frontend

cd backend│   ├── src/

npx prisma db push --force-reset│   │   ├── app/

npx tsx prisma/seed.ts│   │   │   ├── page.tsx             # Home page

```│   │   │   ├── layout.tsx           # Root layout

│   │   │   ├── globals.css          # Global styles

**Generate Prisma Client:**│   │   │   ├── auth/

```bash│   │   │   │   ├── login/page.tsx   # Login page

cd backend│   │   │   │   └── register/page.tsx # Register page

npx prisma generate│   │   │   ├── listings/[id]/       # Property details

```│   │   │   ├── recommendations/     # User recommendations

│   │   │   └── api/                 # API route proxies

---│   │   │       ├── auth/

│   │   │       │   ├── login/route.ts

## Testing│   │   │       │   └── register/route.ts

│   │   │       ├── me/route.ts

### Test Credentials│   │   │       ├── imoveis/route.ts

│   │   │       └── users/exists/route.ts

After running `setup-database.ps1`, use these credentials:│   │   ├── components/

│   │   │   ├── Header.tsx           # Navigation header

**Regular User:**│   │   │   ├── Gallery.tsx          # Image gallery

- Email: `cliente@example.com`│   │   │   ├── listings/

- Password: `senha123`│   │   │   │   ├── ListingCard.tsx  # Property card

- Role: USER│   │   │   │   └── ListingGrid.tsx  # Grid layout

│   │   │   └── ui/

**Broker:**│   │   │       └── Button.tsx       # Reusable button

- Email: `corretor@example.com`│   │   ├── context/

- Password: `senha123`│   │   │   ├── AuthContext.tsx      # Auth state management

- Role: BROKER│   │   │   └── LoadingContext.tsx   # Loading state

│   │   ├── lib/

**Construction Company:**│   │   │   └── api.ts               # API client

- Email: `construtora@example.com`│   │   ├── config/

- Password: `senha123`│   │   │   ├── api.ts               # API configuration

- Role: CONSTRUCTION│   │   │   └── design.ts            # Design tokens

│   │   └── utils/

### Manual API Testing│   │       ├── logger.ts            # Client logger

│   │       └── design.ts            # Design utilities

**Health Check:**│   ├── tests/

```bash│   │   ├── e2e.spec.ts              # E2E tests

curl http://localhost:8001/health│   │   └── homepage.spec.ts         # Homepage tests

```│   ├── tools/

│   │   └── run-e2e.js               # Test runner

**Login:**│   ├── package.json

```bash│   ├── playwright.config.ts

curl -X POST http://localhost:8001/api/auth/login \│   ├── tailwind.config.js

  -H "Content-Type: application/json" \│   ├── next.config.ts

  -d "{\"email\":\"cliente@example.com\",\"password\":\"senha123\"}"│   └── start-with-backend.js        # Integrated startup script

```│

├── quick-start.ps1                   # Windows quick start

**Get Properties:**├── start-system.ps1                  # Full system startup

```bash├── README.md                         # This file

curl http://localhost:8001/api/properties├── QUICK-START.md                    # Quick start guide

```├── TEST-EXECUTION-SUMMARY.md         # Test documentation

└── OVERALL-VERIFICATION.md           # Verification report

---```



## Troubleshooting---



### Docker Not Running## 🔌 API Documentation

**Error:** "The system cannot find the file specified" (Docker pipe error)

### Base URL

**Solution:**```

1. Open Docker Desktophttp://localhost:8001/api

2. Wait for it to fully initialize (2-3 minutes)```

3. Run `.\setup-database.ps1` again

### Authentication Endpoints

### Port Already in Use

**Error:** Port 8001, 3000, or 5432 already in use#### Register

```http

**Solution:**POST /api/auth/register

```powershellContent-Type: application/json

# Windows PowerShell

Get-NetTCPConnection -LocalPort 8001 | Stop-Process -Force{

Get-NetTCPConnection -LocalPort 3000 | Stop-Process -Force  "email": "user@example.com",

```  "password": "SecurePass123",

  "firstName": "João",

### Database Connection Failed  "lastName": "Silva",

**Error:** "Authentication failed against database server"  "phone": "+55 62 99999-9999",

  "role": "USER"

**Solution:**}

1. Stop all containers: `docker-compose down -v`

2. Remove volumes: Deletes data, starts freshResponse: 201 Created

3. Restart: `.\setup-database.ps1`{

  "success": true,

### Rate Limiter Blocking Requests  "data": {

**Error:** "Too many requests"    "user": { ... },

    "tokens": {

**Solution:**      "accessToken": "jwt...",

- Wait 15 minutes, or      "refreshToken": "jwt..."

- Restart backend to reset rate limiter    }

- For development, consider increasing limits in `backend/src/middleware/rateLimiter.ts`  }

}

### TypeScript Compilation Errors```



**Backend:**#### Login

```bash```http

cd backendPOST /api/auth/login

npm run buildContent-Type: application/json

```

{

**Frontend:**  "email": "user@example.com",

```bash  "password": "SecurePass123"

cd main-app}

npm run build

```Response: 200 OK

{

### PowerShell Script Errors  "success": true,

**Error:** Script syntax errors  "data": {

    "user": { ... },

**Solution:**    "tokens": {

- Scripts are now ASCII-only (no emojis/special characters)      "accessToken": "jwt...",

- If issues persist, check PowerShell execution policy:      "refreshToken": "jwt..."

  ```powershell    }

  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser  }

  ```}

```

---

#### Get Current User

## Architecture```http

GET /api/auth/me

### Authentication FlowAuthorization: Bearer <access_token>

1. User submits credentials to `/api/auth/login`

2. Backend validates credentials and generates JWT tokensResponse: 200 OK

3. Access token (24h) and refresh token (7d) returned{

4. Frontend stores tokens and includes access token in requests  "success": true,

5. When access token expires, use refresh token to get new one  "data": {

    "user": {

### Database Schema      "id": "uuid",

      "email": "user@example.com",

**Core Tables:**      "firstName": "João",

- **User**: Users with roles (USER, BROKER, CONSTRUCTION)      "lastName": "Silva",

- **Company**: Real estate and construction companies      "role": "USER"

- **Property**: Property listings with details and location    }

- **Favorite**: User favorites  }

- **ViewHistory**: Property view tracking}

- **RefreshToken**: JWT refresh token storage```



**Relationships:**### Property Endpoints

- User can own multiple Properties

- User can be linked to one Company#### List Properties

- Property belongs to one User (owner)```http

- Property can belong to one CompanyGET /api/properties?page=1&limit=10&city=Goiânia&type=APARTMENT

- User can have multiple Favorites

- User can have multiple ViewHistory entriesResponse: 200 OK

{

---  "success": true,

  "data": {

## Scripts    "properties": [ ... ],

    "pagination": {

### Database Setup      "page": 1,

- **setup-database.ps1**: Complete database initialization (Windows)      "limit": 10,

  - Checks Docker status      "total": 50,

  - Starts PostgreSQL container      "pages": 5

  - Applies Prisma schema    }

  - Seeds database with test data  }

}

### System Control```

- **start-system.ps1**: Start backend + frontend (Windows)

  - Clears ports---

  - Starts PostgreSQL

  - Starts backend on port 8001## 💻 Development Guide

  - Starts frontend on port 3000/4100

### Running Backend

### Testing```powershell

- **test-auth.ps1**: Test authentication endpoints (Windows)cd backend

  - Health checknpm run dev          # Development with watch mode

  - Login tests (all user types)npm run build        # Build TypeScript

  - Registration testnpm start            # Production mode

  - Property listing testnpx prisma studio    # Visual database editor

```

---

### Running Frontend

## License```powershell

cd main-app

MITnpm run dev          # Development server

npm run build        # Production build

---npm start            # Production server

npm run lint         # Check for issues

## Support```



For issues, questions, or contributions, please contact the development team.---



---## 🧪 Testing



**Last Updated:** October 20, 2025  ### Run E2E Tests

**Version:** 1.0.0  ```powershell

**Status:** Production Ready (Development Mode)cd main-app

npm run test:e2e
```

### Manual API Testing
```powershell
# Health check
Invoke-WebRequest -Uri http://localhost:8001/health

# List properties
Invoke-WebRequest -Uri http://localhost:8001/api/properties
```

---

## 🚢 Deployment

### Frontend (Vercel)
```bash
cd main-app
vercel
```

### Backend (Railway/Render)
```bash
cd backend
npm run build
# Set environment variables on platform
npm start
```

---

## 🔧 Troubleshooting

### Port Already in Use
```powershell
# Kill process on port
Get-Process -Id (Get-NetTCPConnection -LocalPort 4100).OwningProcess | Stop-Process -Force
```

### Database Issues
```powershell
cd backend
npx prisma generate
npx prisma db push
npx tsx prisma/seed-goiania.ts
```

### Clear Cache
```powershell
# Backend
cd backend
Remove-Item -Recurse -Force node_modules, dist
npm install

# Frontend
cd main-app
Remove-Item -Recurse -Force node_modules, .next
npm install
```

---

## 📚 Documentation

- **Quick Start**: `QUICK-START.md`
- **Test Report**: `TEST-EXECUTION-SUMMARY.md`
- **Verification**: `OVERALL-VERIFICATION.md`

---

## 🔐 Security

- Never commit `.env` files
- Change JWT secrets in production
- Use HTTPS in production
- Keep dependencies updated

---

**Built with ❤️ for the real estate industry in Goiânia, Brazil**
#   S i s t e m a - I m o v e i s - 2 5 - 1 0 - 2 0 2 5  
 