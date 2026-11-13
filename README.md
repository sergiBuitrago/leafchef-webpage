# LeafChef promotional website

Local source for https://github.com/sergiBuitrago/leafchef-webpage.
The Android app is a separate project. Do not copy its private data or secrets.

## Preview and checks

Node 18+; no dependencies or install step. `npm run dev` serves `public/` on
http://127.0.0.1:4173. `npm run check` validates syntax, assets and anchors and runs
mocked-provider/frontend and localization checks. No real email is sent by the checks.

## Languages

English, German, Spanish and French are available through a language switcher on
every page, including legal/privacy pages. Each translation has its own static
URL (for example `index.de.html`) and works without JavaScript. The switcher
preserves the equivalent page; there is no automatic language redirect or
language-preference storage. The interactive examples, interest form messages,
country names and optional Turnstile widget use the selected language.

English HTML in `public/` is the source layout. Edit translations in
`locales/de.json`, `locales/es.json` and `locales/fr.json`, and interactive messages
in `locales/runtime.json`. Run `npm run localize` after changing English copy,
layouts or translations. Commit the generated localized HTML and `public/locales/`
scripts too: Pages deploys `public/` directly. `npm run check` rejects missing or
stale translations and validates every page's local links and assets.

## Website and hosting

Warm cream/green landing page, cooking-routine example, three interactive Android
layout recreations, household features, availability and legal pages. The previews
are clearly labelled HTML recreations with example data, not captured screenshots.
They use the app's DM Sans font (license in assets), five navigation destinations,
native icon shapes and light palette. The hero food photograph is AI-generated
illustration. There are no testimonials, invented customer figures or download links.

Only `public/` is uploaded by the manual GitHub Pages workflow. Expected URL:
https://sergibuitrago.github.io/leafchef-webpage/ . See GITHUB_PAGES.md.
The owner published the website through GitHub Pages and confirmed the live notification test. Browser visual comparison
remains pending; the previous computer-use session could not verify the browser URL.

## Interest button

No visitor email field. Optional self-selected country/region, including Prefer
not to say. No IP location lookup, visitor database, newsletter or account linkage.
The frontend calls Supabase register-interest; an explicit unchecked opt-in must
be selected before Cloudflare Turnstile loads. After validation, Brevo sends a
country-only notification to the fixed owner recipient. Counts are submissions,
not unique people. The only database storage is a private singleton budget counter. Successful
submissions save a browser-only completion flag in localStorage and restore the
thank-you state on later visits; no country, timestamp or unique ID is saved.
This deters repeat submissions in the same browser; clearing storage, other
browsers/devices or unavailable storage can bypass it.

The deployed function is configuration-gated and currently reports closed.
Global caps: 20 attempts/hour and 100/day, shared across instances and UTC windows.
The RPC is callable only by service_role, never browser anon/authenticated roles.
Provider failures fail closed; no automatic email retry. This protects mail usage,
not every request/invocation cost or denial of service. No visitor identifier is
stored by the limiter. See supabase/functions/register-interest/README.md.

## Legal and release status

The supplied operator identity, public contact and service address are in the
website Impressum/privacy notice. Website privacy scope is separate from the app.
The source review is in docs/provider-review.md; the 90-day mailbox policy and
weekly cleanup procedure are in docs/interest-retention.md. No account settings,
provider agreements, mailbox cleanup or reminders have been configured by this code.

Provider standard-term findings are closed out in docs/provider-review.md. The
website notice no longer carries the outdated blanket pre-launch-review banner.
App terms remain a separate draft. This is not a certification of legal compliance.
The owner confirmed Brevo retention and a real challenge/email delivery test.
Collection was disabled afterwards and remains owner-controlled.

Import docs/leafchef-mailbox-cleanup.ics once to establish the weekly reminder;
the documented cleanup remains manual. Deploy the revised static notice through
the existing manual Pages workflow. No new integration test is required for it.

## Source map

- public/: static Pages artifact, with only public project/site keys.
- scripts/: local preview and source checks; no Node email API remains.
- supabase/functions/register-interest/: deployed function and provider tests.
- supabase/migrations/: private service-only global budget migration.
- supabase/tests/: rollback-only budget/permissions regression check.
- tests/: frontend behaviour tests, with no browser or provider calls.

The website source is maintained on main; publication is a separate manual workflow.
