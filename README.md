# Project HRIS

> Industrial-Level Human Resource Information System

A comprehensive, enterprise-grade HRIS built with modern technologies, designed for scalability, security, and compliance with international standards.

## Technology Stack

| Layer | Technology |
|---|---|
| **Backend** | NestJS 11, Prisma 6, PostgreSQL 16, Redis 7 |
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript 5.7 |
| **Search** | Elasticsearch 8 |
| **Storage** | MinIO (S3-compatible) |
| **ML** | Python FastAPI (planned) |
| **Infra** | Docker, Kubernetes, Turborepo |

## Getting Started

### Prerequisites
- Node.js 22+
- pnpm 9+
- Docker & Docker Compose

### Setup

```bash
# 1. Clone the repository
git clone <repo-url> && cd Project_HRIS

# 2. Copy environment file
cp .env.example .env

# 3. Start infrastructure services
docker compose up -d

# 4. Install dependencies
pnpm install

# 5. Generate Prisma client & run migrations
pnpm db:generate
pnpm db:migrate

# 6. Seed the database
pnpm db:seed

# 7. Start development servers
pnpm dev
```

### Access Points
- **Web App**: http://localhost:3000
- **API**: http://localhost:3001
- **API Docs (Swagger)**: http://localhost:3001/api/docs
- **MinIO Console**: http://localhost:9001
- **MailHog (Email Testing)**: http://localhost:8025

### Default Admin Login
- **Email**: `admin@hris-demo.com`
- **Password**: `Admin@2026!`

## Project Structure

```
Project_HRIS/
├── apps/
│   ├── api/          # NestJS Backend API
│   └── web/          # Next.js Frontend
├── packages/
│   └── shared/       # Shared types, constants, validations
├── services/
│   └── ml/           # Python ML microservice (planned)
├── docker/           # Docker initialization scripts
├── docker-compose.yml
├── turbo.json
└── pnpm-workspace.yaml
```

## Core Modules

- **Authentication** — JWT, MFA, RBAC + ABAC, account locking
- **Employee Management** — Profiles, documents, org chart, skills
- **Attendance** — Clock-in/out, shift management, overtime
- **Leave Management** — Configurable types, approval workflows, balance tracking
- **Payroll** — Salary structures, tax engine, payslip generation
- **Recruitment** — ATS, interview scheduling, offer management
- **Performance** — OKR/KPI, 360° feedback, review cycles
- **Training** — Course catalog, enrollments, certifications
- **Policy Engine** — Version-controlled policies with executable rules
- **Analytics** — HR dashboards, ML-powered insights
- **Self-Diagnostics** — Health monitoring, self-healing capabilities

## License

UNLICENSED — Proprietary
