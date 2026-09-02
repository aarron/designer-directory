"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PRIMARY_ROLES, EXPERIENCE_LEVELS, ROLE_TYPES, REMOTE_PREFERENCES } from "@/lib/utils";
import type { AlertFrequency, WorkStatus } from "@prisma/client";

const FREQUENCIES: AlertFrequency[] = ["NONE", "WEEKLY", "BIWEEKLY", "MONTHLY"];
const STATUSES: WorkStatus[] = ["OPEN", "OPEN_SOON", "NOT_LOOKING"];

function pick<T extends string>(value: unknown, allowed: readonly T[]): T | undefined {
  return typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : undefined;
}

/**
 * One submit does three jobs: records whether they're still looking, sets the
 * alert cadence, and refreshes the fields matching runs on. Any answer also
 * counts as confirming the profile, which is the point — this replaces the
 * check-in email that asked for a confirmation and offered nothing back.
 */
export async function saveAlertPreferences(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const designer = token
    ? await db.designer.findUnique({
        where: { editToken: token },
        select: { id: true, alertOptInAt: true, primaryRole: true, experienceLevel: true, remotePreference: true },
      })
    : null;
  if (!designer) redirect("/alerts?error=notfound");

  const now = new Date();
  const status = pick(formData.get("status"), STATUSES) ?? "OPEN";

  if (status === "NOT_LOOKING") {
    await db.designer.update({
      where: { id: designer.id },
      data: {
        openToWork: "NOT_LOOKING",
        alertFrequency: "NONE",
        hidden: true,
        lastConfirmedAt: now,
        confirmSentAt: null,
      },
    });
    redirect(`/alerts?token=${encodeURIComponent(token)}&saved=1`);
  }

  const frequency = pick(formData.get("frequency"), FREQUENCIES) ?? "NONE";
  // Accept list members or the designer's existing value (legacy options the
  // form shows as "(current)"); anything else is ignored and the field kept.
  const primaryRole = pick(formData.get("primaryRole"), [...PRIMARY_ROLES, designer.primaryRole]);
  const experienceLevel = pick(formData.get("experienceLevel"), [...EXPERIENCE_LEVELS, designer.experienceLevel]);
  const remotePreference = pick(formData.get("remotePreference"), [...REMOTE_PREFERENCES, ...(designer.remotePreference ? [designer.remotePreference] : [])]);
  const location = String(formData.get("location") ?? "").trim().slice(0, 120);
  const typeOfRole = formData.getAll("typeOfRole").filter((v): v is string => typeof v === "string" && (ROLE_TYPES as readonly string[]).includes(v));

  await db.designer.update({
    where: { id: designer.id },
    data: {
      openToWork: status,
      hidden: false,
      publicProfile: true,
      lastConfirmedAt: now,
      confirmSentAt: null,
      alertFrequency: frequency,
      alertOptInAt: frequency === "NONE" ? designer.alertOptInAt : (designer.alertOptInAt ?? now),
      wantsLeadership: formData.get("wantsLeadership") === "on",
      ...(primaryRole ? { primaryRole } : {}),
      ...(experienceLevel ? { experienceLevel } : {}),
      ...(remotePreference ? { remotePreference } : {}),
      ...(location ? { location } : {}),
      ...(typeOfRole.length ? { typeOfRole } : {}),
    },
  });
  redirect(`/alerts?token=${encodeURIComponent(token)}&saved=1`);
}
