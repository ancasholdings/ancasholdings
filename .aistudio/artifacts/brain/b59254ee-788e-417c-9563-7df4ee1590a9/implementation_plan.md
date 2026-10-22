# Ancas Holdings - Tenant Maintenance Portal

A dedicated, resident-focused "Tenants" page and interactive maintenance request system for Ancas Holdings, allowing residents of mid-market multi-family properties to submit maintenance tickets with photos, categorizations, and urgency levels directly to `tudor@ancasholdings.com` while receiving instant confirmation receipts.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following choices were confirmed during Phase 1 clarification:
> - **Portal Access**: Integrated into the main navigation header and footer as a dedicated view with seamless back-and-forth switching.
> - **Submission & Delivery**: Direct submission handling with dispatch to `tudor@ancasholdings.com` alongside an on-screen ticket confirmation receipt, print/save option, and mail client fallback.
> - **Category System**: Standard multi-family categories with urgency ratings (Routine, Standard, Urgent) and a Chicago winter/emergency contact protocol.

---

## 1. Overview & Core Concept

- **What It Does**: Provides Ancas Holdings tenants with an intuitive, dedicated online portal to log maintenance requests. Captures Property Address, Tenant Name, Unit Number, Contact details, Maintenance Category, Urgency Rating, Detailed Description, Permission to Enter, and Photo Attachments.
- **Target Audience**: Current residents across Ancas Holdings' Chicago North and Northwest multi-family portfolio.
- **Key Value**: Replaces haphazard text messages or unstructured emails with structured, high-priority maintenance tickets including visual documentation (photos), reducing resolution turnaround time and improving resident satisfaction.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Entry**: Tenant clicks "Tenants" in the top navigation or footer from any page.
2. **Emergency Check**: Prominent notice clarifies what constitutes a true emergency (gas leak, flooding, no heat in sub-freezing weather) with immediate emergency hotline phone numbers.
3. **Form Completion**:
   - **Resident Info**: Full Name, Phone Number, Email Address.
   - **Unit Location**: Chicago Property Address (with quick-select or custom entry) and Unit Number.
   - **Issue Type**: Dropdown with categorized types (Plumbing, HVAC/Heating, Electrical, Appliances, Windows/Locks, Common Area, General).
   - **Urgency Rating**: Low (Routine 3-5 days), Medium (Standard 24-48 hrs), High (Urgent 12-24 hrs).
   - **Detailed Description**: Textarea for specifics.
   - **Photo Upload**: Drag & drop or file picker with live preview thumbnails and remove capability.
   - **Permission to Enter**: Checkbox / radio choice regarding entering if resident is away.
4. **Submission & Receipt**:
   - Validation ensures all required fields and unit numbers are provided.
   - Animated submission state.
   - Generates a unique Ticket Reference (e.g. `ANC-2026-7842`).
   - Dispatches data to `tudor@ancasholdings.com`.
   - Displays a structured digital ticket receipt with copy, print, and download capabilities.

### Visual Identity & Theme
- **Color Tokens**: Cohesive with Ancas Holdings branding:
  - Deep Navy: `#00264d` (primary headers, active states, buttons)
  - Warm Architectural Gold: `#d4a017` (accents, focus borders, urgency highlights)
  - Stone Canvas: `bg-stone-50`, `bg-stone-100/50`, and clean white card containers (`bg-white`)
  - Border Accents: `border-stone-200`, `focus:ring-[#00264d]`
- **Anti-Slop Discipline**:
  - No decorative code-comment headers (`// 01 FORM`) or fake futuristic scoreboards.
  - Clean unboxed metadata with subtle dot separators (`·`).
  - Practical, human button micro-copy (`"Submit Maintenance Request"`, `"Attach Another Photo"`).
- **Responsive Layout**: Designed for mobile-first resident experience (tenants taking photos directly on smartphones) as well as desktop 1440px baseline.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Single-Page View State vs Multi-Page Router**
  - *Chosen Approach*: Reactive view routing (`activeTab: 'home' | 'tenants'`) synchronized with URL hash `#tenants`.
  - *Why*: Instant transitions without page reloads, preserves Vite SPA speed, perfectly maintains shared state and logo branding.
- **Decision 2: Photo Attachment Handling**
  - *Chosen Approach*: Client-side File Reader with Base64 image compression, instant thumbnail previews, and attachment bundling.
  - *Why*: Allows tenants to attach photos directly without requiring external cloud storage buckets, keeping the workflow self-contained and fast.
- **Decision 3: Email Notification & Dispatch**
  - *Chosen Approach*: Form submission creates a persistent ticket payload, dispatches to `tudor@ancasholdings.com` with a secondary mailto client fallback action, and issues an immediate verifiable ticket receipt.
  - *Why*: Ensures Tudor receives complete structured tickets with all data and images, while the resident gets instant proof of request submission.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│                   App Header & Navbar                  │
│   [Logo]  Home  ·  About  ·  Approach  ·  [Tenants]   │
└───────────────────────────┬────────────────────────────┘
                            │
              Route Switcher (Hash / State)
              ┌─────────────┴─────────────┐
              ▼                           ▼
    ┌───────────────────┐       ┌──────────────────────┐
    │  Public Homepage  │       │    Tenants Portal    │
    │  - Hero           │       │  - Emergency Hotline │
    │  - About Tudor    │       │  - Maintenance Form  │
    │  - Investment     │       │  - Photo Upload Hub  │
    │  - Contact        │       │  - Resident FAQ/Info │
    └───────────────────┘       └──────────┬───────────┘
                                           │
                                  Form Submission
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    ▼                                             ▼
        ┌───────────────────────┐                     ┌───────────────────────┐
        │ Direct Ticket Dispatch│                     │ Tenant Digital Receipt│
        │ tudor@ancasholdings   │                     │ - Unique Ticket ID    │
        │ - Unit & Property     │                     │ - Printable View      │
        │ - Urgency & Category  │                     │ - Status Tracking Log │
        │ - Photo Attachments   │                     │ - Copy confirmation   │
        └───────────────────────┘                     └───────────────────────┘
```

### Component Breakdown
1. **`Navbar` & `Footer` Updates**: Added `Tenants` / `Tenant Portal` link with active state indicator.
2. **`TenantPortal` Component**:
   - Hero header with resident welcome copy.
   - Emergency banner with 24/7 hotline callouts.
   - Maintenance Request form card:
     - Name, Email, Phone
     - Address selector / Unit input
     - Category dropdown (Plumbing, Heating/Cooling, Electrical, Appliance, Locks/Keys, Common Area, Other)
     - Urgency selector with descriptive turnaround times
     - Photo drag-and-drop zone with image previews and deletion controls
     - Access permission selector
   - Submission confirmation modal / receipt card.
   - Resident guidelines and FAQ accordion (trash schedules, move-in info, emergency contacts).
