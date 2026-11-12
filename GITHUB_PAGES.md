# GitHub Pages release

Expected URL: https://sergibuitrago.github.io/leafchef-webpage/
Supabase origin: https://sergibuitrago.github.io (no repository path/trailing slash).

The workflow uploads only public/, excluding server code, migrations and secrets.
Relative local asset links support the repository path. It is manual while this
site is being prepared. Source is prepared on feat/promotional-website for merging into main.

1. Finish account-side items below; keep collection disabled meanwhile.
2. Commit/review/push the source and merge into the repository's default branch.
3. Settings > Pages > Build and deployment > Source: GitHub Actions.
4. Actions > Deploy website to GitHub Pages > Run workflow. Confirm returned URL.
5. Check full layout/keyboard use at mobile and desktop sizes. Test the enabled
   form, challenge, country selection and a single delivery before wider launch.

GitHub Free supports public-repository Pages. Private repositories need an eligible
paid plan. Do not change repository visibility implicitly. GitHub CLI is unavailable
in this environment; no Pages settings, remote branch, or deployment was changed.

## Account-side items

- Brevo retention: owner confirmed 1 month of logs and Never store previews.
  The privacy notice records that confirmation; no account inspection was performed.
- Confirm applicable provider processing agreements, transfer arrangements and
  Supabase plan/log settings; see docs/provider-review.md. This is not done by code.
- Confirm Turnstile secret/hostname and all prefixed Supabase secrets.
- Establish weekly mailbox cleanup described in docs/interest-retention.md. No
  automatic deletion, aggregation or calendar reminder is installed.

## Implemented

Country-only form → Supabase → Brevo → owner mailbox. Public keys only in browser.
Turnstile is gated behind an unchecked specific opt-in. Shared persistent caps
are installed (20 attempts/hour, 100/day), with no per-user tracking. Live status
and CORS preflight were checked: 200 closed / 204 allowed. No real email sent.

Keep LEAFCHEF_INTEREST_ENABLED=false until the remaining account and delivery
checks are resolved. Static publication does not automatically enable collection.

References:
https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
