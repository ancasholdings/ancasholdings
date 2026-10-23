# Ancas Holdings Maintenance Portal Plan

## Tasks Completed
- [x] Converted property address selection to a mandatory free-form input.
- [x] Removed time estimates (e.g. 3-5 days) from the urgency rating indicators.
- [x] Updated operations review disclaimer copy.
- [x] Removed manager email (`tudor@ancasholdings.com`) from user-facing text in the portal.
- [x] Configured separate submitter email notification & dispatch:
  - Form submission with full ticket data and attachments is directed to `tudor@ancasholdings.com`.
  - Removed `_cc` so the submitter is not sent the internal management work order payload.
  - Submitter receives a separate, brief email notification (`_autoresponse`) with:
    - Ticket number in the subject line (`[Ticket #...]`)
    - Clear statement that their ticket has been received
    - Notice that someone from property management will be in touch within 24–48 hours
    - A brief thank you note
  - Updated post-submission screen with a visible "Confirmation Receipt Template" preview for submitters and synced the "Send / Save Copy to My Email" button to match.
- [x] Resolved Email Dispatch Failure (Root Cause & Fix):
  - **Identified Root Cause**: FormSubmit previously targeted a hidden iframe (`display: none`), which modern browsers and Cloudflare security block (`X-Frame-Options` / anti-bot). Additionally, FormSubmit requires a one-time activation click on an email sent to `tudor@ancasholdings.com` before it will deliver submissions or send autoresponses. Because the iframe was hidden, the activation prompt was never seen and requests failed silently.
  - **Replaced with Direct AJAX Submission**: Implemented direct `FormData` POST via `https://formsubmit.co/ajax/tudor@ancasholdings.com` with native file attachment handling and real-time JSON response parsing.
  - **Added Activation Detection & Self-Serve Launcher**: The app now detects whether FormSubmit returns an `activation_needed` state and presents a clear, one-click button to trigger/resend the FormSubmit activation email to `tudor@ancasholdings.com`.
  - **Guaranteed Zero-Data-Loss Fallback**: Added immediate 1-click mail launchers (Gmail Web, Outlook Web, and default email client) pre-filled with the exact ticket summary and attachments count for management, and separate 1-click copy launchers for the submitter.
- [x] Verified full build compilation and linting tests pass.
- [x] Fixed submitter email delivery: FormSubmit explicitly disables `_autoresponse` for AJAX forms (`https://formsubmit.co/ajax/...`). Added `_cc: ticket.tenantEmail` to `FormData` so FormSubmit automatically delivers a full copy of the work order submission to the tenant's email address in addition to `tudor@ancasholdings.com`.
- [x] Streamlined and cleaned up the ticket confirmation screen:
  - Removed all clutter, debug alerts, activation prompts, transmission status banners, receipt previews, and third-party email client buttons.
  - Retained strictly:
    1. Ticket Summary (Resident contact info, Property & Unit, Maintenance Classification & Urgency, Issue Description, Attached Photos).
    2. **Print** button (`window.print()`).
    3. **Email to myself** button (`mailto:` link pre-filled with ticket number, summary, and 24-48h notice).

