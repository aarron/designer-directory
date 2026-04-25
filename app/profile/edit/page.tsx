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
} from "@/lib/utils";
import { CheckCircle, Upload } from "lucide-react";
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
  const [error, setError] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [selectedRoleTypes, setSelectedRoleTypes] = useState<string[]>([]);

  useEffect(() => {
    if (!token) { setNotFound(true); setLoading(false); return; }
    fetch(`/api/profile?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setNotFound(true); } else {
          setDesigner(data);
          setSelectedRoleTypes(data.typeOfRole || []);
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

    let photoUrl = (designer?.photoUrl as string) || null;

    if (photoFile) {
      const uploadForm = new FormData();
      uploadForm.append("file", photoFile);
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
      location: data.get("location"),
      experienceLevel: data.get("experienceLevel"),
      typeOfRole: selectedRoleTypes,
      companySize: data.get("companySize"),
      compensation: data.get("compensation"),
      requiresVisa: data.get("requiresVisa") === "on",
      openToWork: data.get("openToWork"),
      publicProfile: data.get("publicProfile") === "on",
      shareConfidentially: data.get("shareConfidentially") === "on",
      photoUrl,
    };

    try {
      const res = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) { setError("Failed to save. Please try again."); return; }
      setSaved(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch { setError("Network error. Please try again."); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="max-w-2xl mx-auto px-6 py-24 text-center text-brand-gray-400">Loading your profile...</div>;

  if (notFound) return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center">
      <h1 className="font-display text-display-sm font-bold text-brand-black mb-4">Profile not found</h1>
      <p className="text-brand-gray-500 mb-6">This edit link is invalid. Check your email for the correct link, or request a new one below.</p>
      <RequestEditLink />
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
      <h1 className="font-display text-display-sm font-bold text-brand-black mb-2">Edit your profile</h1>
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

        <Input id="location" name="location" label="Location" defaultValue={designer?.location as string} required />
        <Input id="compensation" name="compensation" label="Desired compensation" defaultValue={designer?.compensation as string} />
        <Select id="companySize" name="companySize" label="Preferred company size" placeholder="No preference" options={COMPANY_SIZES.map((s) => ({ value: s, label: `${s} employees` }))} defaultValue={designer?.companySize as string} />

        <hr className="border-brand-gray-100" />

        <Input id="linkedinUrl" name="linkedinUrl" type="url" label="LinkedIn URL" defaultValue={designer?.linkedinUrl as string} />
        <Input id="websiteUrl" name="websiteUrl" type="url" label="Portfolio or website" defaultValue={designer?.websiteUrl as string} />

        <hr className="border-brand-gray-100" />

        <div className="flex flex-col gap-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" name="publicProfile" defaultChecked={designer?.publicProfile as boolean} className="w-4 h-4 rounded border-brand-gray-300 mt-0.5" />
            <span className="text-sm font-medium text-brand-gray-700">Show profile publicly in the directory</span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" name="shareConfidentially" defaultChecked={designer?.shareConfidentially as boolean} className="w-4 h-4 rounded border-brand-gray-300 mt-0.5" />
            <span className="text-sm font-medium text-brand-gray-700">Share my info confidentially with interested employers</span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" name="requiresVisa" defaultChecked={designer?.requiresVisa as boolean} className="w-4 h-4 rounded border-brand-gray-300 mt-0.5" />
            <span className="text-sm font-medium text-brand-gray-700">I require US visa sponsorship</span>
          </label>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded px-4 py-3 text-sm text-red-700">{error}</div>}

        <Button type="submit" size="lg" disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </form>
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
