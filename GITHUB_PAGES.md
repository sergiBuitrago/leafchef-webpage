# GitHub Pages release

Expected URL: https://sergibuitrago.github.io/leafchef-webpage/
Supabase origin: https://sergibuitrago.github.io (no repository path/trailing slash).

The workflow uploads only public/, excluding server code, migrations and secrets.
Relative local asset links support the repository path. It is manual while this
site is being prepared. Source is prepared on feat/promotional-website for merging into main.

## Completed and remaining operations

The owner configured Pages and published the site, confirmed Brevo retention,
completed a real browser/challenge/notification test and then disabled collection.
Secrets and widget settings worked in that test; do not repeat their setup.
Standard provider terms are reviewed in docs/provider-review.md. No new agreement
was accepted on the owner's behalf. App terms are outside this website release.

For the privacy/retention update:
1. Import docs/leafchef-mailbox-cleanup.ics once (or establish an existing weekly
   routine). The calendar event is not installed automatically.
2. Run Actions > Deploy website to GitHub Pages > Run workflow on main.
3. Confirm the revised Privacy page is served without the old pre-launch banner.

Only public/ is deployed. The calendar file is a repository/local artifact, not
a downloadable public website route. Keep LEAFCHEF_INTEREST_ENABLED=false unless
the owner chooses to reopen collection. Reopening is independent of deployment.

## Implemented

Country-only form → Supabase → Brevo → owner mailbox. Public keys only in browser.
Turnstile is gated behind an unchecked specific opt-in. Shared persistent caps
are installed (20 attempts/hour, 100/day), with no per-user tracking. Live status
and CORS preflight were checked: 200 closed / 204 allowed. The owner subsequently confirmed real email delivery.

Collection was returned to false after the successful test. Static publication does not automatically enable collection.

References:
https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
