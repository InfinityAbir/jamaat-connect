# Jamaat Connect — Manual Testing Checklist

**Version:** 1.0
**Date:** 2026-10-21
**Based on:** `doc/BRD.md`, `doc/DESIGN.md`, implemented application

---

## Test Organization

| Priority | Description |
|---|---|
| **P0** | Critical - Blocks release if failed |
| **P1** | High - Major functionality, should be fixed before release |
| **P2** | Medium - Minor issues, can be addressed post-release |
| **P3** | Low - Nice to have, cosmetic |

---

## 1. Authentication & Authorization

| Test ID | Scenario | Steps | Expected Result | Priority |
|---|---|---|---|---|
| AUTH-01 | User Registration | 1. Navigate to `/auth/register`<br>2. Fill valid details (name, email, password, confirm)<br>3. Submit | Account created, JWT tokens stored, redirected to home, user menu shows display name | P0 |
| AUTH-02 | User Login | 1. Navigate to `/auth/login`<br>2. Enter valid credentials<br>3. Submit | Login successful, tokens stored, redirected to home | P0 |
| AUTH-03 | Invalid Login | 1. Enter invalid email/password<br>2. Submit | Error message displayed, no tokens stored | P0 |
| AUTH-04 | JWT Token Refresh | 1. Login<br>2. Wait for access token to expire (or simulate)<br>3. Make API call | New access token obtained silently, request succeeds | P1 |
| AUTH-05 | Logout | 1. Login<br>2. Click user menu → Logout | Tokens cleared, redirected to home, user menu shows Login/Register | P0 |
| AUTH-06 | Protected Route Access (Unauthenticated) | 1. Navigate to `/submit` without login | Redirected to `/auth/login` with return URL | P0 |
| AUTH-07 | Role-Based Access (Moderator) | 1. Login as moderator<br>2. Navigate to `/moderation` | Moderation queue visible | P0 |
| AUTH-08 | Role-Based Access (Admin) | 1. Login as admin<br>2. Navigate to `/admin` | Admin dashboard visible with locations/users tabs | P0 |
| AUTH-09 | Role-Based Access (Participant) | 1. Login as participant<br>2. Navigate to `/moderation` | Access denied (403) or redirected | P0 |
| AUTH-10 | Self-Approval Prevention | 1. Login as moderator who submitted a listing<br>2. Go to moderation queue<br>3. Try to approve own listing | "Moderators cannot approve their own submissions" error, action blocked | P0 |

---

## 2. User Roles & Permissions

| Test ID | Scenario | Steps | Expected Result | Priority |
|---|---|---|---|---|
| ROLE-01 | Visitor can browse listings | 1. Open homepage without login<br>2. Go to search<br>3. View listings | Listings visible, no login required | P0 |
| ROLE-02 | Visitor can send enquiry | 1. Open approved listing<br>2. Click "Send Enquiry"<br>3. Fill form, submit | Enquiry created, success message shown | P0 |
| ROLE-03 | Visitor cannot see private contact | 1. Open listing detail<br>2. Check for phone/email in public view | No private contact info visible | P0 |
| ROLE-04 | Submitter can track submissions | 1. Login as submitter<br>2. Go to `/my/submissions` | List of own submissions with status badges | P0 |
| ROLE-05 | Submitter can withdraw pending | 1. Have pending submission<br>2. Click "Withdraw"<br>3. Confirm | Status changes to Cancelled, no longer in queue | P1 |
| ROLE-06 | Submitter can edit when ChangesRequested | 1. Have submission with ChangesRequested<br>2. Click "Edit"<br>3. Modify and save | Submission updated, status remains ChangesRequested | P1 |
| ROLE-07 | Moderator can approve listing | 1. Login as moderator<br>2. Go to moderation queue<br>3. Click Review → Approve with reason | Status → Approved, PublishedAt set, email sent to submitter | P0 |
| ROLE-08 | Moderator can request changes | 1. Click Review → Request Changes with reason | Status → ChangesRequested, email sent | P0 |
| ROLE-09 | Moderator can reject listing | 1. Click Review → Reject with reason | Status → Rejected, email sent | P0 |
| ROLE-10 | Moderator can suspend approved | 1. Find approved listing in queue<br>2. Click Review → Suspend with reason | Status → Suspended, no longer in public search | P1 |
| ROLE-11 | Admin can manage locations | 1. Login as admin<br>2. Go to `/admin/locations`<br>3. Add/Edit/Delete location | CRUD operations work, hierarchy maintained | P1 |
| ROLE-12 | Admin can manage users | 1. Go to `/admin/users`<br>2. View user list, roles | User list with roles displayed | P1 |

---

## 3. Core Workflows

### 3.1 Discovery & Search

| Test ID | Scenario | Steps | Expected Result | Priority |
|---|---|---|---|---|
| DISC-01 | Homepage loads | 1. Open `/` | Hero, features, CTA buttons visible | P0 |
| DISC-02 | Search page loads | 1. Navigate to `/search` | Filters sidebar, empty/loading state | P0 |
| DISC-03 | Filter by location | 1. Select division → district<br>2. Observe results | Listings filtered to selected location | P0 |
| DISC-04 | Filter by date range | 1. Set date from/to<br>2. Apply | Listings within date range | P0 |
| DISC-05 | Filter by duration | 1. Select duration (e.g., 3 days) | Listings with matching duration | P0 |
| DISC-06 | Filter by availability | 1. Select "Available" | Only available listings shown | P0 |
| DISC-07 | Sort by date | 1. Select "Earliest First" / "Latest First" | Results sorted correctly | P1 |
| DISC-08 | Sort by newest | 1. Select "Newest First" | Results sorted by CreatedAt desc | P1 |
| DISC-09 | Pagination | 1. Have >12 results<br>2. Click Next/Previous | Page changes, correct items shown | P1 |
| DISC-10 | Clear filters | 1. Apply multiple filters<br>2. Click "Clear Filters" | All filters reset, all listings shown | P1 |
| DISC-11 | Empty state | 1. Filter with no matching results | Friendly message with "Clear Filters" button | P1 |
| DISC-12 | Loading skeletons | 1. Reload search page | Skeleton cards shown while loading | P2 |

### 3.2 Listing Details

| Test ID | Scenario | Steps | Expected Result | Priority |
|---|---|---|---|---|
| DET-01 | View approved listing | 1. Click listing from search<br>2. View `/listing/:id` | All public fields displayed (title, location, date, duration, destination, availability, verification badge) | P0 |
| DET-02 | Publication status badge | 1. View approved listing | Green "Approved" badge | P0 |
| DET-03 | Verification status badge | 1. View listing with verification | Appropriate badge (Verified/Not Verified/Expired) | P1 |
| DET-04 | Travel warning displayed | 1. View any listing | "Please confirm current arrangements before travelling" notice visible | P0 |
| DET-05 | Private contact NOT visible | 1. View listing detail<br>2. Check for phone/email/WhatsApp | No private contact info in public view | P0 |
| DET-06 | Meeting instructions (if applicable) | 1. View listing with meeting info | Instructions displayed when authorized | P1 |

### 3.3 Listing Submission

| Test ID | Scenario | Steps | Expected Result | Priority |
|---|---|---|---|---|
| SUB-01 | Submit new listing (5 steps) | 1. Login → `/submit`<br>2. Step 1: Title, Location, Date, Availability<br>3. Step 2: Duration, Destination, Description<br>4. Step 3: Name, Phone, Email, WhatsApp, Preferred Method, Consent<br>5. Step 4: Preview shows public card<br>6. Step 5: Submit | Success screen with Reference ID (e.g., JC-A1B2C3D4), status "PendingReview" | P0 |
| SUB-02 | Required field validation | 1. Try to proceed without required fields | Inline validation errors, cannot proceed | P0 |
| SUB-03 | Date validation (future dates) | 1. Enter past date for departure | Error: "Departure date must be in the future" | P0 |
| SUB-04 | Duration limits | 1. Enter 0 or 366 days | Error: "Duration must be positive" / "cannot exceed 365 days" | P1 |
| SUB-05 | Phone format validation | 1. Enter invalid phone | Error: "Invalid phone number format" | P1 |
| SUB-06 | Email format validation | 1. Enter invalid email | Error: "Invalid email format" | P1 |
| SUB-07 | Date status Undecided | 1. Select "Undecided"<br>2. Date field disabled | Date field hidden/disabled, can proceed without date | P1 |
| SUB-08 | Preview shows correct data | 1. Reach Step 4<br>2. Verify all entered data | All fields match input, private contact not shown | P0 |
| SUB-09 | Consent required | 1. Try to submit without consent checkbox | Cannot proceed, consent required | P0 |
| SUB-10 | Pre-filled user info | 1. Login as registered user<br>2. Go to submit | Name pre-filled from profile | P1 |
| SUB-11 | Submission reference format | 1. Complete submission | Reference format: JC-XXXXXXXX (8 chars) | P1 |
| SUB-12 | Tracking link works | 1. Click "Track your submission"<br>2. Go to `/my/submissions` | Submission listed with correct reference | P0 |

### 3.4 Private Enquiries

| Test ID | Scenario | Steps | Expected Result | Priority |
|---|---|---|---|---|
| ENQ-01 | Send enquiry without contact | 1. Open listing<br>2. Click "Send Enquiry"<br>3. Fill Name, Message only<br>4. Submit | Success message, enquiry created with consent=false | P0 |
| ENQ-02 | Send enquiry with phone sharing | 1. Fill Name, Message, Phone<br>2. Check "Share my contact"<br>3. Submit | Success, consent=true, phone stored | P0 |
| ENQ-03 | Send enquiry with WhatsApp sharing | 1. Fill Name, Message, WhatsApp<br>2. Check consent<br>3. Submit | Success, consent=true, WhatsApp stored | P1 |
| ENQ-04 | Consent explanation clear | 1. Open enquiry modal<br>2. Read consent text | Clear explanation of what is shared and with whom | P0 |
| ENQ-05 | Enquiry not public | 1. Send enquiry<br>2. Check public listing API | No enquiry data in public responses | P0 |
| ENQ-06 | View own enquiries | 1. Login as sender<br>2. Go to `/my/enquiries` | List of sent enquiries with status | P1 |
| ENQ-07 | Enquiry pagination | 1. Have >12 enquiries<br>2. Navigate pages | Pagination works | P2 |
| ENQ-08 | Enquiry status filter | 1. Filter by "Pending", "Contacted", etc. | Filtered results | P2 |

### 3.5 Listing Reports

| Test ID | Scenario | Steps | Expected Result | Priority |
|---|---|---|---|---|
| REP-01 | Report a listing | 1. Open listing<br>2. Click "Report Listing"<br>2. Select reason, add description<br>3. Submit | Report created, success message | P0 |
| REP-02 | Report requires description | 1. Try to submit without description | Validation error | P1 |
| REP-03 | Moderator sees reports tab | 1. Login as moderator<br>2. Go to moderation → Reports tab | Reports listed with status | P1 |
| REP-04 | Moderator resolves report | 1. Click resolve with reason | Report status → Reviewed, audit record created | P1 |

---

## 4. CRUD Operations

### 4.1 Locations (Admin)

| Test ID | Scenario | Steps | Expected Result | Priority |
|---|---|---|---|---|
| LOC-01 | View location hierarchy | 1. Login as admin<br>2. Go to `/admin/locations` | Tree view: Country → Divisions → Districts | P0 |
| LOC-02 | Add new location | 1. Click "Add Location"<br>2. Fill name, code, level, parent<br>3. Save | Location appears in hierarchy | P1 |
| LOC-03 | Edit location | 1. Click edit on existing<br>2. Change name, save | Updated in tree | P1 |
| LOC-04 | Delete location (no children) | 1. Delete leaf location | Removed from hierarchy | P1 |
| LOC-05 | Delete location (with children) | 1. Try to delete parent with children | Error or cascade confirmation | P1 |

### 4.2 Listings (Submitter/Moderator)

| Test ID | Scenario | Steps | Expected Result | Priority |
|---|---|---|---|---|
| LST-01 | Create listing (API) | 1. POST `/api/v1/listings` with valid data | 201 Created, reference returned | P0 |
| LST-02 | Get listing (API) | 1. GET `/api/v1/listings/{id}` for approved | 200 OK with public DTO | P0 |
| LST-03 | Get listing (unapproved) | 1. GET `/api/v1/listings/{id}` for pending | 404 Not Found | P0 |
| LST-04 | Search listings (API) | 1. GET `/api/v1/listings` with filters | Paged results with only approved | P0 |
| LST-05 | Update own submission | 1. PUT `/api/v1/my/submissions/{id}` | 204 No Content when pending/changes | P1 |
| LST-06 | Cannot update approved | 1. Try to update approved listing | 400 Validation Failed | P1 |

---

## 5. Validation

| Test ID | Scenario | Steps | Expected Result | Priority |
|---|---|---|---|---|
| VAL-01 | Required field validation (API) | 1. POST missing required field | 422 with field-level errors | P0 |
| VAL-02 | Email format (API) | 1. POST with invalid email | 422 "Invalid email format" | P1 |
| VAL-03 | Phone format (API) | 1. POST with invalid phone | 422 "Invalid phone number format" | P1 |
| VAL-04 | Date in past (API) | 1. POST with past departure date | 422 validation error | P0 |
| VAL-05 | Duration bounds (API) | 1. POST with duration=0 or 366 | 422 validation error | P1 |
| VAL-06 | Enum validation (API) | 1. POST with invalid availability | 422 validation error | P1 |
| VAL-07 | Frontend inline validation | 1. Fill form, blur invalid field | Red border + error message | P0 |
| VAL-08 | Frontend submit disabled until valid | 1. Navigate wizard with invalid data | Next/Submit disabled until step valid | P0 |

---

## 6. Error Handling

| Test ID | Scenario | Steps | Expected Result | Priority |
|---|---|---|---|---|
| ERR-01 | 404 Not Found | 1. Navigate to `/listing/invalid-guid` | Friendly 404 page or "Listing not available" | P1 |
| ERR-02 | 401 Unauthorized | 1. Call protected API without token | 401 with error message | P0 |
| ERR-03 | 403 Forbidden | 1. Call admin API as participant | 403 Forbidden | P0 |
| ERR-04 | Network error | 1. Stop API container<br>2. Try frontend action | User-friendly error, retry option | P1 |
| ERR-05 | Server error (500) | 1. Trigger server error<br>2. Check frontend | Generic error message, no stack trace | P1 |
| ERR-06 | Validation error display | 1. Submit invalid form<br>2. Check error format | Field-specific messages under inputs | P0 |

---

## 7. Edge Cases

| Test ID | Scenario | Steps | Expected Result | Priority |
|---|---|---|---|---|
| EDGE-01 | Expired listing not in search | 1. Create listing with ExpiresAt in past<br>2. Search | Not returned in public search | P1 |
| EDGE-02 | Cancelled listing not in search | 1. Cancel approved listing<br>2. Search | Not returned | P1 |
| EDGE-03 | Suspended listing not in search | 1. Suspend approved listing<br>2. Search | Not returned | P1 |
| EDGE-04 | Duplicate submission detection | 1. Submit identical listing twice | Second flagged for review (same location/date) | P2 |
| EDGE-05 | Long Bengali text | 1. Enter long Bengali title/description<br>2. View in UI | No clipping, wraps properly | P1 |
| EDGE-06 | Unicode Bengali input | 1. Type Bengali in all text fields | Input accepted, stored, displayed correctly | P0 |
| EDGE-07 | Large description (2000 chars) | 1. Enter max length description | Accepted, displayed with proper wrapping | P1 |
| EDGE-08 | Concurrent moderation | 1. Two moderators review same listing | Second gets conflict or updated state | P2 |
| EDGE-09 | Enquiry rate limiting | 1. Send many enquiries rapidly | Rate limit enforced (429 after threshold) | P1 |
| EDGE-10 | Submission rate limiting | 1. Submit many listings rapidly | Rate limit enforced | P1 |

---

## 8. Frontend UX & Responsive Behavior

| Test ID | Scenario | Steps | Expected Result | Priority |
|---|---|---|---|---|
| UX-01 | Mobile layout (320px) | 1. Resize browser to 320px<br>2. Check all pages | No horizontal scroll, stacked layout | P0 |
| UX-02 | Tablet layout (768px) | 1. Resize to 768px | Two-column grids, sidebar visible | P1 |
| UX-03 | Desktop layout (1024px+) | 1. Resize to 1440px | Full layout, multi-column grids | P1 |
| UX-04 | Touch targets (44x44px) | 1. Check buttons, links on mobile | All interactive elements ≥ 44x44px | P1 |
| UX-05 | Keyboard navigation | 1. Tab through all pages | Logical focus order, visible focus rings | P0 |
| UX-06 | Screen reader labels | 1. Use screen reader (NVDA/VoiceOver) | ARIA labels on icons, buttons, forms | P1 |
| UX-07 | Language switcher | 1. Click language button | Switches between বাংলা / English, persists | P0 |
| UX-08 | Bengali text rendering | 1. Switch to Bengali<br>2. Check all pages | All UI strings in Bengali, no English fallback | P0 |
| UX-09 | Date formatting (locale) | 1. Switch languages<br>2. Check dates | Bengali: DD MMMM YYYY (১৫ অক্টোবর ২০২৬), English: 15 October 2026 | P1 |
| UX-10 | Number formatting | 1. Check durations, counts | Bengali digits (১২৩) vs English (123) | P1 |
| UX-11 | Reduced motion | 1. Enable OS "Reduce Motion"<br>2. Check transitions | Non-essential animations disabled | P2 |
| UX-12 | Focus visible | 1. Tab through form<br>2. Check focus rings | Emerald focus ring on all inputs/buttons | P0 |
| UX-13 | Skeleton loading states | 1. Reload search/detail pages | Skeletons shown during fetch | P1 |
| UX-14 | Empty states | 1. Search with no results<br>2. Submissions with none | Friendly illustrations, clear CTAs | P1 |
| UX-15 | Modal/drawer behavior | 1. Open enquiry/report modal<br>2. Click backdrop/Escape | Modal closes, focus returns to trigger | P1 |

---

## 9. API Integration

| Test ID | Scenario | Steps | Expected Result | Priority |
|---|---|---|---|---|
| API-01 | CORS headers | 1. Call API from frontend origin | Access-Control-Allow-Origin: http://localhost:4200 | P0 |
| API-02 | JWT in Authorization header | 1. Login<br>2. Check network requests | Bearer token sent on protected calls | P0 |
| API-03 | Token expiry handling | 1. Wait for expiry<br>2. Make request | Auto-refresh, retry original request | P1 |
| API-04 | Rate limit headers | 1. Check response headers | X-RateLimit-Limit, X-RateLimit-Remaining | P2 |
| API-05 | ProblemDetails format | 1. Trigger 422/400/404 | RFC 7807 compliant error response | P1 |
| API-06 | Swagger/OpenAPI docs | 1. Open `/swagger` in dev | API docs accessible | P2 |
| API-07 | Health endpoints | 1. GET `/health`, `/health/ready` | 200 OK with health status | P1 |

---

## 10. Database Behavior

| Test ID | Scenario | Steps | Expected Result | Priority |
|---|---|---|---|---|
| DB-01 | Migrations run on startup | 1. Clean DB, start API | Tables created, seed data inserted | P0 |
| DB-02 | UUID primary keys | 1. Check all tables | All PKs are UUID | P0 |
| DB-03 | UTC timestamps | 1. Check CreatedAt/UpdatedAt | Stored as UTC (timestamptz) | P0 |
| DB-04 | Foreign key constraints | 1. Try to delete referenced location | Restricted or cascade as designed | P1 |
| DB-05 | Unique constraints | 1. Try duplicate email/role name | Constraint violation | P1 |
| DB-06 | Indexes exist | 1. Check migration SQL | Indexes on DepartureLocationId, DepartureAt, PublicationStatus, etc. | P1 |
| DB-07 | Soft delete not used | 1. Delete enquiry/report | Hard delete (privacy requirement) | P1 |
| DB-08 | Private contact isolation | 1. Query public listing view | No PrivatePhone, PrivateEmail, WhatsAppNumber | P0 |

---

## 11. Security

| Test ID | Scenario | Steps | Expected Result | Priority |
|---|---|---|---|---|
| SEC-01 | Password hashing | 1. Check User table | BCrypt/Argon2 hash, not plaintext | P0 |
| SEC-02 | JWT signing | 1. Decode token | HS256 with 32+ char secret | P0 |
| SEC-03 | No secrets in code | 1. Search repo for passwords/keys | None found (use env vars) | P0 |
| SEC-04 | SQL injection | 1. Test search with SQL payloads | Parameterized queries, no injection | P0 |
| SEC-05 | XSS prevention | 1. Submit `<script>alert(1)</script>` in fields | Escaped/encoded in output | P0 |
| SEC-06 | CSRF protection | 1. Check SameSite cookies | SameSite=Strict/Lax on auth cookies | P1 |
| SEC-07 | Private data in logs | 1. Check logs after submission | No passwords, tokens, private contacts | P0 |
| SEC-08 | HTTPS in production | 1. Deploy with reverse proxy | TLS 1.2+, HSTS, secure headers | P1 |

---

## 12. Project-Specific Requirements

| Test ID | Scenario | Steps | Expected Result | Priority |
|---|---|---|---|---|
| PROJ-01 | Bangladesh location hierarchy | 1. Check seeded data | 8 Divisions, 64 Districts, Upazilas | P0 |
| PROJ-02 | Bengali default language | 1. Open fresh browser | UI in Bengali, language switcher works | P0 |
| PROJ-03 | Islamic-inspired design | 1. Visual inspection | Emerald primary, gold accents, ivory bg, geometric divider | P1 |
| PROJ-04 | Moderation workflow | 1. Submit → Moderate → Approve → Search | End-to-end flow works | P0 |
| PROJ-05 | Enquiry privacy | 1. Send enquiry with consent<br>2. Check organiser view | Contact visible only with consent | P0 |
| PROJ-06 | Travel warning | 1. View any listing detail | Warning displayed prominently | P0 |
| PROJ-07 | Self-approval prevention | 1. Moderator submits → tries to approve | Blocked with clear error | P0 |
| PROJ-08 | Reference ID format | 1. Submit listing | Format: JC-XXXXXXXX | P1 |
| PROJ-09 | 90-day expiry on approve | 1. Approve listing<br>2. Check ExpiresAt | 90 days from approval | P1 |
| PROJ-10 | Organizer verification | 1. Admin verifies organizer<br>2. Check listing | VerificationStatus → Verified | P1 |

---

## Test Execution Notes

### Environment Setup
- [ ] PostgreSQL 16+ running
- [ ] .NET 10 SDK installed
- [ ] Node.js 24+ installed
- [ ] Docker & Docker Compose available
- [ ] Angular CLI installed globally

### Running Tests
```bash
# Backend
cd src/backend
dotnet build
dotnet test

# Frontend
cd src/frontend
npm install
npm run build
# E2E: npx playwright test

# Full stack
docker-compose up -d
```

### Test Data Cleanup
- [ ] Reset database between test runs: `docker-compose down -v && docker-compose up -d`
- [ ] Clear localStorage/cookies for auth tests
- [ ] Use unique emails for registration tests

### Sign-off
| Role | Name | Date | Signature |
|---|---|---|---|
| QA Lead | | | |
| Developer | | | |
| Product Owner | | | |