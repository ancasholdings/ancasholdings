# Contractor-Ready Maintenance Work Order Email Reformatting

A redesigned, high-clarity email format for inbound maintenance requests delivered to `tudor@ancasholdings.com`, structured specifically as a professional Work Order ready for direct forwarding to trade contractors (plumbers, HVAC technicians, electricians, and handymen).

## User Review & Critical Decisions

> [!IMPORTANT]
> Based on your responses, the email received at `tudor@ancasholdings.com` will capture every submitted detail while presenting a crisp, executive Work Order format optimized for direct forwarding to contractors from your standard email client.

- **Confirmed Decision 1 (Information Scope & Slick Layout)**: Captures 100% of tenant-submitted data reorganized into four clear operational sections: Job Site & Unit Location, Access & Entry Protocol, Scope of Work, and Contractor Action Notes.
- **Confirmed Decision 2 (Resident Contact Information)**: Includes the tenant's full name, direct phone number, and email prominently under the Access & Coordination section so contractors can reach out directly for scheduling and entry coordination.
- **Confirmed Decision 3 (Forwarding Workflow)**: Standard, self-contained email formatting designed for immediate 1-click native forwarding (`Fwd:`) within Gmail, Outlook, or Apple Mail without requiring external logins or secondary portal actions.
- **Recommended Enhancement**: Adding a formatted `CONTRACTOR WORK ORDER SUMMARY` card at the top of the email payload alongside clear, uppercase field headers, so contractors viewing on mobile phones get the exact job address, unit #, access instructions, and scope in seconds.

---

## 1. Overview & Core Concept

### What It Does
When a tenant submits a maintenance request through the resident portal, property management receives an email structured as an official **Ancas Holdings Maintenance Work Order**. Rather than appearing as a raw generic web form receipt, the email is structured hierarchically so property managers can simply click "Forward" in their email client, type any contractor-specific notes (e.g., *"Mike, please check this leak tomorrow morning"*), and send it directly to their preferred vendor.

### Target Audience & Persona
- **Property Management (`tudor@ancasholdings.com`)**: Needs an instant, professional, and comprehensive snapshot of the ticket with zero missing data.
- **Contractors & Service Techs**: Need immediate answers to four critical questions:
  1. Where is the job? (Property address, unit number, room/location)
  2. How do I get in? (Permission to enter, preferred time, resident phone)
  3. What is broken? (Trade category, urgency, detailed symptom description)
  4. Are there photos? (Attached photos for diagnostics and material prep)

### Key Value
Eliminates back-and-forth friction between property management and contractors, reduces re-typing of job specs, and ensures trade partners receive clean, standardized work orders.

---

## 2. User Experience & Visual Design

### Email Content Hierarchy
```
┌────────────────────────────────────────────────────────────────────────┐
│ [WORK ORDER #ANC-2026-XXXX] Category - Unit Apt, Property Address      │
├────────────────────────────────────────────────────────────────────────┤
│ 1. EXECUTIVE WORK ORDER BLOCK                                          │
│    • Work Order # & Timestamp                                          │
│    • Priority Rating (STANDARD / URGENT / EMERGENCY)                   │
├────────────────────────────────────────────────────────────────────────┤
│ 2. JOB SITE & LOCATION                                                 │
│    • Property Address & Unit Number                                    │
│    • Specific Location Inside Unit (e.g. Master Bath, Kitchen Sink)   │
├────────────────────────────────────────────────────────────────────────┤
│ 3. ACCESS & RESIDENT COORDINATION                                      │
│    • Resident Name & Direct Phone Number                               │
│    • Resident Email                                                    │
│    • Permission to Enter (Granted vs. Call First)                      │
│    • Preferred Service Window (Morning / Afternoon / Anytime)          │
├────────────────────────────────────────────────────────────────────────┤
│ 4. SCOPE OF WORK & DIAGNOSTICS                                         │
│    • Maintenance Category (Plumbing, HVAC, Electrical, etc.)           │
│    • Tenant Description & Reported Symptoms                            │
│    • Attached Photos (attached directly to email)                      │
├────────────────────────────────────────────────────────────────────────┤
│ 5. CONTRACTOR NOTES & INSTRUCTIONS                                     │
│    • Scope confirmation, arrival protocol, invoice/estimate reply      │
└────────────────────────────────────────────────────────────────────────┘
```

### Visual Styling & Field Structure
- **Subject Line Formula**:
  `[WORK ORDER #ANC-2026-XXXX] Plumbing - Unit 3B, 1420 N Hoyne Ave`
  *(Makes incoming emails instantly searchable in Tudor's inbox and crystal clear when forwarded)*
- **Card Template (`_template: "box"`)**:
  Switches FormSubmit styling to a clean modern card layout with crisp borders, neutral background tones, and clear typography.
- **Sectional Field Grouping**:
  Replaces disorganized field names with capitalized, prefix-grouped labels:
  - `[WORK ORDER] Ticket Number`
  - `[WORK ORDER] Priority & Date`
  - `[JOB SITE] Address & Unit`
  - `[JOB SITE] Location in Unit`
  - `[ACCESS] Resident Name & Phone`
  - `[ACCESS] Permission to Enter`
  - `[ACCESS] Preferred Time Window`
  - `[SCOPE OF WORK] Category`
  - `[SCOPE OF WORK] Description`
  - `[ATTACHMENTS] Photos`
  - `[CONTRACTOR INSTRUCTIONS] Protocol`

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: FormSubmit Structured Payload vs. Monolithic Plain Text
- **Chosen Approach**: Combine FormSubmit's sleek `"box"` template layout with structured grouping prefixes and an executive contractor text block.
- **Why**: Ensures the email renders as a polished HTML work order in desktop clients (Outlook, Apple Mail, Web Gmail) while remaining completely legible if forwarded as plain text on mobile devices.
- **Alternatives Considered**: Sending only a single unstructured text blob (loses attachment previews and visual hierarchy) or sending raw form fields (current state, looks like a generic web form).

### Decision 2: Reply-To and Sender Configuration
- **Chosen Approach**: Retain `_replyto: ticket.tenantEmail` while keeping `_cc: ticket.tenantEmail` active for tenant transparency, and including the tenant's phone number prominently in the body.
- **Why**: When Tudor forwards to a contractor, the contractor can either reply to Tudor or copy/call the resident directly without losing context.

---

## 4. Technical Architecture & Data Strategy

### Dispatch Flow Diagram

```
┌─────────────────────────────────┐
│     Tenant Submits Request      │
│  (Name, Address, Issue, Photos) │
└────────────────┬────────────────┘
                 │
                 ▼
┌───────────────────────────────────────────────────────────┐
│          TenantsPortal.tsx (sendEmailDispatch)            │
│  Transforms raw state into Contractor Work Order schema:  │
│  1. Format Subject: [WORK ORDER #ANC-...] Category, Addr  │
│  2. Build Executive Contractor Summary Text Block         │
│  3. Attach High-Res Image Files directly to FormData      │
│  4. Set FormSubmit Template: 'box'                        │
└────────────────┬──────────────────────────────────────────┘
                 │
                 ▼
┌───────────────────────────────────────────────────────────┐
│              FormSubmit Automated Email Gateway           │
│         https://formsubmit.co/ajax/tudor@ancasholdings.com│
└────────────────┬──────────────────────────────────────────┘
                 │
                 ▼
┌───────────────────────────────────────────────────────────┐
│            Tudor's Inbox (tudor@ancasholdings.com)        │
│  Sleek, formatted Work Order with full job specs & photos │
└────────────────┬──────────────────────────────────────────┘
                 │
                 ▼ (1-Click Native Forward)
┌───────────────────────────────────────────────────────────┐
│                 Contractor / Service Tech                 │
│  Receives pristine Work Order ready for estimate & entry  │
└───────────────────────────────────────────────────────────┘
```

### Implementation Checklist
1. **Update `sendEmailDispatch` in `src/components/TenantsPortal.tsx`**:
   - Reconfigure subject line to standard Work Order format.
   - Switch `_template` to `"box"` for a modern visual layout.
   - Format fields into categorical sections (`[JOB SITE]`, `[ACCESS & CONTACT]`, `[SCOPE OF WORK]`, `[CONTRACTOR INSTRUCTIONS]`).
   - Add a formatted `[WORK ORDER SUMMARY]` text block at the start of the payload for quick reading.
2. **Preserve Submitter Receipt**:
   - Keep the separate concise 24-48h confirmation autoresponse template to the tenant intact.
3. **Verification**:
   - Run `lint_applet` and `compile_applet` to ensure clean build.
