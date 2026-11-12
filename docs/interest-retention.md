# Interest retention policy

Owner decision: 90 days, agreed 2026-11-12.

## Operator-held records

Delete individual interest notification emails within 90 days of receipt,
including operator-controlled copies and trash. Keep no archive of raw messages
or exports beyond this period. If keeping statistics, retain only aggregate
totals by country/region (including Not specified), without submission timestamps,
tokens, IPs, message IDs, or other individual records. Counts are submissions,
not verified unique visitors. Do not count an email twice when aggregating.

The current implementation sends notifications to the owner's Gmail mailbox.
It does not create a Supabase interest table or store an aggregate counter.
Neither mailbox deletion nor aggregation is implemented automatically. Before
enabling collection, establish a mailbox cleanup procedure or automation that
meets the 90-day deadline and verify how deleted messages/trash are handled.
Do not claim that this task configured Gmail cleanup or created an aggregate
statistics service. No mailbox access or deletion has been performed.

## Provider records

The owner's 90-day decision does not change GitHub, Supabase, Cloudflare, Brevo
or Gmail retention settings, security logs, backups or delivery records. Review
applicable provider terms/settings and document actual periods and purposes in
the final privacy notice. Do not imply these records all expire after 90 days.

## Release gate

Keep LEAFCHEF_INTEREST_ENABLED=false until the privacy/provider review, operational
cleanup procedure, durable spam limits, and end-to-end checks are complete.
The privacy page remains a local draft; no website publication is performed here.


## Practical weekly mailbox procedure

Once a week, review interest notifications received at least 80 days ago. In Gmail
search `in:anywhere from:sergi.buitrago@gmail.com subject:"Someone is interested in LeafChef" older_than:80d`.
Check the sender, exact subject and country-only notification body before acting;
the search is a candidate list, not permission to delete unrelated conversations.
If desired, update aggregate country totals once per message before deletion.
Permanently delete only those notifications and their operator-controlled copies,
including matching Trash items. Do not just archive or move them to Trash: Gmail
normally retains Trash for a further 30 days. Review every seven days so the
90-day maximum is met with margin. Keep only a dated completion/count note, no
message IDs or exported individual notifications. This procedure is documented
but has not been installed as an automatic reminder or executed in the mailbox.

Brevo: set relevant-sender log retention to 1 month and never store previews;
confirm in the account before updating the final public notice. See provider-review.md.
