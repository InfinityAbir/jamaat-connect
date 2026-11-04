# Jamaat Connect — Stakeholder Feedback (FEEDBACK.md)

This document records feedback from clients, supervisors, testers, and users, along with its impact on the project and implementation status.

---

## Feedback Log

| ID | Date | Source | Description | Impact | Status | Related Feature |
|---|---|---|---|---|---|---|
| FB-001 | 2026-10-19 | Client / Product Owner | Use SMTP for email sending; client will provide email and password credentials when needed. | Configurable SMTP email sender in Infrastructure layer with appsettings/env configuration; mock/fallback when credentials not set. | Accepted | Email / Notifications (Phase 1, 3, 4) |

---

## Feedback Log (Implementation Phase)

| ID | Date | Source | Description | Impact | Status | Related Feature |
|---|---|---|---|---|---|---|
| FB-001 | 2026-10-19 | Client / Product Owner | Use SMTP for email sending; client will provide email and password credentials when needed. | Configurable SMTP email sender in Infrastructure layer with appsettings/env configuration; mock/fallback when credentials not set. | Accepted | Email / Notifications (Phase 1, 3, 4) |
| FB-002 | 2026-10-21 | Development Team | Need to add missing translation keys for new components (submission steps, moderation actions, enquiry consent, etc.) | Update `en.json` and `bn.json` with new keys. | Accepted | Localization (Phase 3) |
| FB-003 | 2026-10-21 | Code Review | Enquiry form should support file attachments for evidence (future enhancement). | Deferred to post-MVP. Document in backlog. | Deferred | Enquiries (Phase 5+) |
| FB-004 | 2026-10-21 | Security Review | Ensure rate limiting is enforced on submission and enquiry endpoints. | ASP.NET Core RateLimiting middleware configured for auth, submission, and enquiry endpoints. | Accepted | Security (Phase 4) |

---

## Feedback Analysis Instructions

When new feedback is received:
1. Compare it with `doc/BRD.md`.
2. Check for conflicts with existing requirements.
3. Determine architectural or database impact.
4. Categorize as: `New Requirement`, `Clarification`, `Change Request`, or `Bug`.
5. Update this document and obtain approval before modifying other documentation or implementation.
