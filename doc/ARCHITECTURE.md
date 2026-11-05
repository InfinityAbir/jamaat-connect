# Jamaat Connect — System Architecture (ARCHITECTURE.md)

**Version:** 1.0  
**Status:** Approved Architectural Baseline  
**Source Requirement Document:** `doc/BRD.md` (serving as requirements source of truth)

---

## 1. Architectural Overview & System Vision

Jamaat Connect is a modern, community-driven web platform designed for discovering upcoming Tablighi Jamaat opportunities, submitting new listings, managing administrative moderation, and facilitating private enquiries between interested participants and verified organizers.

The system adopts a **Clean Layered Architecture** pattern with strict boundary enforcement, separation of public listing metadata from private submitter/contact information, and a mobile-optimized, dual-language frontend.

### Primary Technology Stack
- **Backend:** .NET 10 / ASP.NET Core Web API (C# 13 / .NET 10 SDK)
- **Frontend:** Angular 21 (TypeScript, Standalone Components, Reactive Forms, Signals)
- **Database:** PostgreSQL 16+ (Entity Framework Core 10 with Npgsql provider)
- **Containerization & Dev Env:** Docker and Docker Compose
- **Authentication & Authorization:** ASP.NET Core Identity + JWT (JSON Web Tokens) with Policy-Based Authorization

---

## 2. High-Level System Architecture

```
                               ┌─────────────────────────────────────────┐
                               │           Client Web Browser            │
                               │  (Angular 21 Application - SPA)         │
                               └────────────────────┬────────────────────┘
                                                    │
                                          HTTPS / REST API (JSON)
                                                    │
                                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   ASP.NET Core Web API (.NET 10)                                │
│                                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ API / Presentation Layer                                                                  │  │
│  │  - Controllers & Minimal API Endpoints                                                    │  │
│  │  - JWT Bearer Authentication & Policy-Based Authorization Guards                          │  │
│  │  - Rate Limiting, Input Validation Filters, ProblemDetails Error Handler                  │  │
│  └─────────────────────────────────────────────┬─────────────────────────────────────────────┘  │
│                                                │                                                │
│                                                ▼                                                │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Application Layer                                                                         │  │
│  │  - Use Cases & Application Services (Listing, Moderation, Enquiry, Location, Auth)        │  │
│  │  - DTOs, Mapping, FluentValidation Validators                                             │  │
│  │  - Service Interfaces (IEmailSender, INotificationService, IDateTimeProvider)             │  │
│  └─────────────────────────────────────────────┬─────────────────────────────────────────────┘  │
│                                                │                                                │
│                                                ▼                                                │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Domain Layer                                                                              │  │
│  │  - Core Entities (Listing, ListingContact, User, Location, Enquiry, ModerationAction)     │  │
│  │  - Domain Invariants & Enums (PublicationStatus, VerificationStatus, DateStatus)          │  │
│  │  - Domain Events & Business Rules (e.g. Submitter cannot approve own listing)             │  │
│  └─────────────────────────────────────────────▲─────────────────────────────────────────────┘  │
│                                                │                                                │
│                                                │ (Implements Interfaces)                        │
│  ┌─────────────────────────────────────────────┴─────────────────────────────────────────────┐  │
│  │ Infrastructure Layer                                                                      │  │
│  │  - Entity Framework Core DbContext (PostgreSQL Provider)                                  │  │
│  │  - Database Migrations & Data Seeding (Bangladesh Administrative Locations)               │  │
│  │  - Repositories / Direct EF Core Query Execution                                          │  │
│  │  - External Service Implementations (Email, Audit Logger)                                 │  │
│  └─────────────────────────────────────────────┬─────────────────────────────────────────────┘  │
└────────────────────────────────────────────────┼────────────────────────────────────────────────┘
                                                 │
                                                 ▼
                               ┌──────────────────────────────────┐
                               │      PostgreSQL Database         │
                               │  (Entities, Indexes, Constraints) │
                               └──────────────────────────────────┘
```

---

## 3. Project Structure & Repository Layout

The repository will be organized into a multi-project .NET solution and an Angular SPA workspace:

```
JamaatConnect/
├── doc/
│   ├── BRD.md                   # Source of truth for requirements
│   ├── ARCHITECTURE.md          # Architecture specification (this file)
│   ├── DESIGN.md                # UI/UX & Design system specification
│   ├── STATUS.md                # Roadmap & implementation tracker
│   ├── DECISIONS.md             # Architectural & technical decision record
│   ├── FEEDBACK.md              # Stakeholder feedback register
│   └── CONVENTIONS.md           # Coding standards & conventions
├── docker-compose.yml           # Local dev multi-container orchestration
├── docker-compose.dev.yml  # Local override configuration
├── .env.example                 # Environment variable template
├── .gitignore
├── JamaatConnect.sln            # .NET Solution file
│
├── src/
│   ├── backend/
│   │   ├── JamaatConnect.Domain/           # Entities, Enums, Value Objects, Rules
│   │   ├── JamaatConnect.Application/      # DTOs, Use Cases, Interfaces, Validators
│   │   ├── JamaatConnect.Infrastructure/   # EF Core, DbContext, Migrations, Repositories
│   │   └── JamaatConnect.Api/              # Controllers, Extensions, Middleware, Program.cs
│   │
│   └── frontend/
│       ├── src/
│       │   ├── app/
│       │   │   ├── core/                   # Auth guards, Interceptors, Core Services
│       │   │   ├── shared/                 # UI Components, Pipes, Directives, Design Tokens
│       │   │   ├── features/
│       │   │   │   ├── home/               # Homepage component
│       │   │   │   ├── listings/           # Search, Details, Submit Listing
│       │   │   │   ├── enquiries/          # Private Enquiry form & dialogs
│       │   │   │   ├── organizer/          # Submitter & Organizer Dashboard
│       │   │   │   ├── moderation/         # Moderator queue & actions
│       │   │   │   ├── admin/              # User, Location & System Management
│       │   │   │   └── auth/               # Sign In, Register, Account Recovery
│       │   │   └── app.routes.ts           # Standalone Routing Table
│       │   ├── assets/                     # i18n JSON translations (bn.json, en.json), icons
│       │   └── styles.css                  # Global Tailwind / Custom Design System CSS
│       ├── angular.json
│       ├── package.json
│       └── Dockerfile
│
└── tests/
    ├── JamaatConnect.Domain.Tests/        # Unit tests for domain rules
    ├── JamaatConnect.Application.Tests/   # Unit tests for use cases & validation
    ├── JamaatConnect.Api.IntegrationTests/# Integration tests with WebApplicationFactory + PostgreSQL
    └── e2e/                               # Playwright browser end-to-end test suite
```

---

## 4. Subsystems, Layers, and Responsibilities

### 4.1 Backend Architecture (.NET 10)

1. **`JamaatConnect.Domain` (Core Domain)**
   - Contains plain C# classes (Entities), Value Objects, and Enums.
   - Zero external dependencies (does not depend on EF Core or ASP.NET Core).
   - Encapsulates business invariants:
     - Date status checks (`Confirmed`, `Undecided`).
     - State transitions (`PendingReview` → `Approved`, `Rejected`, `ChangesRequested`, `Suspended`).
     - Validation logic regarding self-approval prevention.

2. **`JamaatConnect.Application` (Application Business Logic)**
   - Orchestrates use cases and application workflows.
   - Uses Data Transfer Objects (DTOs) for request/response contracts.
   - Defines FluentValidation rules for incoming commands and queries.
   - Defines interfaces for infrastructure dependencies (`IJamaatDbContext`, `IEmailService`, `ICurrentUserService`).

3. **`JamaatConnect.Infrastructure` (Data & External Services)**
   - Implements `JamaatDbContext` using EF Core 10 for PostgreSQL.
   - Configures entity mappings using `IEntityTypeConfiguration<T>`, index declarations, constraints, and UTC conversion.
   - Contains seed data for Bangladesh locations (Divisions, Districts, Upazilas).
   - Implements audit logging and email delivery services.

4. **`JamaatConnect.Api` (Presentation & HTTP Endpoints)**
   - Exposes RESTful JSON endpoints.
   - Configures JWT Bearer authentication and policy-based authorization handlers.
   - Applies global error handling via RFC 7807 `ProblemDetails`.
   - Integrates Rate Limiting middleware (`AspNetCore.RateLimiting`).
   - Configures OpenAPI / Swagger documentation.

### 4.2 Frontend Architecture (Angular 21)

1. **Standalone Component Pattern:** All components utilize Angular's standalone architecture (`standalone: true`).
2. **State Management & Reactivity:** Uses Angular Signals for UI state management (locale, current search filters, user context) and RxJS for asynchronous HTTP streams.
3. **Core Module (`app/core`):**
   - `AuthService` & `AuthGuard`: Manages JWT tokens, refresh flows, user role checking.
   - `LanguageService`: Handles switching between Bengali (`bn`) and English (`en`) with persisted preference.
   - `HttpErrorInterceptor`: Handles 401, 403, 422, and 500 API responses gracefully.
4. **Shared Module (`app/shared`):**
   - Reusable UI elements: Islamic visual pattern dividers, badges, status indicators, modal dialogs, pagination components, form field error messages.
5. **Feature Modules (`app/features`):**
   - Lazy-loaded feature routes ensuring fast initial bundle load times on mobile devices.

---

## 5. Database Approach & Data Privacy Model

### 5.1 Database Provider & Features
- **Database Engine:** PostgreSQL 16+.
- **ORM:** Entity Framework Core 10 with `Npgsql.EntityFrameworkCore.PostgreSQL`.
- **Primary Keys:** UUID (`Guid`) for all core tables to avoid auto-increment enumeration attacks.
- **Naming Convention:** All database tables, columns, constraints, and indexes use lower snake_case naming via EF Core naming conventions.
- **Timestamps:** All datetime fields are stored in UTC (`timestamp with time zone`).

### 5.2 Privacy Data Isolation Rule
A strict architectural boundary separates public listing data from private contact & verification data:

```
┌─────────────────────────────────────────────────────────────┐
│                    PUBLIC LISTING VIEW                      │
│ (Returned by GET /api/v1/listings, GET /api/v1/listings/{id})│
│                                                             │
│ - Title, Description, Departure Area, Date, Duration        │
│ - PublicationStatus, VerificationStatus, AvailabilityStatus │
│ - MeetingInstructions (when authorized for public)          │
│ - Last Updated Timestamp                                    │
│                                                             │
│  *** EXCLUDES ALL PRIVATE PHONE, EMAIL, AND ADDRESSES ***   │
└──────────────────────────────┬──────────────────────────────┘
                               │
            Private FK Relationship (1-to-1)
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   PRIVATE CONTACT DATA                      │
│             (Stored in `listing_contacts` table)            │
│                                                             │
│ - Submitter Private Phone, Submitter Private Email          │
│ - WhatsApp Number, Preferred Contact Method                 │
│ - Verification Identity Evidence Records                    │
│                                                             │
│ *** ACCESSIBLE ONLY BY AUTHORIZED MODERATORS & SUBMITTER ***│
└─────────────────────────────────────────────────────────────┘
```

---

## 6. API Boundaries and Endpoints Contract

All API endpoints reside under `/api/v1/` and return standard JSON payloads.

### Public Endpoints
- `GET /api/v1/listings` — Search approved listings (Supports pagination, location filter, date range, duration, availability).
- `GET /api/v1/listings/{id}` — Get single approved listing details (Revalidates publication and availability status).
- `POST /api/v1/listings` — Submit a new Jamaat listing (Creates record with `PendingReview` status).
- `POST /api/v1/listings/{id}/enquiries` — Send private enquiry to organizer (Requires explicit contact sharing consent).
- `POST /api/v1/listings/{id}/reports` — Submit a report against a misleading or abusive listing.
- `GET /api/v1/locations` — Get administrative location hierarchy (Divisions, Districts, Upazilas).

### Submitter & Organizer Endpoints (Authenticated)
- `GET /api/v1/my/submissions` — Retrieve user's submitted listings and moderation status.
- `GET /api/v1/my/submissions/{id}` — Get submission details with feedback/required corrections.
- `PUT /api/v1/my/submissions/{id}` — Update/correct a submission following moderation feedback.
- `POST /api/v1/my/submissions/{id}/withdraw` — Withdraw a pending submission.
- `GET /api/v1/my/enquiries` — Retrieve received or sent enquiries.

### Administrative & Moderation Endpoints (Moderator / Admin)
- `GET /api/v1/admin/moderation/queue` — Fetch pending listings for moderation with filter options.
- `POST /api/v1/admin/listings/{id}/approve` — Approve listing for public publishing.
- `POST /api/v1/admin/listings/{id}/request-changes` — Request corrections from submitter with mandatory reason.
- `POST /api/v1/admin/listings/{id}/reject` — Reject listing with mandatory reason.
- `POST /api/v1/admin/listings/{id}/suspend` — Immediately suspend an active listing.
- `GET /api/v1/admin/reports` — Review reported listings queue.
- `GET /api/v1/admin/audit-logs` — Review administrative audit log.

---

## 7. Authentication, Roles, and Authorization Policies

### User Roles
1. **Visitor:** Unauthenticated public user. Can browse, search, send enquiries, and submit listings.
2. **Registered Participant:** Authenticated user. Can track personal enquiries and submissions.
3. **Listing Submitter:** Role assigned upon submitting a listing. Can edit or withdraw pending listings.
4. **Organizer:** Verified user authorized to manage specific approved listings.
5. **Moderator:** Staff user. Can review queues, approve/reject listings, review reports, and request changes.
6. **Administrator:** System admin. Full access including user role assignments, location management, system settings, and audit logs.

### Authorization Policies & Security Principles
- **Least Privilege:** Authorization policies check specific permissions (`Permissions.Listings.Moderate`, `Permissions.Locations.Manage`).
- **Self-Approval Prevention Rule:** A moderator who submitted a listing is forbidden from approving their own submission. The backend policy `PreventSelfApprovalPolicy` enforces this at the API controller/service layer.
- **Data Filtering:** Public search SQL queries strictly filter by `PublicationStatus == Approved` AND `ExpiresAt > UTC_NOW` AND `AvailabilityStatus != Cancelled`.

---

## 8. Development, Docker, and Infrastructure Strategy

### Docker Compose Architecture
`docker-compose.yml` configures three core services:

```yaml
services:
  db:
    image: postgres:16-alpine
    container_name: jamaat_connect_db
    environment:
      POSTGRES_DB: jamaat_connect_dev
      POSTGRES_USER: jamaat_user
      POSTGRES_PASSWORD: jamaat_dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U jamaat_user -d jamaat_connect_dev"]
      interval: 5s
      timeout: 5s
      retries: 5

  api:
    build:
      context: ./src/backend
      dockerfile: JamaatConnect.Api/Dockerfile
    container_name: jamaat_connect_api
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ConnectionStrings__DefaultConnection=Host=db;Database=jamaat_connect_dev;Username=jamaat_user;Password=jamaat_dev_password
    ports:
      - "5000:8080"
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build:
      context: ./src/frontend
      dockerfile: Dockerfile
    container_name: jamaat_connect_frontend
    ports:
      - "4200:80"
    depends_on:
      - api
```

---

## 9. Architectural Principles & Rules

1. **Requirements Source of Truth:** `doc/BRD.md` is the final authority on functionality.
2. **No Secret Leaks:** No API keys, passwords, or personal contact details shall be hardcoded in repository files or returned in public API contracts.
3. **Dependency Direction:** Dependencies flow strictly inwards: `API` → `Infrastructure` → `Application` → `Domain`. Domain has zero external dependencies.
4. **Server-Side Authorization:** Never rely on frontend UI component hiding for security. All authorization logic is strictly checked on the backend API.
5. **Localization Invariant:** Business logic and database schemas store language-neutral keys/identifiers; localization is resolved in the presentation layer using translation files.
