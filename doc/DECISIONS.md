# Jamaat Connect — Technical & Architectural Decisions (DECISIONS.md)

This document records important technical and architectural decisions made during the project, including the reasoning and context behind them.

---

## ADR-001: Requirements Source of Truth
**Date:** 2026-10-19  
**Status:** Approved  

**Context:**  
The repository contains `doc/BRD.md` (Business Requirements Document) which provides comprehensive functional and non-functional requirements. The project workflow expects `doc/PRD.md`.

**Decision:**  
We will treat `doc/BRD.md` as the primary source of truth for requirements, equivalent to `PRD.md`. We will NOT rename, modify, or create a separate `PRD.md` to avoid duplication and confusion.

**Consequences:**  
All documentation and implementation must align with `doc/BRD.md`.

---

## ADR-002: Technology Stack Selection
**Date:** 2026-10-19  
**Status:** Approved  

**Context:**  
The project requires a modern, scalable, and maintainable stack that supports high performance on mobile devices and easy deployment.

**Decision:**  
The stack is finalized as:
- **Backend:** .NET 10 / ASP.NET Core Web API (for robustness, performance, and strong typing).
- **Frontend:** Angular 21 (for enterprise-grade SPA architecture, standalone components, and strong localization support).
- **Database:** PostgreSQL 16+ (for relational integrity, JSON support, and cloud-native compatibility).
- **Infrastructure:** Docker and Docker Compose (for reproducible environments).

**Consequences:**  
Requires .NET 10 SDK and Node.js 24+ in the development environment.

---

## ADR-003: Architectural Pattern — Clean Layered Architecture
**Date:** 2026-10-19  
**Status:** Approved  

**Context:**  
The project requires clear separation of concerns, especially between public data and private contact information, and must support future expansion.

**Decision:**  
Implement a **Clean Layered Architecture** with four layers in the backend:
1. `Domain`: Business entities and rules.
2. `Application`: Use cases and workflow orchestration.
3. `Infrastructure`: Persistence and external services.
4. `Api`: HTTP endpoints and authorization.

**Consequences:**  
Increases initial boilerplate but ensures long-term maintainability and strict boundary enforcement for privacy.

---

## ADR-004: Data Privacy Isolation
**Date:** 2026-10-19  
**Status:** Approved  

**Context:**  
Privacy is a core requirement. Submitter and organizer contact information must never be exposed to the public until explicit consent is given for a specific enquiry.

**Decision:**  
Strictly separate `Listings` (public) from `ListingContacts` (private) at the database level and API DTO level. Public GET endpoints will use specialized DTOs that explicitly omit private fields.

**Consequences:**  
Requires careful mapping and authorization checks in the `Application` layer.

---

## ADR-005: Localization Approach (Bengali First)
**Date:** 2026-10-19  
**Status:** Approved  

**Context:**  
The primary market is Bangladesh. The platform must be Bengali-first but support English.

**Decision:**  
- Default `lang="bn"`.
- Use Angular's standard localization patterns (i18n or library-based JSON translation) for UI strings.
- Store location names and category labels with multi-language support (or resolved via IDs and translation files).

**Consequences:**  
All UI development must account for string length variations between Bengali and English.

---

## ADR-006: Primary Keys — UUID (Guid)
**Date:** 2026-10-19  
**Status:** Approved  

**Context:**  
Using integer primary keys allows enumeration attacks (e.g., browsing `/api/listings/123`, then `/api/listings/124`).

**Decision:**  
Use **UUID (Guid)** for all primary keys in the database.

**Consequences:**  
Prevents easy enumeration of listings and enquiries. Increases storage slightly but improves security.

---

## ADR-007: SMTP Email Notification Implementation
**Date:** 2026-10-19  
**Status:** Approved (Stakeholder Feedback FB-001)  

**Context:**  
The platform requires notification capabilities for listing submission status updates, moderation results, and enquiries. We need to support standard SMTP email delivery with credentials configurable via environment variables / configuration settings.

**Decision:**  
Implement an `ISmtpEmailService` in `JamaatConnect.Infrastructure` configured via `SmtpSettings` (Host, Port, Username, Password, SenderEmail, SenderName, EnableSsl). When credentials are not yet supplied or in development/test environments without SMTP, the service logs the email content to structured logs or a local mock inbox safely without failing requests. When credentials are provided, it connects via MailKit / `System.Net.Mail` with SSL/TLS.

**Consequences:**
Clean configuration via `.env` / `appsettings.json`, no vendor lock-in to proprietary email APIs, and safe fallback during development.

---

## ADR-008: Multi-step Listing Submission Wizard
**Date:** 2026-10-21
**Status:** Approved

**Context:**
Listing submission requires collecting basic information, details, private contact information, and consent from submitters. The BRD requires a preview step before final submission.

**Decision:**
Implement a 5-step wizard in the frontend:
1. Basic Info (Title, Location, Date, Availability)
2. Details (Duration, Destination, Description)
3. Private Contact (Name, Phone, Email, WhatsApp, Preferred Method, Consent)
4. Preview (public-facing card preview)
5. Confirmation (Reference ID, tracking link)

Backend validates all required fields and enforces business rules (future dates, duration limits, date status).

**Consequences:**
Better UX with progressive disclosure, clear validation at each step, and reduced submission errors. Matches BRD requirements for preview and consent.

---

## ADR-009: Moderation Queue & Self-Approval Prevention
**Date:** 2026-10-21
**Status:** Approved

**Context:**
Moderators need a queue to review pending listings. The BRD explicitly states: "Prevent submitters from approving their own submissions."

**Decision:**
- Backend `ModerationService` enforces self-approval prevention: checks if `listing.SubmitterUserId == moderatorUserId` and returns `FORBIDDEN` for Approve, RequestChanges, Reject, and Suspend actions.
- Frontend `QueueComponent` shows a warning banner when a moderator views their own submission.
- Moderation queue includes tabs for Pending Listings, Reports, and Enquiry moderation.
- Actions: Approve (sets PublishedAt, 90-day expiry), RequestChanges, Reject, Suspend.
- All actions create `ModerationAction` audit records and send email notifications.

**Consequences:**
Strong server-side enforcement of the self-approval rule. UI provides clear feedback. Full audit trail maintained.

---

## ADR-010: Private Enquiry with Consent-Based Contact Sharing
**Date:** 2026-10-21
**Status:** Approved

**Context:**
Visitors can send private enquiries to organizers. The BRD requires explicit consent before sharing optional contact details (Phone, WhatsApp).

**Decision:**
- Enquiry form collects Name, Message (required), Phone, WhatsApp (optional).
- Checkbox for "Share my contact with organiser" with clear explanation.
- Backend stores `ContactSharingConsent` flag with enquiry.
- Organiser-facing views only show contact details when consent is true.
- Public API endpoints never return private contact information.

**Consequences:**
Privacy-by-design approach. Clear user consent. No accidental contact leakage.

---

## ADR-011: Frontend Architecture - Custom Components with Tailwind CSS
**Date:** 2026-10-21
**Status:** Approved

**Context:**
Need a modern, responsive UI with Islamic-inspired design. The BRD specifies design tokens (emerald, gold, ivory) and custom components.

**Decision:**
Build custom Angular standalone components using Tailwind CSS v4 for styling. No external UI component library (Angular Material, etc.) to keep bundle size small and maintain full design control.

Components: Button, Card, Badge, Skeleton, Modal/Dialog patterns, Form inputs, Stepper.

**Consequences:**
Smaller bundle, full design system control, no dependency on external library updates. Slightly more initial development effort.

---

## ADR-012: Database Migrations & Seeding on Startup
**Date:** 2026-10-21
**Status:** Approved

**Context:**
Need reliable database initialization in Docker environments.

**Decision:**
In `Program.cs`, automatically run `db.Database.MigrateAsync()` and `SeedData.SeedAsync(db)` on application startup. This ensures schema and seed data (Bangladesh locations, default roles) are always up to date.

**Consequences:**
Zero-config database setup for development and CI/CD. Must handle migration failures gracefully in production.

---

## ADR-013: Docker Multi-stage Builds
**Date:** 2026-10-21
**Status:** Approved

**Context:**
Production containers should be minimal and secure.

**Decision:**
- API: Multi-stage Dockerfile using `mcr.microsoft.com/dotnet/sdk:10.0-alpine` for build and `mcr.microsoft.com/dotnet/aspnet:10.0-alpine` for runtime. Non-root user.
- Frontend: Multi-stage using `node:24-alpine` for build (`ng build --configuration production`) and `nginx:alpine` for serving static files.
- Docker Compose orchestrates DB, API, Frontend with health checks and dependency ordering.

**Consequences:**
Small, secure production images. Reproducible builds. Health checks enable proper container orchestration.
