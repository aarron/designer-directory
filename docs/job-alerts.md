# Designer job alerts

Designers in the directory opt in to matched roles by email at a cadence they
choose. Built 2026-09-02; the invitation campaign has **not** been sent yet.

## The pieces

| Piece | Where | Notes |
| --- | --- | --- |
| Opt-in page | `/alerts?token=<editToken>` | No login; the token is the same one the profile-edit links use. `?stop=1` is the one-click unsubscribe. `?status=NOT_LOOKING` pre-selects "I'm set". |
| Matching | `lib/job-alerts.ts` → `pickMatches` | Same scorer as the employer flow (`lib/matching.ts`), run designer→jobs. Threshold 60, one role per employer, max 10, ties broken per designer. |
| Weekly send | `/api/cron/job-alerts`, Tuesdays 14:00 UTC | Cadence enforced per designer (weekly / biweekly / monthly). Sends only with **3+ matches**; otherwise waits and the window widens. Each role is logged in `job_alert_logs` and never re-sent. |
| Invitation | `POST /api/admin/job-alerts {mode:"invite"}` | One-off "still looking? choose a cadence" email with three personal sample roles. Batched; never twice (`alertInviteSentAt`); skips opted-in and not-looking. |
| Hand runs | `POST /api/admin/job-alerts {mode:"alerts"}` | `dryRun:true` previews who would get what. |

Auth for the admin endpoint is `x-admin-secret`. The cron is `Authorization: Bearer $CRON_SECRET`.

## Schema

On `Designer`: `alertFrequency` (NONE / WEEKLY / BIWEEKLY / MONTHLY), `alertOptInAt`,
`alertLastSentAt`, `alertInviteSentAt`, `wantsLeadership`. Table `JobAlertLog`
(designerId, jobId, sentAt; unique per pair).

## Rules and why

- **Minimum three matches or nothing.** A thin alert teaches people to ignore
  the next one. Skipping leaves `alertLastSentAt` alone, so the next run looks
  further back.
- **First alert looks back 14 days** from the run, not from opt-in, so the
  opt-in page's "N roles match right now" is what actually arrives.
- **One role per employer.** Adobe has 34 open; an alert that is a third Adobe
  reads like an ad.
- **Leadership is a preference, not a discipline.** `wantsLeadership` adds +5
  for leadership roles and −10 against them; neutral when unknown, so the
  employer matching flow is unchanged.
- **Saving the opt-in form re-confirms the profile** (`lastConfirmedAt`) and
  un-hides it. Choosing "I'm set" hides it and sets not-looking.
- **Opted-in designers are exempt from `confirm-check`** auto-hiding. The alert
  footer carries its own stop link; the check-in email would be a second nag.
- **Legacy profile values** ("Design Leadership", "Chief of Staff") that predate
  the current role list are shown as "(current)" in the form so saving never
  silently rewrites them.

## Running the invitation

Dry run first, then batches of 25 (Resend rate limits):

```bash
curl -s -X POST https://designbetter.careers/api/admin/job-alerts \
  -H 'x-admin-secret: …' -H 'content-type: application/json' \
  -d '{"mode":"invite","dryRun":true,"limit":5}'
```

Then drop `dryRun` and page with `offset` until `done: true`. `emails: [...]`
restricts to specific addresses for a test send. `cohort` is `all` (default),
`visible` or `hidden`.

## Numbers at build time

363 designers: 105 visible and looking, 214 hidden (never re-confirmed), 44 not
looking. Dry run: 100/105 visible and 196/214 hidden would receive a full
ten-role alert today. Invitation eligible: 319.

## Known limits

- Company size contributes almost nothing: only 27 of 645 jobs carry it.
- Role groups are broad (UX/UI ≈ Product ≈ Content). Fine for a first alert;
  tighten with open-rate data.
- Employer de-dup is by normalised name, so "IxDF" and "Interaction Design
  Foundation" count as two. Fix belongs in ingest.
