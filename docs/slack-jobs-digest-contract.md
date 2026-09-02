# Jobs digest → Slack: API contract

Design Better Careers owns the job data and de-duplication. **db-community owns
the Slack transport** — it has the single-workspace bot, the scopes, and the
name→ID channel resolver, so keeping Slack calls there avoids copying a bot
token into a second Vercel project where it would break silently on reinstall.

Consumer: a weekly cron in `db-community` posting into `#hiring`.

## Auth

Both endpoints require a shared secret, same value in both Vercel projects:

```
Authorization: Bearer $JOBS_DIGEST_SECRET
```

Missing secret → `503`. Wrong secret → `401`.

## 1. Fetch a digest

```
GET https://designbetter.careers/api/slack/jobs-digest
```

| Query | Meaning |
| --- | --- |
| `dryRun=1` | render without claiming any rows — use while developing |
| `kickoff=1` | one-off introductory wording; acking it also retires the backlog |
| `limit=N` | batch size (default 12, max 30) |

Response:

```jsonc
{
  "batchId": "dg_2026-08-20_a1b2c3d4",  // null when dryRun=1
  "count": 10,          // roles in this batch
  "shown": 8,           // in the message body
  "inThread": 2,        // in the thread reply
  "totalOnBoard": 283,
  "text": "…",          // notification fallback text
  "blocks": [ … ],      // Block Kit, post as-is
  "threadBlocks": [ … ] // or null — post as a thread_ts reply
  "jobIds": ["…"],      // informational
  "claimed": true
}
```

`count: 0` means nothing new this week — **post nothing** and stop.

## 2. Acknowledge

```
POST https://designbetter.careers/api/slack/jobs-digest/ack
{ "batchId": "dg_2026-08-20_a1b2c3d4" }
```

```jsonc
{
  "ok": true,
  "marked": 12,          // rows newly recorded as posted
  "batchSize": 12,       // rows carrying this batchId
  "known": true,
  "alreadyAcked": false, // true on an idempotent repeat
  "backlogRetired": 0    // non-zero only when acking a kickoff
}
```

Status codes are meaningful so a consumer checking only the status can't mistake
a no-op for success:

| Status | Meaning |
| --- | --- |
| `200`, `marked > 0` | recorded |
| `200`, `alreadyAcked: true` | safe idempotent repeat |
| `404` | unknown `batchId` — nothing was marked, treat as failure |

A dry run returns `batchId: null`; acking that will 404.

### The kickoff retires the backlog

A batch id beginning `dgk_` is the kickoff. Acking it marks the batch **and**
retires every remaining unposted role, because the kickoff is a curated
introduction rather than the head of a queue. Without that, the couple hundred
roles already listed each stay "new" and the weekly digest spends months
draining the backlog instead of posting what actually just arrived. It happens
on ack, not on fetch, so a failed post loses nothing.

## Why the two steps

A `GET` **claims** rows; it does not mark them posted. Only the ack does.

- Ack **after** `chat.postMessage` succeeds → correct.
- Ack **before** posting → a failed post silently loses those roles forever.
- Never ack → the claim lapses after **4 hours** and the roles are offered
  again next run. Safe; at worst a week's delay.

Verified against the live table by `scripts/test-digest-claim-ack.mjs`: a claim
removes rows from the pool without marking them, ack marks exactly the batch,
re-ack is a no-op, and a stale claim returns to the pool.

## Posting requirements

- `unfurl_links: false` and `unfurl_media: false`. Without them Slack renders a
  preview card per job link and one message fills the channel — which defeats
  the point of a digest.
- `threadBlocks`, when present, goes in a `thread_ts` reply so the channel only
  ever shows **one** message however many roles arrived.
- Post `blocks` unmodified. Formatting (caps, category spread, one role per
  employer, salary lines) is already applied upstream.

## Anti-flood rules already applied upstream

Repeating so the consumer doesn't re-solve them: max 8 in the body, hard cap of
30 per run, one role per employer, round-robin across role categories (187 of
283 active roles are Product Design, so "newest 8" would read as eight
near-identical listings), and only roles that have both a description and a
logo.

## Backlog retired 2026-08-20

After the first two live digests (60 roles across batches `dgk_…6qeacl5a` and
`dg_…0i263aov`), the remaining 277 unposted rows were retired by hand, because
the kickoff-ack path that should have done it did not exist yet. Retired rows
have `slackPostedAt` set and `slackBatchId` null, so they stay distinguishable
from roles actually sent to Slack.

Net effect: the weekly digest now carries only roles ingested from that date
onward. Expect small digests — a quiet week returning `count: 0` is normal and
the consumer should post nothing.

## Second retirement 2026-09-02

The Workday fetcher and 40 new ATS boards added ~300 roles in one day, all of
which counted as "new" to the digest — a 29-week queue at 12 per week. Retired
by hand again (342 rows), by decision, so Monday's digest is drawn from roles
that arrived this week rather than a five-month backlog. Same marker as before:
`slackPostedAt` set, `slackBatchId` null.
