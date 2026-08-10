/**
 * slack-jobs.ts — posts new design roles to the community #hiring channel.
 *
 * Designed around not flooding the channel:
 *   - one digest message per run, never one message per job
 *   - unfurling disabled, or Slack renders a preview card per link and a single
 *     message still fills the screen
 *   - a hard cap on what appears in the message; the remainder goes in a thread
 *     reply, so the channel only ever shows one message however many jobs came in
 *   - slackPostedAt is written only after Slack confirms the send, so a failure
 *     retries next run instead of silently dropping roles
 *
 * Used by:
 *   - app/api/cron/slack-jobs   (weekly, Mondays)
 *   - app/api/admin/slack-jobs  (manual run / kickoff / dry run)
 */

import { db } from "@/lib/db";

const SLACK_API = "https://slack.com/api";

/** Roles shown in the message body; the rest go into a thread reply. */
export const DIGEST_LIMIT = 8;
/** Upper bound on a single run, so an ingest spike can't post hundreds. */
export const MAX_PER_RUN = 30;

export interface DigestJob {
  id: string;
  company: string;
  title: string;
  location: string;
  role: string;
  remote: boolean;
  compensation: string | null;
  experienceLevel: string;
}

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://designbetter.careers";
}

function botToken(): string | null {
  // Deliberately its own variable: SLACK_BOT_TOKEN elsewhere belongs to the
  // podcast-production workspace, which has no #hiring channel.
  return process.env.SLACK_JOBS_BOT_TOKEN ?? null;
}

function channelId(): string | null {
  return process.env.SLACK_JOBS_CHANNEL_ID ?? null;
}

/**
 * Round-robin across role categories so a digest doesn't read as eight
 * near-identical Product Design listings — that's most of the board.
 */
export function interleaveByRole<T extends { role: string }>(jobs: T[]): T[] {
  const buckets = new Map<string, T[]>();
  for (const j of jobs) {
    const key = j.role || "Other";
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(j);
  }
  // Rarer categories first, so they aren't crowded out by the dominant one.
  const ordered = [...buckets.values()].sort((a, b) => a.length - b.length);
  const out: T[] = [];
  let added = true;
  while (added) {
    added = false;
    for (const b of ordered) {
      const next = b.shift();
      if (next) { out.push(next); added = true; }
    }
  }
  return out;
}

/**
 * Keeps any single employer from taking several of the few visible slots.
 * Excess roles are deferred rather than dropped, so they still get posted —
 * just later in the list or in the thread.
 */
export function capPerCompany<T extends { company: string }>(jobs: T[], max: number): T[] {
  const seen = new Map<string, number>();
  const kept: T[] = [];
  const deferred: T[] = [];
  for (const j of jobs) {
    const key = j.company.trim().toLowerCase();
    const n = seen.get(key) ?? 0;
    if (n < max) {
      kept.push(j);
      seen.set(key, n + 1);
    } else {
      deferred.push(j);
    }
  }
  return [...kept, ...deferred];
}

function escapeMrkdwn(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function jobLine(job: DigestJob): string {
  const bits = [job.location];
  if (job.remote && !/remote|anywhere/i.test(job.location)) bits.push("Remote OK");
  if (job.compensation) bits.push(job.compensation);
  const meta = bits.filter(Boolean).map(escapeMrkdwn).join(" · ");
  return `*<${appUrl()}/jobs/${job.id}|${escapeMrkdwn(job.title)}>* at ${escapeMrkdwn(job.company)}\n_${meta}_`;
}

export interface DigestBlocks {
  text: string;
  blocks: unknown[];
  threadBlocks: unknown[] | null;
}

export function buildDigest(
  shown: DigestJob[],
  overflow: DigestJob[],
  opts: { kickoff?: boolean; totalOnBoard: number },
): DigestBlocks {
  const n = shown.length + overflow.length;
  const heading = opts.kickoff
    ? `:sparkles: We're posting design roles here now — starting with ${n} from the board`
    : `:briefcase: ${n} new design role${n === 1 ? "" : "s"} this week`;

  const blocks: unknown[] = [
    { type: "header", text: { type: "plain_text", text: opts.kickoff ? "Design roles are coming to this channel" : `${n} new design role${n === 1 ? "" : "s"}`, emoji: true } },
  ];

  if (opts.kickoff) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `We now post new design roles from <${appUrl()}|Design Better Careers> here weekly — one digest, no spam. Here are ${n} to start; there are *${opts.totalOnBoard}* open on the board right now.`,
      },
    });
  }

  blocks.push({ type: "divider" });

  // One section per role. Slack caps a message at 50 blocks, and DIGEST_LIMIT
  // keeps us far below that.
  for (const job of shown) {
    blocks.push({ type: "section", text: { type: "mrkdwn", text: jobLine(job) } });
  }

  blocks.push({ type: "divider" });

  const footerBits = [`<${appUrl()}/jobs|Browse all ${opts.totalOnBoard} open roles →>`];
  if (overflow.length) footerBits.unshift(`*${overflow.length} more* in thread 🧵`);
  blocks.push({
    type: "context",
    elements: [{ type: "mrkdwn", text: footerBits.join("  ·  ") }],
  });

  const threadBlocks = overflow.length
    ? [
        {
          type: "section",
          text: { type: "mrkdwn", text: `*${overflow.length} more role${overflow.length === 1 ? "" : "s"}:*` },
        },
        ...overflow.map((job) => ({ type: "section", text: { type: "mrkdwn", text: jobLine(job) } })),
      ]
    : null;

  return { text: heading, blocks, threadBlocks };
}

async function slackPost(method: string, payload: Record<string, unknown>) {
  const token = botToken();
  if (!token) throw new Error("SLACK_JOBS_BOT_TOKEN is not set");
  const res = await fetch(`${SLACK_API}/${method}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json() as { ok: boolean; error?: string; ts?: string; channel?: string };
  if (!data.ok) throw new Error(`slack ${method} failed: ${data.error ?? res.status}`);
  return data;
}

export interface DigestResult {
  ok: boolean;
  posted: number;
  shown: number;
  inThread: number;
  eligible: number;
  kickoff: boolean;
  dryRun: boolean;
  ts?: string;
  skippedReason?: string;
  preview?: DigestBlocks;
  /** Backlog rows marked as posted after a kickoff, so they aren't re-queued. */
  backlogSuppressed?: number;
}

/**
 * Select, post and mark. `kickoff` sends the introductory message and is meant
 * to be run once by hand; the weekly cron uses the default path.
 */
export async function sendJobsDigest(opts: {
  kickoff?: boolean;
  dryRun?: boolean;
  limit?: number;
} = {}): Promise<DigestResult> {
  const kickoff = Boolean(opts.kickoff);
  const dryRun = Boolean(opts.dryRun);
  const cap = Math.min(opts.limit ?? MAX_PER_RUN, MAX_PER_RUN);

  const totalOnBoard = await db.job.count({ where: { active: true } });

  // Only roles good enough to represent us: a description to read and a logo,
  // and never one already sent.
  const candidates = await db.job.findMany({
    where: {
      active: true,
      slackPostedAt: null,
      description: { not: null },
      companyLogoUrl: { not: null },
    },
    select: {
      id: true, company: true, title: true, location: true, role: true,
      remote: true, compensation: true, experienceLevel: true,
      featured: true, createdAt: true,
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: cap * 3,
  });

  if (candidates.length === 0) {
    return {
      ok: true, posted: 0, shown: 0, inThread: 0, eligible: 0,
      kickoff, dryRun, skippedReason: "no unposted jobs",
    };
  }

  // Spread across role categories first, then keep one employer from filling
  // the handful of visible slots.
  const selected = capPerCompany(interleaveByRole(candidates), 1).slice(0, cap);
  const shown = selected.slice(0, DIGEST_LIMIT);
  const overflow = selected.slice(DIGEST_LIMIT);
  const digest = buildDigest(shown, overflow, { kickoff, totalOnBoard });

  if (dryRun) {
    return {
      ok: true, posted: 0, shown: shown.length, inThread: overflow.length,
      eligible: candidates.length, kickoff, dryRun: true, preview: digest,
    };
  }

  const channel = channelId();
  if (!channel) throw new Error("SLACK_JOBS_CHANNEL_ID is not set");

  const main = await slackPost("chat.postMessage", {
    channel,
    text: digest.text,
    blocks: digest.blocks,
    // Without this, every job link renders its own preview card and one
    // message becomes a wall.
    unfurl_links: false,
    unfurl_media: false,
  });

  if (digest.threadBlocks) {
    try {
      await slackPost("chat.postMessage", {
        channel,
        thread_ts: main.ts,
        text: `${overflow.length} more roles`,
        blocks: digest.threadBlocks,
        unfurl_links: false,
        unfurl_media: false,
      });
    } catch (err) {
      // The digest itself landed; losing the thread reply shouldn't cause the
      // whole batch to be re-posted next week.
      console.error("[slack-jobs] thread reply failed:", err);
    }
  }

  // Mark only after Slack confirmed — a failure above leaves these for retry.
  const now = new Date();
  await db.job.updateMany({
    where: { id: { in: selected.map((j) => j.id) } },
    data: { slackPostedAt: now },
  });

  // The kickoff is a curated introduction, not the start of a queue. Without
  // this, the couple hundred jobs already on the board would each still count
  // as "new" and the weekly digest would spend months draining the backlog
  // instead of posting what actually just came in.
  let backlogSuppressed = 0;
  if (kickoff) backlogSuppressed = await suppressBacklog();

  return {
    ok: true, posted: selected.length, shown: shown.length,
    inThread: overflow.length, eligible: candidates.length,
    kickoff, dryRun: false, ts: main.ts,
    ...(kickoff ? { backlogSuppressed } : {}),
  };
}

/**
 * Confirms the Slack side is wired up correctly, without ever returning the
 * token: which workspace it belongs to, whether the channel resolves, and
 * whether the bot is actually in it (Slack rejects posts to channels the bot
 * hasn't joined, with `not_in_channel`).
 */
export async function verifySlackSetup(): Promise<{
  ok: boolean;
  tokenPresent: boolean;
  channelPresent: boolean;
  workspace?: string;
  botUser?: string;
  channel?: string;
  botInChannel?: boolean;
  canPost?: boolean;
  problems: string[];
}> {
  const problems: string[] = [];
  const tokenPresent = Boolean(botToken());
  const channelPresent = Boolean(channelId());
  if (!tokenPresent) problems.push("SLACK_JOBS_BOT_TOKEN is not set");
  if (!channelPresent) problems.push("SLACK_JOBS_CHANNEL_ID is not set");
  if (!tokenPresent || !channelPresent) {
    return { ok: false, tokenPresent, channelPresent, problems };
  }

  let workspace: string | undefined;
  let botUser: string | undefined;
  try {
    const auth = await slackPost("auth.test", {}) as unknown as { team?: string; user?: string };
    workspace = auth.team;
    botUser = auth.user;
  } catch (err) {
    problems.push(`token rejected by Slack: ${String(err).replace(/^Error:\s*/, "")}`);
    return { ok: false, tokenPresent, channelPresent, problems };
  }

  let channel: string | undefined;
  let botInChannel: boolean | undefined;
  try {
    const info = await slackPost("conversations.info", { channel: channelId() }) as unknown as {
      channel?: { name?: string; is_member?: boolean };
    };
    channel = info.channel?.name;
    botInChannel = info.channel?.is_member;
    if (botInChannel === false) {
      problems.push(`bot is not in #${channel ?? "the channel"} — invite it with /invite @${botUser ?? "bot"}`);
    }
  } catch (err) {
    problems.push(`channel lookup failed: ${String(err).replace(/^Error:\s*/, "")}`);
  }

  const canPost = problems.length === 0;
  return {
    ok: canPost, tokenPresent, channelPresent,
    workspace, botUser, channel, botInChannel, canPost, problems,
  };
}

/**
 * Marks every currently-listed job as already posted. Run once before the first
 * weekly digest so the 200+ job backlog can't land in the channel at once.
 */
export async function suppressBacklog(exceptIds: string[] = []): Promise<number> {
  const r = await db.job.updateMany({
    where: { slackPostedAt: null, ...(exceptIds.length ? { id: { notIn: exceptIds } } : {}) },
    data: { slackPostedAt: new Date() },
  });
  return r.count;
}
