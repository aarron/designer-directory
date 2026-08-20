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
| `kickoff=1` | one-off introductory wording, for the first ever post |
| `limit=N` | cap the batch (default and max 30) |

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

Returns `{ ok: true, marked: N }`. Idempotent — re-acking marks 0.

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
