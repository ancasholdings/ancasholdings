# Ancas Holdings Maintenance Portal Plan

## Tasks Completed
- [x] Converted property address selection to a mandatory free-form input.
- [x] Removed time estimates (e.g. 3-5 days) from the urgency rating indicators.
- [x] Updated operations review disclaimer copy.
- [x] Removed manager email (`tudor@ancasholdings.com`) from user-facing text in the portal.
- [x] Repaired photo attachment upload pipeline for multipart FormSubmit transmissions.
- [x] Configured automated email notifications to the person submitting the form:
  - Added native `name="email"` input parameter required by FormSubmit to trigger `_autoresponse` to the submitter.
  - Added `name="_cc"` directed to the submitter's email to deliver a copy of the work order and attachments summary.
  - Drafted a full, professional work order receipt in `_autoresponse` containing ticket ID, property unit, category, urgency, and operations review notice.
  - Added an in-app confirmation banner in the post-submission screen with direct "Send / Save Copy to My Email" action.
  - Added notification disclaimer in the submission form reassuring tenants of the automatic email receipt.
