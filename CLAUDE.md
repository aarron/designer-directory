# Design Better Careers — Claude Guidelines

## Bug Fix Approval Workflow

**Never implement a bug fix without explicit approval from @aarronwalter first.**

When a bug is reported or discovered, follow this sequence:

1. **Diagnose** — investigate the root cause. Read relevant files, check the database if needed, reproduce the problem in your reasoning.
2. **Flag security risks immediately** — if the bug has any security implication (data exposure, auth bypass, injection, open redirect, abuse vector, etc.), call it out prominently at the top of your response before anything else. Do not wait for the approval step.
3. **Propose a solution** — describe what you intend to change and why. Include the files affected and a summary of the approach. Do not write any code yet.
4. **Wait for approval** — stop and ask: "Should I go ahead with this fix?" Do not proceed until you receive explicit confirmation ("yes", "go ahead", "do it", or similar).
5. **Implement** — only after approval, make the changes.

## Database Access

You have access to the production database via Prisma. Use it freely to investigate bugs, check data, or verify fixes (e.g. querying coupons, designer records, job postings). Treat all personal data (emails, tokens) as sensitive — do not log or display it unnecessarily.

## General Principles

- Prefer targeted, minimal changes over broad refactors unless asked.
- When touching auth, tokens, or email-sending code, describe the change carefully in the proposal step and note any side effects.
- Never push to git or deploy without being asked.
