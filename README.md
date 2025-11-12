# Elevare AI Platform

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-Proprietary-red.svg)
![Status](https://img.shields.io/badge/status-MVP-green.svg)

**Enterprise SaaS Platform for AI Readiness, Portfolio Management, Compliance & ROI Analytics**

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Development](#development)
- [API Documentation](#api-documentation)
- [Security](#security)

---

## 🎯 Overview

**Elevare AI** is a multi-tenant, enterprise SaaS platform designed to help organizations measure AI readiness, manage AI/automation project portfolios, monitor compliance/governance, and quantify ROI.

### Business Value

- **Recurring Revenue**: $50K–$200K/year per tenant
- **Scalability**: Supports hundreds of tenants
- **High Margins**: Target 70–80% software margins
- **Defensible IP**: Proprietary assessment frameworks

### Target Users

- Executive Sponsors (CIO/CTO)
- AI Program/Portfolio Managers
- Compliance/GRC Leads
- Finance/PMO Teams
- Department Managers

---

## ✨ Features

### 1. Strategic Dashboard
Real-time AI readiness scoring, portfolio status, ROI summaries

### 2. Interactive AI Assessment
Multi-step wizard with benchmarking and auto-generated reports

### 3. Project Portfolio Management
Full lifecycle tracking with Jira integration

### 4. Compliance Monitoring
Real-time scoring across Privacy, Security, Model Risk, and Ethics

### 5. ROI Analytics
Project-level ROI with scenarios and portfolio aggregation

### 6. Integrations
Okta SSO, Snowflake, Jira Cloud

---

## 🏗️ Architecture

```
Client (Browser)
    ↓ HTTPS + JWT
Next.js App (React 18)
    ↓ REST API
NestJS API (Express)
    ↓
PostgreSQL + Redis + S3 + Okta
```

---

## 🛠️ Technology Stack

### Frontend
- Next.js 14 (App Router)
- React 18
- TailwindCSS + shadcn/ui
- TanStack Query + Zustand
- Recharts

### Backend
- NestJS (TypeScript)
- Prisma ORM
- PostgreSQL 15 (RLS)
- Redis 7 + BullMQ
- Swagger/OpenAPI

### Infrastructure
- Docker + Docker Compose
- AWS (ECS, RDS, ElastiCache, S3)
- Okta (OIDC + SCIM)

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Docker Desktop

### Installation

1. **Clone and install**
```bash
git clone <repository-url>
cd elevareai-demo
pnpm install
```

2. **Set up environment**
```bash
cp .env.example .env
```

3. **Start infrastructure**
```bash
docker-compose up -d postgres redis
```

4. **Run migrations and seed**
```bash
cd apps/api
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
```

5. **Start development servers**
```bash
pnpm dev
```

**Endpoints:**
- Frontend: http://localhost:3000
- API: http://localhost:3001
- API Docs: http://localhost:3001/api/docs

### Demo Credentials

After seeding:
- **Tenant**: Acme Corporation
- **User**: `admin@acme.com`
- **Departments**: Sales, Supply Chain, Finance, Operations, Admin

---

## 💻 Development

### Monorepo Structure

```
elevareai-demo/
├── apps/
│   ├── web/              # Next.js frontend
│   ├── api/              # NestJS backend
│   └── workers/          # BullMQ workers (planned)
├── packages/
│   ├── shared/           # Shared types (planned)
│   └── ui/               # Shared components (planned)
├── seed/
│   ├── questions.v1.json (36 questions)
│   ├── controls.v1.json  (24 controls)
│   └── packs/
│       ├── hipaa.v1.json (6 controls)
│       └── sox.v1.json   (6 controls)
└── docker-compose.yml
```

### Available Scripts

```bash
pnpm dev            # Start all apps
pnpm build          # Build all apps
pnpm lint           # Lint all apps
pnpm test           # Run tests

# Database
pnpm db:migrate     # Run migrations
pnpm db:seed        # Seed database
pnpm db:studio      # Prisma Studio
```

---

## 🔐 Security

### Multi-Tenancy
- Row-Level Security (RLS) on all tables
- Tenant isolation enforced at database level

### Authentication
- Okta OIDC (SSO)
- JWT tokens (httpOnly cookies)
- RBAC: Admin, Manager, Contributor, Viewer

### Compliance
- GDPR aligned
- SOC 2 ready
- HIPAA mode (optional)
- NIST AI RMF aligned

---

## 📊 API Documentation

**Swagger UI**: http://localhost:3001/api/docs

**Core Endpoints**:
```
POST   /api/auth/login
GET    /api/assessments
POST   /api/projects
GET    /api/compliance/matrix
GET    /api/dashboard/summary
```

---

## 📈 Roadmap

### Phase 1 (Current - MVP)
- [x] Monorepo setup
- [x] Database schema with RLS
- [x] Assessment framework
- [x] Seed data
- [ ] Auth (Okta)
- [ ] Scoring engine
- [ ] Portfolio management
- [ ] ROI analytics

### Phase 2 (Next 4-6 weeks)
- [ ] Dashboard
- [ ] Jira sync
- [ ] Snowflake connector
- [ ] E2E tests

---

## 📄 License

**Proprietary - Elevare AI © 2024**

All rights reserved.

---

<div align="center">

**Elevare AI Platform** | Version 1.0.0 | MVP

</div>
