# Jamaat Connect — Coding Conventions (CONVENTIONS.md)

**Version:** 1.0  
**Status:** Approved Coding Standards  

---

## 1. General Principles

- **Readability first:** Write code for humans to read, not just for the machine.
- **Explicit over implicit:** Avoid magic strings, hidden side effects, and "clever" one-liners.
- **Consistency:** Follow the established patterns even if you prefer a different style.
- **Fail fast:** Validate inputs early and return clear errors.
- **Don't Repeat Yourself (DRY):** But avoid premature abstraction.

---

## 2. Backend Conventions (.NET 10 / C# 13)

### 2.1 Naming
- **Classes, Methods, Properties:** `PascalCase`.
- **Local Variables, Parameters:** `camelCase`.
- **Private Readonly Fields:** `_camelCase` (e.g., `_listingRepository`).
- **Interfaces:** Prefix with `I` (e.g., `IListiningService`).
- **Async Methods:** Suffix with `Async` (e.g., `GetListingsAsync`).

### 2.2 Project Structure & Dependencies
- Follow **Clean Architecture** layers as defined in `ARCHITECTURE.md`.
- **Domain Layer:** Zero dependencies on external libraries (except basic ones like `System` or `System.Collections`).
- **Application Layer:** Depends only on `Domain`.
- **Infrastructure Layer:** Implements `Application` interfaces. Depends on `Domain` and `Application`.
- **Api Layer:** Entry point. Depends on `Application` and `Infrastructure` (for DI registration).

### 2.3 C# Specifics
- Use **File-scoped namespaces**.
- Enable **Nullable Reference Types** (`<Nullable>enable</Nullable>`).
- Use **Top-level statements** in `Program.cs` for cleaner setup.
- Use **Primary Constructors** where appropriate for Dependency Injection.
- Prefer `var` when the type is obvious (e.g. `var listings = new List<Listing>()`).

### 2.4 Error Handling & Validation
- Use **FluentValidation** for all incoming DTOs.
- Do NOT use exceptions for flow control (e.g. `UserNotFoundException`). Use Result patterns or return `null`/`ProblemDetails`.
- Standardize error responses using RFC 7807 `ProblemDetails`.

---

## 3. Frontend Conventions (Angular 21 / TypeScript)

### 3.1 Components & Modules
- Use **Standalone Components** (`standalone: true`).
- File naming: `kebab-case.component.ts`, `kebab-case.service.ts`.
- Component Selector: `jc-` prefix (e.g., `<jc-listing-card>`).

### 3.2 TypeScript & Logic
- **Strict Mode:** `strict: true` in `tsconfig.json`.
- **Signals:** Use Angular Signals for UI state and reactive values.
- **RxJS:** Use for HTTP calls and complex event streams. Always pipe through `takeUntilDestroyed()` or similar to prevent leaks.
- **Typed Forms:** Always use Angular's `FormControl<T>` / `FormGroup<T>` for type safety.

### 3.3 Styling (CSS)
- Use **Tailwind CSS** for layout and utility styling if configured, or **CSS Variables** for the design tokens defined in `DESIGN.md`.
- Scoped component styles: Avoid global CSS unless it belongs in `styles.css`.
- Interactive states: Always implement `hover`, `focus`, `active`, `disabled`.

---

## 4. Database Conventions (PostgreSQL / EF Core)

### 4.1 Schema
- **Tables & Columns:** `snake_case` (e.g., `listing_title`, `departure_at`).
- **Primary Keys:** `id` (UUID/Guid).
- **Foreign Keys:** `table_name_id` (e.g., `location_id`).
- **Timestamps:** `created_at`, `updated_at` (Stored as UTC `timestamptz`).

### 4.2 EF Core Usage
- Use **Fluent API** for configuration in `OnModelCreating`, not Data Annotations.
- Use `Guid.CreateVersion7()` or `Guid.NewGuid()` for identifiers.
- Implement soft delete if required by business logic; otherwise use hard delete for privacy (e.g. enquiries).

---

## 5. Testing & Quality Assurance

- **Unit Tests:** xUnit + FluentAssertions (Backend), Jasmine/Karma (Frontend).
- **Integration Tests:** Test the API layer using a real PostgreSQL instance (via Docker/TestContainers).
- **E2E Tests:** Playwright for critical user journeys (Search → Details → Enquiry).
- **Linting:** Use `.editorconfig` for C# and ESLint for TypeScript.
- **Commit Messages:** Use descriptive messages (e.g. `feat: add listing search api`, `fix: correct layout on mobile`).
