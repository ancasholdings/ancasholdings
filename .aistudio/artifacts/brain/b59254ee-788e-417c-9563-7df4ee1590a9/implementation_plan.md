# Tenant & Property Management Portal

Comprehensive architectural plan to transform the existing maintenance form into a full-featured, dual-sided **Resident Tenant Portal & Landlord Property Management System** for Ancas Holdings properties (1830 Brummel, 2910 W Touhy, 4814 Elm, and 629 W Howard).

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following product decisions were confirmed during the interactive interview:
> - **Primary Functional Priorities**: Lease overview, rent ledger/payment tracking, and maintenance ticket dispatch.
> - **Authentication Flow**: 1-click preset demo resident profiles (representing tenants across all 4 properties) alongside custom tenant sign-in and sign-out.
> - **Dual-Sided Architecture**: Integrated Landlord / Property Manager dashboard allowing management to monitor occupancy, track rent collections, and manage contractor work orders across the portfolio.

---

## 1. Overview & Core Concept

- **What It Does**: Upgrades the standalone maintenance submission form into an enterprise-grade property management portal. Residents log in to view active lease details, review their rent balance and payment ledger, submit tickets with required photos, and monitor contractor repair stages. Landlords and property managers toggle into an administrative console to oversee building rent rolls, vacant/leased units, and maintenance dispatch.
- **Target Audience**: Current tenants residing in Ancas Holdings multi-family communities across Evanston, Chicago, and Skokie, as well as property owner/manager Tudor.
- **Key Value**: Replaces disconnected emails, spreadsheets, and manual tracking with an intuitive, unified property operating system tailored to North Shore & Chicago mid-market buildings.

---

## 2. User Experience & Visual Design

### A. Key User Flows

1. **Authentication & Quick-Switch Zero-State**:
   - Clean, branded entrance screen with preset demo resident profiles:
     - *Alex Morgan* (1830 Brummel, Apt 2B · Evanston)
     - *Maya Patel* (2910 W Touhy, Apt 1A · Chicago)
     - *Marcus Vance* (4814 Elm, Apt 3 · Skokie)
     - *Elena Rostova* (629 W Howard, Apt 2 · Evanston)
   - Custom sign-in modal for other tenant names or unit lookup.
   - Quick "Manager Access" switch at top-right for Tudor / Landlord view.

2. **Resident Portal Experience (4 Core Workspaces)**:
   - **Workspace 1: Lease & Residency**: Displays lease commencement/expiration dates, monthly rent, security deposit held, assigned parking space, storage locker number, pet agreement status, and a downloadable/printable lease summary agreement.
   - **Workspace 2: Rent Ledger & Balance**: Current balance due, next payment deadline (e.g., 1st of the month), automated payment status toggle (Autopay Enabled/Disabled), payment method simulator (ACH / Debit), and a historical transaction table with date, charge description, amount, status, and receipt generator.
   - **Workspace 3: Maintenance Tracker & Submission**:
     - *Active & Past Work Orders*: Progress stepper for each ticket (`Submitted` → `Under Review` → `Contractor Assigned` → `Scheduled` → `In Progress` → `Resolved`).
     - *Contractor Details*: Shows assigned contractor trade (Plumbing, Electrical, HVAC, Carpentry), scheduled visit window, and photo documentation.
     - *New Ticket Submission*: Integrates the existing mandatory photo attachment flow and landlord email dispatch (`tudor@ancasholdings.com`) while auto-filling the tenant's verified unit, phone, and name.
   - **Workspace 4: Community & Building Contacts**: Dedicated emergency contacts, trash/recycling schedules, laundry guidelines, and building announcements.

3. **Landlord / Manager Console (Admin Mode)**:
   - **Portfolio Metrics Strip**: Total Units (Occupied vs. Vacant), Monthly Rent Roll Collected, and Open Maintenance Tickets.
   - **Work Order Dispatch Board**: Filter tickets by property (`Brummel`, `Touhy`, `Elm`, `Howard`), change status stages, assign external contractors, and add private contractor notes.
   - **Rent Roll & Lease Expirations**: Table of all units, resident names, lease end dates, and current balance status.

### B. Visual Identity & Design System

- **Palette**: Ancas Holdings brand navy (`#00264d`), warm architectural gold (`#d4a017`), clean stone background (`#f8f8f6`), and soft borders (`#e7e5e4`).
- **Semantic Colors**: Emerald (`#16a34a`) for on-time payments and resolved tickets; Amber (`#d97706`) for scheduled repairs and upcoming rent; Crimson (`#dc2626`) for urgent emergencies and overdue balances.
- **Typography & Tabular Numbers**: Primary headings in serif editorial style; dense financial figures and dates set in tabular monospace (`tabular-nums font-mono`).
- **Anti-Slop Restraint**: Zero decorative glowing badges, no code-comment prefixes, single-elevation cards with clean 1px hairline borders, and full responsive support up to 1440px desktop.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Reactive Client-Side State with LocalStorage Persistence**:
  - *Chosen Approach*: Maintain full state management in TypeScript with persistent `localStorage` serialization. All new tickets submitted, rent payments made, and manager dispatch notes persist across browser refreshes without requiring external database migrations.
  - *Why*: Immediate instant responsiveness, zero latency, no risk of external downtime, and perfectly aligns with the current static build architecture.
- **Decision 2: Preserving the Existing FormSubmit Backend Dispatch**:
  - *Chosen Approach*: Keep the existing direct email dispatch to `tudor@ancasholdings.com` whenever a new ticket is submitted in the portal, while simultaneously recording it into the tenant's interactive portal ticket history.
  - *Why*: Ensures Tudor continues receiving real-time email notifications with photos, while the tenant enjoys an interactive dashboard with live progress tracking.
- **Decision 3: Dual-Mode Switch in Portal Navigation**:
  - *Chosen Approach*: A discreet, persistent toggle between "Resident View" and "Property Manager View" at the top of the portal.
  - *Why*: Allows Tudor and prospective users to test both user roles seamlessly without cumbersome login barriers.

---

## 4. Technical Architecture & Component Structure

```
┌────────────────────────────────────────────────────────────────────────┐
│                          ANCAS HOLDINGS APP                            │
│           (Navbar: Home · About · Availability · Tenants)             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        TENANTS PORTAL CONTAINER                        │
│             src/components/TenantsPortal.tsx (Refactored)             │
│                                                                        │
│   ┌───────────────────────────┐      ┌─────────────────────────────┐   │
│   │   Auth & Profile State    │◄────►│   Portal Mode Switcher      │   │
│   │ (Active Resident / Admin) │      │ (Resident View vs. Manager) │   │
│   └─────────────┬─────────────┘      └──────────────┬──────────────┘   │
│                 │                                   │                  │
│                 ▼                                   ▼                  │
│   ┌───────────────────────────┐      ┌─────────────────────────────┐   │
│   │       RESIDENT VIEW       │      │        MANAGER VIEW         │   │
│   ├───────────────────────────┤      ├─────────────────────────────┤   │
│   │ • Lease Overview Card     │      │ • Portfolio Rent Roll KPIs  │   │
│   │ • Rent Balance & Ledger   │      │ • Work Order Dispatch Board │   │
│   │ • Maintenance Tracker     │      │ • Unit Directory by Address │   │
│   │ • Community Resources     │      │ • Contractor Assignment Log │   │
│   └─────────────┬─────────────┘      └──────────────┬──────────────┘   │
│                 │                                   │                  │
│                 └─────────────────┬─────────────────┘                  │
│                                   ▼                                    │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                    UNIFIED DATA & STORAGE                      │   │
│   │  • Persistent LocalStorage Store (`ancas_portal_v1`)           │   │
│   │  • Active Lease Agreement Models (Brummel, Touhy, Elm, Howard) │   │
│   │  • Work Order Database with Photo & Status History             │   │
│   │  • FormSubmit Dispatcher to tudor@ancasholdings.com            │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

### Component Breakdown & State Transitions

1. `src/types/portal.ts`:
   - Data interfaces for `ResidentProfile`, `LeaseAgreement`, `RentLedgerItem`, `MaintenanceTicket`, and `WorkOrderUpdate`.
2. `src/data/portalSeed.ts`:
   - Curated default state for the 4 primary Ancas properties with realistic lease data, historical rent ledgers, building contacts, and initial work orders.
3. `src/components/tenants/ResidentPortalView.tsx`:
   - Sub-views for Lease Details, Rent Ledger with "Pay Rent" simulated action, Ticket History with status stages, and building guidelines.
4. `src/components/tenants/ManagerPortalView.tsx`:
   - Portfolio overview stats, live ticket dispatch console (update status, assign contractor, add internal notes), and tenant directory.
5. `src/components/TenantsPortal.tsx`:
   - Main wrapper connecting user authentication, demo profile switcher, and role-based view routing.
