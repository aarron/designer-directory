"use client";

import { useState } from "react";
import { saveAlertPreferences } from "./actions";
import { PRIMARY_ROLES, EXPERIENCE_LEVELS, ROLE_TYPES, REMOTE_PREFERENCES, LOCATIONS } from "@/lib/utils";

export interface AlertsFormDesigner {
  firstName: string;
  primaryRole: string;
  experienceLevel: string;
  location: string;
  remotePreference: string | null;
  typeOfRole: string[];
  openToWork: string;
  alertFrequency: string;
  wantsLeadership: boolean;
}

const LABEL = "font-mono text-[11px] font-medium uppercase tracking-[0.12em]";
const INPUT = "h-10 px-3 text-[14px] w-full focus:outline-none";
const INPUT_STYLE = { border: "1px solid var(--input-border)", background: "var(--surface-1)", color: "var(--text-1)" };

function Choice({ name, value, label, hint, defaultChecked }: {
  name: string; value: string; label: string; hint?: string; defaultChecked?: boolean;
}) {
  return (
    <label
      className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors duration-[120ms] has-[:checked]:bg-[var(--surface-2)]"
      style={{ border: "1px solid var(--input-border)", background: "var(--surface-1)" }}
    >
      <input type="radio" name={name} value={value} defaultChecked={defaultChecked} className="mt-1 accent-[#FF4725]" />
      <span>
        <span className="block text-[15px] font-semibold" style={{ color: "var(--text-1)" }}>{label}</span>
        {hint && <span className="block text-[13px] mt-0.5" style={{ color: "var(--text-3)" }}>{hint}</span>}
      </span>
    </label>
  );
}

/**
 * Older profiles carry values the current option lists no longer include
 * ("Design Leadership", "Chief of Staff"). A <select> whose value matches no
 * option silently falls back to the first one, and saving would then rewrite
 * the designer's role behind their back — so the stored value is always an
 * option, marked as current.
 */
function withCurrent(options: readonly string[], current: string | null | undefined): Array<{ value: string; label: string }> {
  const list = options.map((o) => ({ value: o, label: o }));
  if (current && !options.includes(current)) list.unshift({ value: current, label: `${current} (current)` });
  return list;
}

function Section({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <section className="pt-8 mt-8" style={{ borderTop: "1px solid var(--divider)" }}>
      <p className={LABEL} style={{ color: "#FF4725" }}>{String(step).padStart(2, "0")}</p>
      <h2 className="font-display font-bold text-[22px] leading-tight mt-1 mb-5" style={{ color: "var(--text-1)" }}>{title}</h2>
      {children}
    </section>
  );
}

export function AlertsForm({ designer, token, initialStatus }: {
  designer: AlertsFormDesigner;
  token: string;
  /** Pre-selects a status when the email link carried one (the "landed somewhere" link). */
  initialStatus?: string;
}) {
  const startStatus = initialStatus ?? (designer.openToWork === "NOT_LOOKING" ? "OPEN" : designer.openToWork);
  const [status, setStatus] = useState(startStatus);
  const looking = status !== "NOT_LOOKING";
  const defaultFrequency = designer.alertFrequency === "NONE" ? "BIWEEKLY" : designer.alertFrequency;

  return (
    <form action={saveAlertPreferences} onChange={(e) => {
      const t = e.target as HTMLInputElement;
      if (t.name === "status") setStatus(t.value);
    }}>
      <input type="hidden" name="token" value={token} />

      <Section step={1} title="Are you still looking?">
        <div className="flex flex-col gap-2">
          <Choice name="status" value="OPEN" label="Yes, actively" hint="Your profile stays visible to employers and you get matched roles." defaultChecked={startStatus === "OPEN"} />
          <Choice name="status" value="OPEN_SOON" label="Open to the right thing" hint="Not in a hurry, but show me what fits." defaultChecked={startStatus === "OPEN_SOON"} />
          <Choice name="status" value="NOT_LOOKING" label="No, I'm set" hint="We pause your profile and stop emailing. Congratulations." defaultChecked={startStatus === "NOT_LOOKING"} />
        </div>
      </Section>

      {looking && (
        <>
          <Section step={2} title="How often do you want new roles?">
            <div className="flex flex-col gap-2">
              <Choice name="frequency" value="WEEKLY" label="Weekly" hint="Tuesdays. Only roles that clear the bar; a quiet week sends nothing." defaultChecked={defaultFrequency === "WEEKLY"} />
              <Choice name="frequency" value="BIWEEKLY" label="Every two weeks" defaultChecked={defaultFrequency === "BIWEEKLY"} />
              <Choice name="frequency" value="MONTHLY" label="Monthly" defaultChecked={defaultFrequency === "MONTHLY"} />
              <Choice name="frequency" value="NONE" label="Don't email me roles" hint="Keep my profile visible, skip the alerts." />
            </div>
          </Section>

          <Section step={3} title="Confirm what we match on">
            <p className="text-[14px] mb-5 -mt-2" style={{ color: "var(--text-2)" }}>
              Prefilled from your profile. Change anything that's out of date.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={LABEL} style={{ color: "var(--text-3)" }}>Primary role</label>
                <select name="primaryRole" defaultValue={designer.primaryRole} className={INPUT} style={INPUT_STYLE}>
                  {withCurrent(PRIMARY_ROLES, designer.primaryRole).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={LABEL} style={{ color: "var(--text-3)" }}>Experience</label>
                <select name="experienceLevel" defaultValue={designer.experienceLevel} className={INPUT} style={INPUT_STYLE}>
                  {withCurrent(EXPERIENCE_LEVELS, designer.experienceLevel).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={LABEL} style={{ color: "var(--text-3)" }}>Location</label>
                <input name="location" list="alert-locations" defaultValue={designer.location} className={INPUT} style={INPUT_STYLE} />
                <datalist id="alert-locations">{LOCATIONS.map((l) => <option key={l} value={l} />)}</datalist>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={LABEL} style={{ color: "var(--text-3)" }}>Remote</label>
                <select name="remotePreference" defaultValue={designer.remotePreference ?? ""} className={INPUT} style={INPUT_STYLE}>
                  <option value="">No preference</option>
                  {withCurrent(REMOTE_PREFERENCES, designer.remotePreference).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-1.5">
              <span className={LABEL} style={{ color: "var(--text-3)" }}>Type of role</span>
              <div className="flex flex-wrap gap-2">
                {ROLE_TYPES.map((t) => (
                  <label key={t} className="inline-flex items-center gap-2 px-3 h-9 text-[13px] cursor-pointer has-[:checked]:bg-[var(--surface-2)]" style={INPUT_STYLE}>
                    <input type="checkbox" name="typeOfRole" value={t} defaultChecked={designer.typeOfRole.includes(t)} className="accent-[#FF4725]" />
                    {t}
                  </label>
                ))}
              </div>
            </div>

            <label className="mt-5 flex items-start gap-3 px-4 py-3 cursor-pointer has-[:checked]:bg-[var(--surface-2)]" style={INPUT_STYLE}>
              <input type="checkbox" name="wantsLeadership" defaultChecked={designer.wantsLeadership} className="mt-1 accent-[#FF4725]" />
              <span>
                <span className="block text-[15px] font-semibold" style={{ color: "var(--text-1)" }}>Include leadership roles</span>
                <span className="block text-[13px] mt-0.5" style={{ color: "var(--text-3)" }}>Head of, Director, VP and design manager roles. The board has 150+ open.</span>
              </span>
            </label>
          </Section>
        </>
      )}

      <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-4">
        <button
          type="submit"
          className="inline-flex items-center justify-center font-mono text-[11px] font-normal uppercase tracking-[0.12em] px-6 py-3.5 rounded-md transition-colors duration-[120ms]"
          style={{ background: "#0A0A0A", color: "#F5F2EC" }}
        >
          {looking ? "Save my preferences" : "Pause my profile"}
        </button>
        <span className="text-[13px]" style={{ color: "var(--text-3)" }}>
          {looking ? "Saving also confirms your profile is current." : "You can come back any time from a past email."}
        </span>
      </div>
    </form>
  );
}
