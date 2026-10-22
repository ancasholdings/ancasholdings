# Ancas Holdings Maintenance Portal Plan

## Tasks Completed
- [x] Converted property address selection to a mandatory free-form input.
- [x] Removed time estimates (e.g. 3-5 days) from the urgency rating indicators.
- [x] Updated operations review disclaimer copy.
- [x] Removed manager email (`tudor@ancasholdings.com`) from user-facing text in the portal.
- [x] Repaired photo attachment upload pipeline for multipart FormSubmit transmissions with native attachment fields.
- [x] Configured separate submitter email notification & dispatch:
  - Form submission with full ticket data and attachments is directed to `tudor@ancasholdings.com`.
  - Removed `_cc` so the submitter is not sent the internal management work order payload.
  - Submitter receives a separate, brief email notification (`_autoresponse`) with:
    - Ticket number in the subject line (`[Ticket #...]`)
    - Clear statement that their ticket has been received
    - Notice that someone from property management will be in touch within 24–48 hours
    - A brief thank you note
  - Updated post-submission screen with a visible "Confirmation Receipt Template" preview for submitters and synced the "Send / Save Copy to My Email" button to match.
- [x] Verified full build compilation and linting tests pass.
