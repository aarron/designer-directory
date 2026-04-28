"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import {
  PRIMARY_ROLES,
  EXPERIENCE_LEVELS,
  COMPANY_SIZES,
  ROLE_TYPES,
  DESIGN_SKILLS,
  INDUSTRIES,
  START_AVAILABILITY,
  REMOTE_PREFERENCES,
  LOCATIONS,
  LANGUAGES,
  validateUrl,
} from "@/lib/utils";
import { CheckCircle, Upload, Trash2, Plus, X } from "lucide-react";
import Image from "next/image";
import { Suspense } from "react";

const workStatusOptions = [
  { value: "OPEN", label: "Open to work — actively looking" },
  { value: "OPEN_SOON", label: "Open in the next 3 months" },
  { value: "NOT_LOOKING", label: "Not looking, but open to the right opportunity" },
];

function EditProfileForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [designer, setDesigner] = useState<Record<string, unknown> | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [selectedRoleTypes, setSelectedRoleTypes] = useState<string[]>([]);
  const [selectedCompanySizes, setSelectedCompanySizes] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [locationOption, setLocationOption] = useState("");
  const [locationCustom, setLocationCustom] = useState("");
  const [stealthMode, setStealthMode] = useState(false);
  const [projects, setProjects] = useState<Array<{ url: string; description: string }>>([]);

  useEffect(() => {
    if (!token) { setNotFound(true); setLoading(false); return; }
    fetch(`/api/profile?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setNotFound(true); } else {
          setDesigner(data);
          setSelectedRoleTypes(data.typeOfRole || []);
          setSelectedCompanySizes(data.companySize || []);
          setSelectedSkills(data.skills || []);
          setSelectedIndustries(data.industries || []);
          setSelectedLanguages(data.languagesSpoken || []);
          const loc = data.location as string || "";
          const knownLoc = (LOCATIONS as readonly string[]).includes(loc);
          setLocationOption(knownLoc ? loc : loc ? "Other" : "");
          setLocationCustom(knownLoc ? "" : loc);
          setStealthMode(!(data.publicProfile as boolean) && (data.shareConfidentially as boolean));
          if (Array.isArray(data.projects)) setProjects(data.projects as Array<{ url: string; description: string }>);
        }
        setLoading(false);
      });
  }, [token]);

  function toggleRoleType(type: string) {
    setSelectedRoleTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { setError("Photo must be under 4MB."); return; }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = e.currentTarget;
    const data = new FormData(form);

    // URL validation
    const urlErrors: string[] = [];
    const linkedinErr = validateUrl(data.get("linkedinUrl") as string);
    const websiteErr  = validateUrl(data.get("websiteUrl") as string);
    if (linkedinErr) urlErrors.push(`LinkedIn URL — ${linkedinErr}`);
    if (websiteErr)  urlErrors.push(`Portfolio URL — ${websiteErr}`);
    projects.forEach((p, i) => {
      const err = validateUrl(p.url);
      if (err) urlErrors.push(`Project ${i + 1} URL — ${err}`);
    });
    if (urlErrors.length > 0) {
      setError(urlErrors.join("\n"));
      setSaving(false);
      return;
    }

    let photoUrl = (designer?.photoUrl as string) || null;

    if (photoFile) {
      const uploadForm = new FormData();
      uploadForm.append("file", photoFile);
      if (token) uploadForm.append("token", token);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadForm });
      if (!uploadRes.ok) { setError("Photo upload failed."); setSaving(false); return; }
      const uploadJson = await uploadRes.json();
      photoUrl = uploadJson.url;
    }

    const body = {
      token,
      firstName: data.get("firstName"),
      lastName: data.get("lastName"),
      bio: data.get("bio"),
      title: data.get("title"),
      company: data.get("company"),
      linkedinUrl: data.get("linkedinUrl"),
      websiteUrl: data.get("websiteUrl"),
      primaryRole: data.get("primaryRole"),
      location: locationOption === "Other" ? locationCustom : locationOption,
      experienceLevel: data.get("experienceLevel"),
      typeOfRole: selectedRoleTypes,
      companySize: selectedCompanySizes,
      skills: selectedSkills,
      industries: selectedIndustries,
      startAvailability: data.get("startAvailability") || undefined,
      remotePreference: data.get("remotePreference") || undefined,
      compensation: data.get("compensation"),
      requiresVisa: data.get("requiresVisa") === "on",
      openToWork: data.get("openToWork"),
      publicProfile: !stealthMode,
      shareConfidentially: stealthMode,
      photoUrl,
      funFacts: data.get("funFacts") || undefined,
      mostProudOf: data.get("mostProudOf") || undefined,
      pets: data.get("pets") || undefined,
      recentlyRead: data.get("recentlyRead") || undefined,
      instruments: data.get("instruments") || undefined,
      hobbies: data.get("hobbies") || undefined,
      languagesSpoken: selectedLanguages,
      projects,
    };

    try {
      const res = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) { setError("Failed to save. Please try again."); return; }
      setSaved(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch { setError("Network error. Please try again."); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/profile?token=${token}`, { method: "DELETE" });
      if (!res.ok) { setError("Failed to delete. Please try again."); return; }
      setDeleted(true);
    } catch { setError("Network error. Please try again."); }
    finally { setDeleting(false); }
  }

  if (loading) return <div className="max-w-2xl mx-auto px-6 py-24 text-center text-brand-gray-400">Loading your profile...</div>;

  if (notFound) return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center">
      <h1 className="font-display text-display-sm font-bold text-brand-black mb-4">Profile not found</h1>
      <p className="text-brand-gray-500 mb-6">This edit link is invalid. Check your email for the correct link, or request a new one below.</p>
      <RequestEditLink />
    </div>
  );

  if (deleted) return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center">
      <h1 className="font-display text-display-sm font-bold text-brand-black mb-4">Profile deleted</h1>
      <p className="text-brand-gray-500 mb-6">Your profile has been removed from the directory.</p>
      <a href="/join"><Button variant="secondary">Re-join the directory</Button></a>
    </div>
  );

  if (saved) return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h1 className="font-display text-display-sm font-bold text-brand-black mb-4">Profile updated!</h1>
      <p className="text-brand-gray-500 mb-6">Your changes are live.</p>
      <a href={`/talent/${(designer as Record<string, unknown>)?.id}`}>
        <Button>View your profile</Button>
      </a>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
        <h1 className="font-display text-display-sm font-bold text-brand-black">Edit your profile</h1>
        {(designer?.profileViews as number) > 0 && (
          <div className="inline-flex items-center gap-2 bg-brand-gray-50 border border-brand-gray-100 rounded-full px-4 py-1.5 text-sm text-brand-gray-600">
            <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
            Viewed <span className="font-semibold text-brand-black">{(designer?.profileViews as number).toLocaleString()}</span> time{(designer?.profileViews as number) !== 1 ? "s" : ""}
          </div>
        )}
      </div>
      <p className="text-brand-gray-500 text-sm mb-8">Changes save immediately and are reflected live.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Photo */}
        <div>
          <label className="text-sm font-medium text-brand-gray-700 mb-2 block">Profile photo</label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              {(photoPreview || (designer?.photoUrl as string)) ? (
                <Image src={photoPreview || (designer?.photoUrl as string)} alt="Preview" width={64} height={64} className="w-full h-full object-cover" />
              ) : (
                <Upload className="w-6 h-6 text-brand-gray-400" />
              )}
            </div>
            <label className="cursor-pointer inline-flex items-center gap-2 text-sm font-medium text-brand-black border border-brand-gray-200 rounded px-3 py-2 hover:border-brand-black transition-colors">
              <Upload className="w-4 h-4" />
              {photoPreview || designer?.photoUrl ? "Change photo" : "Upload photo"}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} className="hidden" />
            </label>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Input id="firstName" name="firstName" label="First name" defaultValue={designer?.firstName as string} required />
          <Input id="lastName" name="lastName" label="Last name" defaultValue={designer?.lastName as string} required />
        </div>
        <Input id="title" name="title" label="Current or most recent title" defaultValue={designer?.title as string} />
        <Input id="company" name="company" label="Company" defaultValue={designer?.company as string} />
        <Textarea id="bio" name="bio" label="Short bio" defaultValue={designer?.bio as string} rows={5} />

        <hr className="border-brand-gray-100" />

        <Select id="openToWork" name="openToWork" label="Availability" options={workStatusOptions} defaultValue={designer?.openToWork as string} required />
        <Select id="primaryRole" name="primaryRole" label="Primary role" placeholder="Select role" options={PRIMARY_ROLES.map((r) => ({ value: r, label: r }))} defaultValue={designer?.primaryRole as string} required />
        <Select id="experienceLevel" name="experienceLevel" label="Experience level" placeholder="Select level" options={EXPERIENCE_LEVELS.map((l) => ({ value: l, label: l }))} defaultValue={designer?.experienceLevel as string} required />

        <div>
          <label className="text-sm font-medium text-brand-gray-700 mb-2 block">Types of work you&apos;re open to</label>
          <div className="flex flex-wrap gap-2">
            {ROLE_TYPES.map((type) => (
              <button key={type} type="button" onClick={() => toggleRoleType(type)}
                className={`px-3 py-1.5 text-sm rounded border transition-colors ${selectedRoleTypes.includes(type) ? "bg-brand-black text-white border-brand-black" : "bg-white text-brand-gray-600 border-brand-gray-200 hover:border-brand-black"}`}>
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-brand-gray-700 mb-2 block">Location</label>
          <select
            value={locationOption}
            onChange={(e) => setLocationOption(e.target.value)}
            required
            className="w-full h-10 pl-3 pr-8 text-sm border border-brand-gray-200 rounded bg-white text-brand-black focus:border-brand-black focus:outline-none appearance-none cursor-pointer"
          >
            <option value="">Select your location</option>
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          {locationOption === "Other" && (
            <input
              type="text"
              value={locationCustom}
              onChange={(e) => setLocationCustom(e.target.value)}
              placeholder="Enter your city or region"
              required
              className="mt-2 w-full h-10 px-3 text-sm border border-brand-gray-200 rounded focus:border-brand-black focus:outline-none"
            />
          )}
        </div>
        <Input id="compensation" name="compensation" label="Desired compensation" defaultValue={designer?.compensation as string} />
        <div>
          <label className="text-sm font-medium text-brand-gray-700 mb-2 block">Preferred company size</label>
          <div className="flex flex-wrap gap-2">
            {COMPANY_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedCompanySizes((prev) =>
                  prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
                )}
                className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                  selectedCompanySizes.includes(size)
                    ? "bg-brand-black text-white border-brand-black"
                    : "bg-white text-brand-gray-600 border-brand-gray-200 hover:border-brand-black"
                }`}
              >
                {size} employees
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-brand-gray-700 mb-2 block">Skills &amp; tools</label>
          <div className="flex flex-wrap gap-2">
            {DESIGN_SKILLS.map((skill) => (
              <button key={skill} type="button"
                onClick={() => setSelectedSkills((prev) => prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill])}
                className={`px-3 py-1.5 text-sm rounded border transition-colors ${selectedSkills.includes(skill) ? "bg-brand-black text-white border-brand-black" : "bg-white text-brand-gray-600 border-brand-gray-200 hover:border-brand-black"}`}>
                {skill}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-brand-gray-700 mb-2 block">Industries</label>
          <div className="flex flex-wrap gap-2">
            {INDUSTRIES.map((industry) => (
              <button key={industry} type="button"
                onClick={() => setSelectedIndustries((prev) => prev.includes(industry) ? prev.filter((i) => i !== industry) : [...prev, industry])}
                className={`px-3 py-1.5 text-sm rounded border transition-colors ${selectedIndustries.includes(industry) ? "bg-brand-black text-white border-brand-black" : "bg-white text-brand-gray-600 border-brand-gray-200 hover:border-brand-black"}`}>
                {industry}
              </button>
            ))}
          </div>
        </div>

        <Select id="startAvailability" name="startAvailability" label="Available to start"
          placeholder="Select availability"
          options={START_AVAILABILITY.map((s) => ({ value: s, label: s }))}
          defaultValue={designer?.startAvailability as string} />

        <Select id="remotePreference" name="remotePreference" label="Remote preference"
          placeholder="Select preference"
          options={REMOTE_PREFERENCES.map((r) => ({ value: r, label: r }))}
          defaultValue={designer?.remotePreference as string} />

        <hr className="border-brand-gray-100" />

        <Input id="linkedinUrl" name="linkedinUrl" type="url" label="LinkedIn URL" defaultValue={designer?.linkedinUrl as string} />
        <Input id="websiteUrl" name="websiteUrl" type="url" label="Portfolio or website" defaultValue={designer?.websiteUrl as string} />

        <hr className="border-brand-gray-100" />

        {/* Featured work */}
        <div>
          <h3 className="font-display font-bold text-brand-black mb-1">Featured work</h3>
          <p className="text-sm text-brand-gray-500 mb-5">
            Add up to 5 projects — a URL and a one-sentence description of your contribution.
          </p>
          <div className="flex flex-col gap-3">
            {projects.map((project, i) => (
              <div key={i} className="flex flex-col gap-2 bg-brand-gray-50 border border-brand-gray-100 rounded-lg p-4 relative">
                <button
                  type="button"
                  onClick={() => setProjects((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute top-3 right-3 text-brand-gray-400 hover:text-brand-black transition-colors"
                  aria-label="Remove project"
                >
                  <X className="w-4 h-4" />
                </button>
                <input
                  type="url"
                  value={project.url}
                  onChange={(e) => setProjects((prev) => prev.map((p, idx) => idx === i ? { ...p, url: e.target.value } : p))}
                  placeholder="https://example.com/project"
                  className="h-9 px-3 text-sm border border-brand-gray-200 rounded bg-white focus:border-brand-black focus:outline-none w-full"
                />
                <input
                  type="text"
                  value={project.description}
                  onChange={(e) => setProjects((prev) => prev.map((p, idx) => idx === i ? { ...p, description: e.target.value } : p))}
                  placeholder="One sentence about your contribution or what you built..."
                  maxLength={200}
                  className="h-9 px-3 text-sm border border-brand-gray-200 rounded bg-white focus:border-brand-black focus:outline-none w-full"
                />
              </div>
            ))}
            {projects.length < 5 && (
              <button
                type="button"
                onClick={() => setProjects((prev) => [...prev, { url: "", description: "" }])}
                className="flex items-center gap-2 text-sm text-brand-gray-500 hover:text-brand-black transition-colors border border-dashed border-brand-gray-200 hover:border-brand-gray-400 rounded-lg px-4 py-3"
              >
                <Plus className="w-4 h-4" /> Add a project
              </button>
            )}
          </div>
        </div>

        <hr className="border-brand-gray-100" />

        {/* Beyond the work */}
        <div>
          <h3 className="font-display font-bold text-brand-black mb-1">Beyond the work</h3>
          <p className="text-sm text-brand-gray-500 mb-5">All optional. Help employers get to know the person behind the portfolio.</p>
          <div className="flex flex-col gap-5">
            <Textarea id="funFacts" name="funFacts" label="Fun facts about me" placeholder="e.g. I've visited 30 countries, I make my own hot sauce..." rows={3} defaultValue={designer?.funFacts as string} />
            <Input id="mostProudOf" name="mostProudOf" label="Work I'm most proud of" placeholder="e.g. Redesigned checkout flow that increased conversion 40%" defaultValue={designer?.mostProudOf as string} />
            <Input id="pets" name="pets" label="Pets" placeholder="e.g. Two cats named Figma and Framer" defaultValue={designer?.pets as string} />
            <Input id="recentlyRead" name="recentlyRead" label="Recently read" placeholder="e.g. The Design of Everyday Things" defaultValue={designer?.recentlyRead as string} />
            <Input id="instruments" name="instruments" label="Instruments I play" placeholder="e.g. Guitar, piano" defaultValue={designer?.instruments as string} />
            <Input id="hobbies" name="hobbies" label="Hobbies" placeholder="e.g. Rock climbing, ceramics, sourdough" defaultValue={designer?.hobbies as string} />
            <div>
              <label className="text-sm font-medium text-brand-gray-700 mb-2 block">Languages spoken</label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <button key={lang} type="button"
                    onClick={() => setSelectedLanguages((prev) => prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang])}
                    className={`px-3 py-1.5 text-sm rounded border transition-colors ${selectedLanguages.includes(lang) ? "bg-brand-black text-white border-brand-black" : "bg-white text-brand-gray-600 border-brand-gray-200 hover:border-brand-black"}`}>
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <hr className="border-brand-gray-100" />

        <div className="flex flex-col gap-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={stealthMode}
              onChange={(e) => setStealthMode(e.target.checked)}
              className="w-4 h-4 rounded border-brand-gray-300 mt-0.5"
            />
            <div>
              <span className="text-sm font-medium text-brand-gray-700">Stealth mode</span>
              <p className="text-xs text-brand-gray-400 mt-0.5">
                Keep your profile hidden from the public directory. We&apos;ll still share it directly with employers we curate for you.
              </p>
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" name="requiresVisa" defaultChecked={designer?.requiresVisa as boolean} className="w-4 h-4 rounded border-brand-gray-300 mt-0.5" />
            <span className="text-sm font-medium text-brand-gray-700">I require US visa sponsorship</span>
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded px-4 py-3 text-sm text-red-700 space-y-1">
            {error.split("\n").map((line, i) => <p key={i}>{line}</p>)}
          </div>
        )}

        <Button type="submit" size="lg" disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </form>

      <div className="mt-16 pt-8 border-t border-brand-gray-100">
        <h2 className="font-semibold text-brand-black mb-1">Remove your profile</h2>
        <p className="text-sm text-brand-gray-500 mb-4">
          Permanently delete your profile from the directory. This cannot be undone.
        </p>
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center gap-2 text-sm text-brand-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete my profile
          </button>
        ) : (
          <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex flex-col gap-3">
            <p className="text-sm font-medium text-red-800">Are you sure? This will permanently remove your profile.</p>
            <div className="flex gap-3">
              <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Yes, delete my profile"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RequestEditLink() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    await fetch("/api/magic-link", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    setSent(true);
    setSending(false);
  }

  if (sent) return <p className="text-sm text-brand-gray-500">If an account exists for that email, we sent an edit link. Check your inbox.</p>;

  return (
    <form onSubmit={handleRequest} className="flex gap-2 max-w-sm mx-auto">
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required
        className="flex-1 h-10 px-3 text-sm border border-brand-gray-200 rounded focus:border-brand-black focus:outline-none" />
      <Button type="submit" size="sm" disabled={sending}>{sending ? "Sending..." : "Send link"}</Button>
    </form>
  );
}

export default function EditProfilePage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-6 py-24 text-center text-brand-gray-400">Loading...</div>}>
      <EditProfileForm />
    </Suspense>
  );
}
