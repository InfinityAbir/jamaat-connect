# Jamaat Connect — UI/UX Design System (DESIGN.md)

**Version:** 1.0  
**Status:** Approved Design Baseline  
**Source Requirement Document:** `doc/BRD.md` (serving as requirements source of truth)

---

## 1. Design Vision & Emotional Tone

Jamaat Connect provides a calm, trustworthy, welcoming, and contemporary platform for the community. The visual identity draws inspiration from Islamic design while maintaining modern usability, excellent readability, and professional discipline.

**Tone:** Helpful, respectful, community-focused, and reliable.

---

## 2. Visual Direction & Style Guide

### 2.1 Color Palette
Guided by the `pro-ui-craft` "Amethyst & Gold" and "Sanctuary" principles:

| Color Role | Hex Code | Purpose |
|---|---|---|
| **Primary (Emerald)** | `#065F46` (600) | Primary brand color, main buttons, headers. |
| **Primary (Dark Emerald)** | `#064E3B` (700) | Active states, deep headers, brand accents. |
| **Secondary (Gold)** | `#D97706` (600) | CTAs, high-priority highlights, verification badges. |
| **Accent (Muted Gold)** | `#C29B4A` | Subtle dividers, decorative geometric accents. |
| **Background (Warm Ivory)** | `#FAFAF8` | Primary page background; warm, not clinical white. |
| **Surface (White)** | `#FFFFFF` | Card surfaces, form inputs, modal bodies. |
| **Text (Primary)** | `#1F2937` (900) | Body copy and headings on light backgrounds. |
| **Text (Muted)** | `#6B7280` (500) | Supporting text, labels, secondary information. |
| **Success** | `#10B981` (500) | Approved states, success alerts. |
| **Alert/Error** | `#EF4444` (500) | Rejection states, critical error alerts. |

### 2.2 Typography
- **Primary Font (Bengali):** **Hind Siliguri** or **Noto Sans Bengali**. (Humanist, highly readable on mobile).
- **Primary Font (English/Latin):** **Plus Jakarta Sans** or **Inter**. (Clean, geometric, professional).
- **Scale:**
  - **Display (h1):** 30px / 1.2 line-height (Bold)
  - **Heading (h2):** 24px / 1.3 line-height (Semi-bold)
  - **Sub-heading (h3):** 18px / 1.4 line-height (Medium)
  - **Body Text:** 16px / 1.5 line-height (Regular)
  - **Small/Label:** 14px / 1.4 line-height (Medium)
  - **Caption:** 12px / 1.4 line-height (Regular)

### 2.3 Visual Elements & Motifs
- **Signature Element:** A single elegant gold-accented geometric divider or a subtle pattern background used sparingly in hero sections.
- **Surface Styling:** Rounded corners with a radius of **12px** for cards and buttons.
- **Shadows:** Restrained, soft shadows (`box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05)`).
- **Icons:** Consistent line icons (e.g. Heroicons or Lucide Icons) in emerald or muted gold.

---

## 3. Responsive Layout & Navigation

### 3.1 Breakpoints
- **Mobile:** 320px – 767px (Primary target for discoverability).
- **Tablet:** 768px – 1023px.
- **Desktop:** 1024px+.

### 3.2 Navigation Strategy
- **Mobile:** Fixed bottom navigation for core actions (Home, Search, Submit, My Jamaat) + hamburger menu for settings/admin.
- **Desktop:** Sticky top navigation bar with clear emerald-first brand presence and language switcher.
- **Language Switcher:** Always accessible in the navigation area (Primary: Bengali, Secondary: English).

---

## 4. Key Screens & User Flows

### 4.1 Discovery (Public)
1. **Homepage:** Hero section introducing the platform, featured districts/regions, "Latest Listings" feed.
2. **Search Results:** Advanced filter sidebar (Desktop) or Filter Sheet (Mobile). Grid/List of approved Jamaat cards.
3. **Listing Details:** Visual priority on Location, Date, and Availability. "Send Enquiry" is the primary CTA. "Report Listing" is secondary.

### 4.2 Submission Flow
1. **Introduction:** Clear policy overview (moderation required, verification benefits).
2. **Step 1 - Basic Info:** Title, Location (Hierarchy selector), Date, Duration.
3. **Step 2 - Details:** Destination, meeting instructions, availability count.
4. **Step 3 - Private Contact:** Submitter name, phone, WhatsApp choice.
5. **Preview:** Summary of listing as it will appear publicly.
6. **Confirmation:** Reference ID and tracking link.

### 4.3 Private Enquiry Flow
- **Form Modal:** Simple "Message" text area + optional "Share my Phone/WhatsApp" toggle.
- **Privacy Notice:** "Your contact info will only be shared with the organizer if you check this box."
- **Success State:** "Enquiry sent. The organizer will reach out if space is available."

### 4.4 Moderation & Admin (Authenticated)
- **Moderation Queue:** Table/List view with status badges (`Pending`, `ChangesRequested`).
- **Review Page:** Side-by-side comparison of public listing data and private verification info. Action buttons: `Approve`, `Request Changes`, `Reject`.
- **Location Manager:** Tree-view or nested lists for managing Divisions → Districts → Upazilas.

---

## 5. Interaction Design & Feedback States

### 5.1 Interactive Controls
- **Buttons:**
  - `Primary`: Emerald background, white text.
  - `Secondary/CTA`: Gold background, white/black text.
  - `Outline`: Emerald border, emerald text, transparent background.
  - `Loading`: Button text replaced by a subtle gold spinner; button disabled.
- **Form Inputs:**
  - Focus state: Emerald border highlight with soft glow.
  - Error state: Red border, small red caption below explaining the validation failure.

### 5.2 Animations (Subtle & Purposeful)
- **Transitions:** 200ms – 300ms for page fades and modal entrances.
- **Micro-interactions:** 150ms for button hover/active states.
- **Empty States:** Friendly "No Jamaats found in this region" with an illustration and a "Clear Filters" button.
- **Loading States:** Skeleton screens for listing cards during initial data fetch.

---

## 6. Globalization & Localization

- **Default Language:** Bengali (`bn`).
- **Support Language:** English (`en`).
- **Implementation:**
  - All UI strings localized via `.json` translation files.
  - Date formats: `DD MMMM YYYY` (e.g., ১৫ অক্টোবর ২০২৬ or 15 October 2026).
  - Number formats: Localized digit representation (e.g., ১২৩ or 123).
  - RTL Support: Not required for MVP but architecture should not block it.

---

## 7. Accessibility (WCAG 2.2 AA)

- **Contrast:** Ensure all text passes 4.5:1 ratio (Gold text on white background must be carefully shaded to pass).
- **Keyboard Navigation:** Logical tab order for all forms and interactive cards. Visible focus rings on all interactive elements.
- **Screen Readers:** ARIA labels for icons and language switcher. Semantic HTML tags (`<header>`, `<main>`, `<nav>`, `<section>`, `<article>`).
- **Touch Targets:** Minimum 44x44px for all interactive elements on mobile.
- **Reduced Motion:** Respect `prefers-reduced-motion` by disabling non-essential transitions.
