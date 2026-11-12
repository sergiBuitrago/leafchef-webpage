# Website provider review — 2026-11-12

Scope: promotional website and country-only interest button, separate from Android.
This records a source review, not a legal certification or confirmation of the
owner's account contracts. The function remains closed. No live email was sent.

## Data flow and minimisation

GitHub Pages delivers local assets. Supabase gets an availability request and,
when enabled, the selected ISO country/region, honeypot and captcha token.
Turnstile loads only after an unchecked, specific opt-in is selected. The function
validates the token and makes a service-role-only call to a Postgres budget RPC.
Brevo receives only the operator's sender/recipient and a country-only message;
Gmail receives that message. No visitor contact list, IP geolocation or analytics.

## Legal basis assessment to review before activation

- Hosting/availability/security: GDPR Article 6(1)(f), functioning secure website.
- Optional broad-country interest: Article 6(1)(f), assessing potential demand.
  The country is optional, no account linkage, no IP-derived country, no contact
  identifier, no marketing to visitors, 90-day notifications, no visitor history.
  These safeguards reduce intrusion; visitors can browse without participating.
- Turnstile loading/device access: separate opt-in, Article 6(1)(a) and section
  25(1) TDDDG as applicable. Refusal does not prevent browsing; direct email is an
  alternative. Choice is not persisted. No pre-clearance is configured in code.
- Budget counter: global counts only, no per-user identifier. This protects mail
  quotas, not all invocation costs or denial of service; an attacker may exhaust
  the shared allowance. Captcha remains necessary. No unique-visitor claim.

## Findings and sources

GitHub documents Pages IP security logging. Its privacy statement uses
purpose-based retention and transfer arrangements. Do not promise a numerical
IP log deletion period not supplied by GitHub.
https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement

Supabase log access retention depends on plan; platform/security retention is not
necessarily the same. Its DPA/FAQ describe safeguards and international access.
EU database location does not establish EU-only Edge Function/support processing.
The existing account DPA, project plan/region and relevant log settings need owner
confirmation; no credentials or private household data were inspected for this.
https://supabase.com/legal/dpa
https://supabase.com/legal/privacy-resources/data-residency-and-transfers-faq
https://supabase.com/docs/guides/observability/logs

Cloudflare documents browser/network signals, its processor role for protecting
the site and controller role for improving bot detection. Its addendum supplies
no single log-retention duration. Consent is separate and the widget remains
unloaded until chosen; the owner should confirm applicable Cloudflare DPA/terms.
https://www.cloudflare.com/turnstile-privacy-policy/

Brevo warns that transactional logs/previews are indefinite unless configured.
Retention rules support 1–24 months, with deletion up to 24h after expiry. The owner confirmed the relevant account setup is complete: 1 month and Never
store previews. This confirmation is owner-reported, not an account inspection. This affects the
sender's other transactional mail too, so do not silently change account settings.
https://help.brevo.com/hc/en-us/articles/4415743225746-Configure-a-custom-retention-period-for-your-transactional-logs-and-email-previews
https://www.brevo.com/legal/termsofuse/

Gmail Trash keeps messages for another 30 days unless permanently deleted.
Archiving is not deletion. A weekly manual procedure is documented separately;
no Gmail access or automatic cleanup has been configured. Google account/backup
retention is separate from the operator-held record policy.
https://support.google.com/mail/answer/7401?hl=en
https://policies.google.com/privacy

Rights/notice references:
https://www.dataprotection.ie/en/organisations/know-your-obligations/transparency
https://www.gesetze-im-internet.de/ttdsg/__25.html
https://www.datenschutz-berlin.de/buergerinnen-und-buerger/beschwerde/

## Remaining account-side confirmations, not missing code

1. Brevo retention setup confirmed by owner; applicable DPA still needs confirmation.
2. Existing Supabase/Cloudflare/hosting/mail arrangements and transfer safeguards.
3. Turnstile hostname/site key/secret and explicit widget action interest.
4. Owner's weekly mailbox cleanup procedure (or reviewed automation).
5. GitHub Pages enablement and full browser challenge/email delivery test.

Keep LEAFCHEF_INTEREST_ENABLED=false until these are resolved. Publishing static
content with the form closed does not complete the provider review automatically.
