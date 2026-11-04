# BUSINESS REQUIREMENTS DOCUMENT (BRD)
## Jamaat Connect
**Version:** 1.0  
**Status:** Implementation Specification  
**Initial Market:** Bangladesh  
**Future Scope:** International  
**Backend:** .NET 10 / ASP.NET Core Web API  
**Frontend:** Angular  
**Database:** PostgreSQL  
**Infrastructure:** Docker and Docker Compose

---

# 1. Executive Summary

Jamaat Connect is a community-driven web platform designed to help people discover upcoming Tablighi Jamaat opportunities, find relevant information about departure locations and dates, submit new Jamaat listings, and privately contact organizers.

Many people interested in participating in Tablighi Jamaat activities lack a centralized, accessible way to discover upcoming opportunities. Information is often shared through personal connections, local mosques, messaging groups, or word of mouth.

Jamaat Connect aims to make this information easier to discover while prioritizing authenticity, privacy, usability, and responsible community participation.

Anyone may submit a listing. However, every submission must pass moderation before becoming publicly visible.

The platform will initially target Bangladesh, using Bengali as its primary language and English as a secondary language. Its architecture must support future international expansion without requiring a complete redesign.

The product must deliver a modern, responsive, interactive interface inspired by Islamic visual design while maintaining excellent readability, accessibility, and usability.

# 2. Business Objectives

## 2.1 Primary objectives

1. Provide a centralized platform for discovering upcoming Jamaat opportunities.
2. Allow community members to submit upcoming Jamaat information.
3. Establish a moderation workflow to reduce inaccurate, duplicate, misleading, or abusive listings.
4. Enable interested participants to contact organizers privately.
5. Make discovery accessible through mobile devices and low-bandwidth connections.
6. Support Bengali and English interfaces.
7. Establish an extensible technical foundation for future international expansion.

## 2.2 Success metrics

The platform should track:

- Number of approved and active listings.
- Number of unique visitors using search.
- Number of enquiries submitted.
- Percentage of submissions approved.
- Median moderation turnaround time.
- Percentage of listings that expire or are cancelled correctly.
- Number of reported and confirmed misleading listings.
- Mobile performance and accessibility results.
- Successful completion rate for listing submission and enquiry flows.

These metrics must be measurable without unnecessarily collecting sensitive personal information.

# 3. Project Scope

## 3.1 Included in the MVP

- Public homepage and discovery page.
- Listing search, filters, sorting, pagination, and details.
- Public submission form with mandatory moderation.
- Submission status tracking.
- User registration and authentication where required.
- Private organizer enquiries.
- Optional phone and WhatsApp contact sharing with explicit consent.
- Organizer verification status.
- Administrative moderation dashboard.
- Listing reports and abuse handling.
- Hierarchical location management.
- Bengali and English interface.
- Responsive design for mobile, tablet, and desktop.
- Dockerized development environment.
- Automated tests, logging, and basic deployment documentation.

## 3.2 Excluded from the MVP

- Native Android or iOS applications.
- Real-time GPS tracking.
- Payments or financial transactions.
- Public participant directories.
- AI-generated religious advice.
- Unmoderated public publishing.
- Public disclosure of private organizer contact information.
- Automated claims that a person or Jamaat is religiously endorsed.
- Complex organizational management or international federation integrations.

# 4. Stakeholders and User Roles

## 4.1 Visitor

A visitor can:

- Browse approved listings.
- Search by location, departure date, duration, and availability.
- View listing details.
- Submit a private enquiry.
- Submit a listing report.
- Switch interface language.

Basic discovery must not require account registration.

## 4.2 Registered participant

A registered participant can:

- Manage their profile.
- Submit enquiries.
- Review their own enquiry history.
- Manage contact preferences.
- Request account deletion, subject to lawful retention requirements.

## 4.3 Listing submitter

A submitter can:

- Submit a new listing.
- Provide private verification contact information.
- Track submission status.
- Receive requests for corrections.
- Edit or withdraw eligible submissions.
- Review moderation feedback.

Submitting a listing does not automatically establish that the submitter is the official organizer.

## 4.4 Organizer

An organizer can:

- Manage listings they are authorized to manage.
- Review enquiries directed to them.
- Respond using permitted contact channels.
- Update availability and departure details.
- Request cancellation or closure.
- Maintain appropriate privacy preferences.

Organizer permissions must be explicitly granted and verified where appropriate.

## 4.5 Moderator

A moderator can:

- Review pending submissions.
- Approve, reject, or request corrections.
- Review reported listings.
- Suspend misleading listings.
- Review verification information within authorized limits.
- Add internal moderation notes.
- View moderation history.

## 4.6 Administrator

An administrator can:

- Manage users and roles.
- Configure locations and supported languages.
- Manage verification policies.
- Manage moderation permissions.
- Configure platform settings.
- Review audit records.
- Manage abuse controls and system configuration.

Administrative access must follow least-privilege principles.

# 5. Functional Requirements

Priority definitions:

- **P0:** Required for the initial launch.
- **P1:** Important enhancement after core workflows.
- **P2:** Future enhancement.

## 5.1 Homepage and discovery

**FR-001 (P0):** Display a clear Bengali-first homepage introducing Jamaat Connect.

**FR-002 (P0):** Provide a prominent search interface.

**FR-003 (P0):** Display approved upcoming listings.

**FR-004 (P0):** Provide clear navigation to search, listing submission, language settings, and help.

**FR-005 (P0):** Display loading, empty, error, and retry states.

**FR-006 (P1):** Display featured regions or popular search locations based on legitimate platform data.

## 5.2 Search and filtering

**FR-010 (P0):** Search approved listings by location.

**FR-011 (P0):** Filter by departure date or date range.

**FR-012 (P0):** Filter by duration.

**FR-013 (P0):** Filter by availability.

**FR-014 (P0):** Sort by departure date, newest listing, and other relevant criteria.

**FR-015 (P0):** Support pagination or accessible incremental loading.

**FR-016 (P0):** Exclude unpublished, rejected, suspended, cancelled, completed, and expired listings from default upcoming results.

**FR-017 (P0):** Revalidate listing visibility and status when opening details.

**FR-018 (P1):** Support saved searches and optional notifications.

Search must be server-side for scalability. The interface must not download all records and filter them locally.

## 5.3 Listing details

**FR-020 (P0):** Display title, departure area, departure date, duration, destination when available, availability, meeting instructions when authorized, and last-updated time.

**FR-021 (P0):** Display publication status separately from organizer verification status.

**FR-022 (P0):** Distinguish confirmed information from unknown or unconfirmed information.

**FR-023 (P0):** Provide a private enquiry action.

**FR-024 (P0):** Provide a report-listing action.

**FR-025 (P0):** Do not expose internal moderation notes, private phone numbers, identity evidence, or unpublished information.

**FR-026 (P0):** Display an appropriate warning that users should confirm current arrangements before travelling.

## 5.4 Listing submission

**FR-030 (P0):** Allow public submission without granting immediate publication rights.

**FR-031 (P0):** Validate all required fields on both the frontend and backend.

**FR-032 (P0):** Require a departure date or an explicitly supported undecided-date state, according to the publication policy.

**FR-033 (P0):** Allow custom duration values within configurable business limits.

**FR-034 (P0):** Capture departure location and optional destination information.

**FR-035 (P0):** Capture submitter contact information privately.

**FR-036 (P0):** Provide a preview before final submission.

**FR-037 (P0):** Generate a unique submission reference.

**FR-038 (P0):** Set every new submission to PendingReview.

**FR-039 (P0):** Prevent submitters from approving their own submissions.

**FR-040 (P0):** Support corrections, resubmission, and withdrawal.

**FR-041 (P0):** Detect likely duplicates and flag them for review.

**FR-042 (P0):** Notify the submitter of submission status changes where a verified notification channel exists.

## 5.5 Private enquiries

**FR-050 (P0):** Allow visitors to send enquiries from approved listings.

**FR-051 (P0):** Collect a name and message. Phone or WhatsApp must be optional.

**FR-052 (P0):** Clearly explain which contact information will be shared and with whom.

**FR-053 (P0):** Share optional contact details with the designated recipient only when the visitor explicitly consents.

**FR-054 (P0):** Prevent public access to enquiry messages and contact details.

**FR-055 (P0):** Associate enquiries with the listing and intended recipient.

**FR-056 (P0):** Implement rate limiting and anti-spam controls.

**FR-057 (P0):** Allow enquiry reporting and administrative abuse handling.

**FR-058 (P1):** Support email or other configurable notifications.

**FR-059 (P1):** Support optional WhatsApp contact links or integrations without requiring public disclosure of phone numbers.

## 5.6 Organizer verification

**FR-060 (P0):** Maintain a separate organizer verification status.

**FR-061 (P0):** Record the verification method, outcome, timestamp, reviewer, and relevant expiry date.

**FR-062 (P0):** Never equate basic contact validation with full identity verification.

**FR-063 (P0):** Provide moderators with a secure review process.

**FR-064 (P0):** Display only verification information approved for public disclosure.

**FR-065 (P1):** Support re-verification and expiration workflows.

## 5.7 Moderation

**FR-070 (P0):** Provide a moderation queue.

**FR-071 (P0):** Allow approval, rejection, requests for changes, suspension, and escalation.

**FR-072 (P0):** Require reasons for rejection and significant moderation actions.

**FR-073 (P0):** Record moderator identity, action, timestamp, and reason.

**FR-074 (P0):** Allow reports to be reviewed independently from publication approval.

**FR-075 (P0):** Support duplicate detection and suspicious activity flags.

**FR-076 (P0):** Prevent unauthorized role escalation.

**FR-077 (P0):** Preserve an auditable history of significant changes.

## 5.8 Location management

**FR-080 (P0):** Support country, administrative region, district, upazila or equivalent, and locality.

**FR-081 (P0):** Seed appropriate Bangladesh administrative location data.

**FR-082 (P0):** Store stable location identifiers rather than relying only on translated names.

**FR-083 (P0):** Support hierarchical parent-child relationships.

**FR-084 (P0):** Allow authorized administrators to maintain location data.

**FR-085 (P1):** Support additional countries and administrative hierarchies without schema redesign.

# 6. User Journeys

## 6.1 Discover a Jamaat

1. Visitor opens the homepage.
2. Visitor selects a district or enters a search query.
3. Visitor optionally applies date, duration, and availability filters.
4. System returns approved, eligible listings.
5. Visitor opens a result.
6. System displays the latest public listing details.
7. Visitor selects Send Enquiry.
8. Visitor completes the private enquiry form.
9. System validates and submits the enquiry.
10. System displays confirmation and the next steps.

## 6.2 Submit a listing

1. User opens Submit a Jamaat.
2. System explains publication and verification policies.
3. User enters listing information.
4. User enters private submitter contact information.
5. User reviews the privacy notice and consent options.
6. User previews the listing.
7. User submits.
8. System validates and stores the submission as PendingReview.
9. System generates a reference.
10. Moderator reviews the submission.
11. System records the decision.
12. Submitter receives a status update when possible.

## 6.3 Moderate a listing

1. Moderator signs in.
2. Moderator opens the pending queue.
3. Moderator inspects listing information and verification records.
4. Moderator checks duplicates and relevant reports.
5. Moderator approves, requests changes, rejects, or escalates.
6. System records the decision and reason.
7. Approved listings become publicly available.
8. Other decisions remain private until the applicable policy permits disclosure.

## 6.4 Contact an organizer

1. Visitor opens an approved listing.
2. Visitor selects Send Enquiry.
3. Visitor provides their name and message.
4. Visitor optionally provides phone or WhatsApp contact information.
5. System clearly explains any contact-sharing choice.
6. Visitor confirms submission.
7. System delivers the enquiry only to authorized recipients.
8. System provides a confirmation message without exposing the recipient's private information.

# 7. UI and UX Requirements

## 7.1 Visual direction

The interface must feel calm, trustworthy, welcoming, and contemporary, with an Islamic-inspired visual identity.

Use:

- Deep emerald or forest green as a primary brand color.
- Warm ivory or off-white backgrounds.
- Restrained gold or muted brass accents.
- Subtle geometric patterns used sparingly.
- Clear typography and generous spacing.
- Rounded surfaces with restrained shadows.
- Consistent line icons.
- Strong visual hierarchy and accessible contrast.

Avoid:

- Excessive decorative patterns.
- Overloaded dashboards.
- Unnecessary animations.
- Low-contrast gold text.
- Religious imagery that distracts from the product's purpose.
- Fake verification badges or fabricated social proof.
- Inaccessible color-only status indicators.

## 7.2 Required pages

**Public pages**

1. Homepage.
2. Search and discovery results.
3. Listing details.
4. Submit listing.
5. Submission confirmation and tracking.
6. Private enquiry form.
7. Enquiry confirmation.
8. About and community guidelines.
9. Privacy policy and terms.
10. Contact and reporting help.

**Authentication pages**

1. Sign in.
2. Registration where applicable.
3. Account recovery.
4. Email or phone verification where supported.

**Organizer pages**

1. Organizer dashboard.
2. My submissions.
3. Edit listing.
4. Manage enquiries.
5. Update availability.
6. Manage contact preferences.

**Administrative pages**

1. Moderation dashboard.
2. Submission review.
3. Listing reports.
4. Organizer verification review.
5. User and role management.
6. Location management.
7. Audit history.
8. Platform settings.

## 7.3 Responsive behavior

The UI must support:

- Mobile screens beginning at 320 CSS pixels.
- Modern Android phones.
- Tablets in portrait and landscape.
- Desktop screens.
- Touch-friendly controls.
- Keyboard navigation.
- Screen-reader labels.
- Responsive forms and tables.
- No horizontal overflow on standard application pages.

Use mobile card layouts instead of forcing wide administrative tables onto small screens.

## 7.4 Localization

Bengali is the default launch language. English must also be available.

Requirements:

- Use Angular internationalization or a suitable localization library.
- Keep UI strings out of business logic.
- Support Bengali and Latin text correctly.
- Support Unicode Bengali input.
- Use locale-aware date and number formatting.
- Avoid clipping longer translated labels.
- Provide an accessible language switcher.
- Do not translate official names or user-provided content without a defined policy.

# 8. Technical Architecture

## 8.1 Backend

Use .NET 10 and ASP.NET Core Web API.

Recommended structure:

- Domain: business entities, rules, and invariants.
- Application: use cases, validation, and interfaces.
- Infrastructure: PostgreSQL, email, notifications, and external integrations.
- API: endpoints, authentication, authorization, and serialization.
- Tests: unit, integration, and authorization tests.

Clean Architecture is recommended, but the implementation must remain proportionate to the project. Do not create unnecessary abstractions or introduce CQRS/MediatR solely for appearance.

Use Entity Framework Core with a PostgreSQL-compatible provider.

## 8.2 Frontend

Use Angular with:

- Standalone components where appropriate.
- Typed forms and validation.
- A consistent component system.
- Route guards for protected areas.
- HTTP interceptors where appropriate.
- Centralized error handling.
- Lazy-loaded feature areas.
- Server-side pagination and filtering.
- Accessible UI components.
- Responsive design tokens.

Use an appropriate, actively maintained UI/design system or component library after inspecting the existing repository and available skills.

Do not install multiple competing UI frameworks without a demonstrated need.

## 8.3 Database

Use PostgreSQL.

Core entities:

- Users
- Roles and permissions
- Countries
- Locations
- Listings
- ListingContacts
- OrganizerVerifications
- Enquiries
- ListingReports
- ModerationActions
- Notifications
- AuditEvents

Use UUID primary keys, foreign keys, indexes, migrations, constraints, and UTC timestamps.

Store private contact information separately from public listing data.

## 8.4 Docker

Provide:

- Dockerfile for the .NET API.
- Dockerfile for the Angular production build.
- Docker Compose configuration for local development.
- PostgreSQL service with persistent storage.
- Health checks.
- Environment-based configuration.
- Non-root runtime containers where practical.
- Documented database migration steps.
- `.env.example` without real secrets.

Do not commit credentials, API keys, private contact data, or production secrets.

Use explicit image tags and a reproducible build process. Avoid floating production dependencies wherever practical.

# 9. Conceptual Data Model

## Users

- Id
- DisplayName
- Email
- PhonePrivate
- AccountStatus
- CreatedAt
- UpdatedAt

## Listings

- Id
- SubmitterUserId
- OrganizerUserId, nullable
- DepartureLocationId
- Title
- Description
- DepartureAt, nullable when permitted
- DateStatus
- DurationDays, nullable when undecided
- DestinationLocationId, nullable
- DestinationText, nullable
- PublicationStatus
- VerificationStatus
- AvailabilityStatus
- PublishedAt
- ExpiresAt
- CreatedAt
- UpdatedAt

## ListingContacts

- Id
- ListingId
- ContactUserId, nullable
- PrivatePhone
- PrivateEmail
- WhatsAppNumber
- PreferredContactMethod
- ConsentRecordedAt
- UpdatedAt

## Enquiries

- Id
- ListingId
- SenderUserId, nullable
- SenderName
- SenderPhone, nullable
- SenderWhatsApp, nullable
- ContactSharingConsent
- Message
- Status
- CreatedAt
- RetentionUntil, where applicable

## OrganizerVerifications

- Id
- OrganizerUserId
- VerificationMethod
- Status
- ReviewedByUserId
- ReviewedAt
- ExpiresAt
- InternalNotes

## ModerationActions

- Id
- ListingId
- ModeratorUserId
- Action
- Reason
- CreatedAt

## ListingReports

- Id
- ListingId
- ReporterUserId, nullable
- Reason
- Description
- Status
- CreatedAt

This is a conceptual model. Before implementing migrations, the agent must reconcile relationships, normalization, constraints, deletion policies, and concurrency behavior.

# 10. API Requirements

Recommended REST endpoints:

- GET `/api/v1/listings`
- GET `/api/v1/listings/{id}`
- POST `/api/v1/listings`
- PATCH `/api/v1/listings/{id}`
- POST `/api/v1/listings/{id}/enquiries`
- POST `/api/v1/listings/{id}/reports`
- GET `/api/v1/my/submissions`
- GET `/api/v1/my/enquiries`
- GET `/api/v1/locations`
- GET `/api/v1/admin/moderation`
- POST `/api/v1/admin/listings/{id}/approve`
- POST `/api/v1/admin/listings/{id}/request-changes`
- POST `/api/v1/admin/listings/{id}/reject`
- POST `/api/v1/admin/listings/{id}/suspend`

All endpoints must implement appropriate validation and authorization.

Use consistent error responses, pagination metadata, and OpenAPI documentation.

Public responses must never contain private contact fields or internal moderation notes.

# 11. Security and Privacy

**NFR-001:** Enforce server-side authorization for all protected operations.

**NFR-002:** Apply least-privilege access control.

**NFR-003:** Validate and normalize user input.

**NFR-004:** Protect against injection, cross-site scripting, CSRF where applicable, and insecure direct object references.

**NFR-005:** Apply rate limits to submissions, enquiries, authentication, and reporting.

**NFR-006:** Protect private data in transit and at rest using appropriate infrastructure controls.

**NFR-007:** Never log passwords, authentication tokens, private message bodies, or unnecessary personal information.

**NFR-008:** Use secure authentication and password hashing, or a trusted identity provider.

**NFR-009:** Keep secrets outside source control.

**NFR-010:** Maintain audit records for sensitive administrative actions.

**NFR-011:** Define retention and deletion policies for private enquiries and verification records.

**NFR-012:** Obtain explicit consent before sharing optional contact details.

**NFR-013:** Provide a mechanism for privacy requests and abuse complaints.

**NFR-014:** Prevent unauthorized access to private uploaded evidence, if evidence uploads are introduced.

**NFR-015:** Do not expose precise meeting locations unless publication is authorized and appropriate.

Security implementation must be tested rather than inferred from framework defaults.

# 12. Nonfunctional Requirements

## Performance

- Aim for good Core Web Vitals under realistic mobile conditions.
- Avoid unnecessary JavaScript and oversized images.
- Use server-side pagination.
- Add database indexes for frequently used search fields.
- Cache only data that can safely be cached.
- Revalidate listing visibility when necessary.

## Availability and reliability

- Provide health endpoints.
- Configure structured logging.
- Document backup and restore procedures.
- Handle failed notification delivery gracefully.
- Avoid duplicate enquiries when clients retry requests.
- Use transactional operations for important state changes.

## Accessibility

Target WCAG 2.2 AA where applicable.

Support keyboard navigation, visible focus, semantic HTML, accessible form errors, meaningful labels, and sufficient contrast.

## Maintainability

- Enable nullable reference types in .NET where appropriate.
- Use strict TypeScript settings.
- Keep business rules out of UI components.
- Use automated formatting and linting.
- Document architectural decisions.
- Maintain automated tests for critical workflows.

# 13. Testing Strategy

Required test categories:

1. Unit tests for business rules.
2. API integration tests using a real PostgreSQL test environment or an appropriate test container.
3. Authentication and authorization tests.
4. Listing lifecycle tests.
5. Enquiry privacy tests.
6. Moderation workflow tests.
7. Location hierarchy and search tests.
8. Angular component and service tests.
9. End-to-end tests for primary user journeys.
10. Responsive UI checks.
11. Accessibility checks.
12. Docker build and startup tests.
13. Database migration and recovery tests.

Critical scenarios include:

- An unapproved listing is never returned by public search.
- A submitter cannot approve their own listing.
- A visitor cannot access another user's private enquiries.
- Public listing responses never expose private contact details.
- A rejected listing cannot be published accidentally.
- A suspended listing becomes unavailable publicly.
- A cancelled listing is removed from upcoming results.
- Optional contact information is shared only with recorded consent.
- Unauthorized users cannot access administrative functions.
- Invalid dates and durations are rejected by the backend.

# 14. Implementation Phases

## Phase 0: Repository and environment audit

- Inspect the current repository.
- Read project documentation and existing architecture.
- Inspect Git status and uncommitted changes.
- Inspect Codebase Memory MCP and relevant prior decisions.
- Discover available UI/design skills and inspect their instructions.
- Identify existing components, dependencies, tests, and deployment configuration.
- Produce a gap analysis and implementation plan.

No destructive changes may be made during this phase.

## Phase 1: Foundation and design system

- Configure the application structure.
- Establish design tokens and theme.
- Implement responsive navigation.
- Build shared components and localization.
- Establish Docker-based local development.

## Phase 2: Discovery and listing management

- Implement the data model and migrations.
- Implement listing APIs.
- Build homepage, search, details, and submission pages.
- Implement validation and status handling.

## Phase 3: Enquiries and moderation

- Implement private enquiry handling.
- Implement moderation dashboard.
- Implement organizer verification records.
- Implement reporting, audit records, and notifications.

## Phase 4: Security and quality

- Run automated tests.
- Perform authorization and privacy checks.
- Test responsive behavior and accessibility.
- Review dependency and container security.
- Fix defects and document unresolved risks.

## Phase 5: Deployment readiness

- Build production containers.
- Validate environment configuration.
- Verify database migrations and backups.
- Configure HTTPS and operational logging.
- Produce deployment and recovery documentation.

Each phase must have verifiable acceptance criteria before the agent moves to the next phase.

# 15. Definition of Done

The MVP is complete only when:

- All P0 requirements are implemented or explicitly documented as blocked.
- The frontend and backend build successfully.
- Database migrations run successfully.
- Docker services start and pass health checks.
- Critical automated tests pass.
- Core journeys work end to end.
- Private data remains protected.
- Moderation and publication rules are enforced server-side.
- The interface is responsive and usable in Bengali and English.
- Setup, testing, deployment, and recovery instructions are documented.
- Known limitations and outstanding risks are reported honestly.

A successful compilation alone does not mean the product is complete.

# 16. Instructions to the AI Coding Agent

You are responsible for implementing Jamaat Connect according to this BRD.

Follow these instructions strictly.

1. Inspect the existing repository before modifying any files.
2. Check Git status and preserve uncommitted changes.
3. Use Codebase Memory MCP to inspect available project context, architectural decisions, conventions, and previous work.
4. Discover available UI and design skills. Read the relevant skill instructions before implementation and use the tools they recommend.
5. Do not assume that the repository is empty. Reuse suitable existing components and services.
6. Produce a repository audit and a requirement-to-implementation plan before making changes.
7. Identify missing information and make conservative, documented assumptions.
8. Use .NET 10, Angular, PostgreSQL, Docker, and Docker Compose unless a repository constraint is discovered and explicitly reported.
9. Build a polished, modern, interactive, responsive, Islamic-inspired UI. Prioritize real usability over decorative effects.
10. Use Bengali as the default interface language and provide English localization.
11. Implement all authorization and privacy controls in the backend. Hiding a button is not authorization.
12. Do not use fake listings, fabricated verification claims, or simulated successful backend operations as production functionality.
13. Use mock data only for clearly identified development previews and tests.
14. Never hardcode secrets or overwrite user data.
15. Implement in small, verifiable phases.
16. Run relevant tests, builds, linting, and Docker checks after changes.
17. Investigate failures and fix them rather than suppressing errors.
18. Review the Git diff for accidental changes and security problems.
19. Maintain a checklist mapping every requirement ID to its implementation and test evidence.
20. Do not claim that a requirement is complete without verifying it.
21. If a tool, MCP server, integration, or external service is unavailable, report that limitation honestly and continue with a safe alternative.
22. At completion, provide a summary of files changed, architecture decisions, commands executed, tests passed and failed, outstanding work, and deployment instructions.

## Required first response from the coding agent

Before writing code, report:

- Repository structure and existing application state.
- Available Codebase Memory MCP context and relevant findings.
- Available UI/design skills and how they will be applied.
- Existing frontend and backend frameworks.
- Existing database and Docker configuration.
- Missing infrastructure or dependencies.
- Requirement gaps and technical risks.
- Proposed implementation sequence.

Then begin implementation only after this audit and plan are complete.

---

**End of BRD**
