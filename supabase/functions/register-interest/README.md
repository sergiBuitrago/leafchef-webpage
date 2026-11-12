# register-interest

Project: vjkdmxknbtlrsnsqfayq. Deployment version 9, verify_jwt=true.
No existing app table or recipe function is modified. The frontend uses the
public legacy anon JWT for gateway compatibility, never service-role credentials.

## Contract

GET: `{ "message": "closed" }` until enabled and all required configuration exists.
OPTIONS: exact-origin CORS for the configured site.
POST JSON: `{ "country": "DE", "website": "", "consent": true, "token": "..." }`.
Country is optional (empty/omitted); only valid ISO region codes are accepted.
Email and other unrecognised fields are rejected. Consent must be affirmative.

Order: payload/origin checks → atomic shared budget → captcha hostname/action
validation → fixed-recipient plain-text Brevo notification. No reply-to or contact
creation. A Brevo tag leafchef-interest identifies these notifications.

## Secrets

Set in Supabase Edge Function Secrets, never public files:
- LEAFCHEF_BREVO_API_KEY
- LEAFCHEF_BREVO_SENDER_EMAIL (verified)
- LEAFCHEF_INTEREST_TO_EMAIL (fixed owner recipient)
- LEAFCHEF_SITE_ORIGIN=https://sergibuitrago.github.io (no path/trailing slash)
- LEAFCHEF_TURNSTILE_SECRET_KEY
- LEAFCHEF_INTEREST_ENABLED=false until all release steps are complete

SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are supplied by the hosted runtime.
They are used only for the fixed budget RPC; never returned to clients or logged.
Local tests inject fake server credentials and mock the network.

Public Turnstile site key is in interest.js; widget action must be interest and
allowed hostname sergibuitrago.github.io. The widget loads only after opt-in.

## Durable budget

Migration creates leafchef_web_private.interest_budget and the public RPC
leafchef_web_consume_interest_budget. The RPC is SECURITY DEFINER with an empty
search_path and execution granted only to service_role. The private table has RLS
and no browser grants. A row lock atomically limits attempts to 20 per UTC hour
and 100 per UTC day. It stores only counters/window starts, no visitor data.

Malformed/foreign requests are rejected first. Valid-looking attempts consume
budget before captcha so automated token failures cannot trigger unlimited captcha
requests. Budget/provider errors fail closed. Shared limits can be exhausted by
an attacker and do not cap invocation/platform costs. No retry or unique-user claim.

Run `npm run check`. The rollback-only SQL check is in supabase/tests and has been
run against the deployed database; no test budget state remains. Real browser
and email-delivery checks remain pending with collection disabled.

See docs/provider-review.md and docs/interest-retention.md for release steps.
