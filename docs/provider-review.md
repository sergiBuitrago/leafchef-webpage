# Website provider review — closeout, 2026-11-12

## Decision and evidence standard

The blanket "all provider agreements unconfirmed" gate is replaced by the
specific findings below. Review uses the current standard self-service terms for
the personal accounts described by the owner. It is not a private account audit,
proof of historic acceptance, assessment of a negotiated contract, or legal
certification. No new contract was accepted or signed on the owner's behalf.
Revisit if account terms, providers, data collection or release scope change.

## Supabase — standard DPA incorporated

Terms section 7(b) incorporates the DPA. The current DPA is effective with the
service agreement and includes SCCs for applicable restricted transfers. A
separate signature search is not a general prerequisite under these standard
terms. Database location does not imply all Edge/support processing is EU-only.
Visible log retention depends on plan; no unverified exact period is promised.
https://supabase.com/terms
https://supabase.com/legal/customer-resources/data-processing-addendum
https://supabase.com/legal/privacy-resources/data-residency-and-transfers-faq

## Cloudflare — standard DPA incorporated

Self-Serve Agreement section 6.1 incorporates the customer DPA for covered data.
The DPA contains SCC provisions. Turnstile's addendum distinguishes processing
for protecting customer sites from its own bot-detection improvement purposes.
No separate signature was identified as necessary for this standard arrangement.
Do not infer an exact retention duration or an EU-only processing guarantee.
https://www.cloudflare.com/terms/
https://www.cloudflare.com/cloudflare-customer-dpa/
https://www.cloudflare.com/turnstile-privacy-policy/

## Brevo — DPA part of service terms; retention owner-confirmed

Official help identifies the DPA as a section of the Terms of Service. The owner
confirmed relevant transactional logs are set to one month and previews disabled.
The full dynamic Terms page was not extractable by the research tool, so this
record relies on official help for inclusion and does not assert a specific
account's contract version, subprocessor route or independent account inspection.
Only the owner's sender/recipient and country-only message are sent by our code.
https://help.brevo.com/hc/en-us/articles/15403782599570-Where-can-I-find-the-Data-Processing-Agreement-DPA
https://www.brevo.com/legal/termsofuse/
https://help.brevo.com/hc/en-us/articles/4415743225746-Configure-a-custom-retention-period-for-your-transactional-logs-and-email-previews

## GitHub Pages — documented security processing, no invented DPA claim

Pages documentation identifies visitor IP security logs. GitHub's privacy
statement describes its independent controller processing, international SCC/DPF
safeguards and purpose-based retention. Its customer DPA governs covered processor
services, but this review does not claim a separate enterprise DPA was executed
for the personal account. The site ships public assets and the authorised
operator notice; it sends no visitor submission to a GitHub data store.
These documents inform the notice; they are not a site-specific transfer impact
assessment or evidence that every processing operation is a processor operation.
https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement
https://github.com/customer-terms/github-data-protection-agreement

## Consumer Gmail — do not seek a nonexistent consumer DPA

Google says consumer Gmail uses its consumer terms/privacy policy, does not offer
a DPA, and is not acting as a processor for that service. Do not describe it as
Workspace or tell the owner to sign a nonexistent consumer DPA. Country-only
notifications deliberately exclude visitor identifiers. Ordinary direct enquiries
are a separate flow: an email address/content goes to Gmail, documented in the
public notice. This is a controller/recipient assessment under the stated legal
bases, not a claim that a DPA is unnecessary for all future app/business uses.
Reassess before collecting visitor emails or sensitive/account data; a business
mail service with processor terms may be more suitable for expanded processing.
https://support.google.com/policies/answer/9581826?hl=en-GB
https://policies.google.com/privacy

## Implementation and legal basis record

No visitor email, IP geolocation, analytics, account linkage or submission history.
Country is optional and may be omitted. GDPR Article 6(1)(f) is the assessed basis
for hosting/security and broad-demand measurement where personal data is involved:
limited purpose, optional field, no contact identity, no marketing to visitors,
90-day notifications and no unique-user claim reduce intrusion. Turnstile has a
separate unchecked opt-in before loading, Article 6(1)(a)/section 25(1) TDDDG as
applicable. Refusal does not prevent browsing; direct email is an alternative.
The global budget stores only current counters, not user/IP/country identifiers.
Rights and Berlin complaint link are included. The app needs a separate review.

## Verified release status

GitHub Pages published by owner. Owner confirmed a successful browser challenge
and receipt of one Brevo notification. Then owner disabled collection again.
17 local mocked-provider/frontend tests passed in the configuration fix; shared
budget SQL caps/reset/grants were verified in a rolled-back transaction.

Mailbox cleanup is a documented weekly owner-operated routine, not automation.
A recurring .ics reminder is provided for import; it is not installed in a calendar
until the owner imports it. See interest-retention.md. No mailbox was accessed or
deleted, no calendar invitation sent. The remaining operational action is import
the reminder (or use an existing weekly routine), and deploy the revised notice.
Collection stays false unless the owner explicitly reopens it.
