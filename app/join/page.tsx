"use client";

import { useState } from "react";
import Link from "next/link";
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
import { ArrowRight, CheckCircle, Upload, Plus, X } from "lucide-react";
import Image from "next/image";

const workStatusOptions = [
  { value: "OPEN", label: "Open to work — actively looking" },
  { value: "OPEN_SOON", label: "Open in the next 3 months" },
  { value: "NOT_LOOKING", label: "Not looking, but open to the right opportunity" },
];

export default function JoinPage() {
  const [submitted, setSubmitted] = useState(false);
  const [newDesignerId, setNewDesignerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [selectedRoleTypes, setSelectedRoleTypes] = useState<string[]>([]);
  const [selectedCompanySizes, setSelectedCompanySizes] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [locationOption, setLocationOption] = useState("");
  const [locationCustom, setLocationCustom] = useState("");
  const [stealthMode, setStealthMode] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [projects, setProjects] = useState<Array<{ url: string; description: string }>>([]);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setError("Photo must be under 4MB.");
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function toggleRoleType(type: string) {
    setSelectedRoleTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
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
      setLoading(false);
      return;
    }

    let photoUrl: string | null = null;

    if (photoFile) {
      const uploadForm = new FormData();
      uploadForm.append("file", photoFile);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadForm });
      if (!uploadRes.ok) {
        setError("Photo upload failed. Please try again.");
        setLoading(false);
        return;
      }
      const uploadJson = await uploadRes.json();
      photoUrl = uploadJson.url;
    }

    const body = {
      firstName: data.get("firstName"),
      lastName: data.get("lastName"),
      email: data.get("email"),
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
      languagesSpoken: selectedLanguages,
      projects,
      funFacts: data.get("funFacts") || undefined,
      mostProudOf: data.get("mostProudOf") || undefined,
      pets: data.get("pets") || undefined,
      recentlyRead: data.get("recentlyRead") || undefined,
      instruments: data.get("instruments") || undefined,
      hobbies: data.get("hobbies") || undefined,
      startAvailability: data.get("startAvailability") || undefined,
      remotePreference: data.get("remotePreference") || undefined,
      compensation: data.get("compensation"),
      requiresVisa: data.get("requiresVisa") === "on",
      openToWork: data.get("openToWork"),
      publicProfile: !stealthMode,
      shareConfidentially: stealthMode,
      photoUrl,
    };

    try {
      const res = await fetch("/api/designers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Something went wrong. Please try again.");
        return;
      }
      setNewDesignerId(json.id);
      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="font-display text-display-sm font-bold text-brand-black mb-4">
          You&apos;re in the directory!
        </h1>
        <p className="text-brand-gray-500 leading-relaxed mb-6">
          Your profile is live. We&apos;ve sent a magic link to your email so you can edit your profile anytime —
          no account needed. Employers browsing the directory can now find you.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          {newDesignerId && (
            <Link href={`/talent/${newDesignerId}`}>
              <Button>View my profile</Button>
            </Link>
          )}
          <Link href="/talent">
            <Button variant="secondary">Browse the directory</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-brand-black text-white py-20 px-6">
        <div className="max-w-6xl mx-auto max-w-2xl">
          <p className="text-brand-red font-medium text-sm tracking-wide uppercase mb-4">Join the directory</p>
          <h1 className="font-display text-display-md font-bold text-white mb-4 text-balance">
            Put your profile in front of great companies.
          </h1>
          <p className="text-brand-gray-300 text-lg leading-relaxed">
            Free to join. Your profile is shared with employers actively hiring.
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="font-display text-display-sm font-bold text-brand-black mb-2">
                Your profile
              </h2>
              <p className="text-brand-gray-500 text-sm mb-8">
                Takes about 5 minutes. You can edit it anytime with a magic link sent to your email.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* Photo */}
                <div>
                  <label className="text-sm font-medium text-brand-gray-700 mb-2 block">
                    Profile photo
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-brand-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {photoPreview ? (
                        <Image src={photoPreview} alt="Preview" width={64} height={64} className="w-full h-full object-cover" />
                      ) : (
                        <Upload className="w-6 h-6 text-brand-gray-400" />
                      )}
                    </div>
                    <div>
                      <label className="cursor-pointer inline-flex items-center gap-2 text-sm font-medium text-brand-black border border-brand-gray-200 rounded px-3 py-2 hover:border-brand-black transition-colors">
                        <Upload className="w-4 h-4" />
                        {photoPreview ? "Change photo" : "Upload photo"}
                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} className="hidden" />
                      </label>
                      <p className="text-xs text-brand-gray-400 mt-1.5">JPG, PNG or WebP · Max 4MB · Square crop recommended</p>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Input id="firstName" name="firstName" label="First name" required />
                  <Input id="lastName" name="lastName" label="Last name" required />
                </div>
                <Input id="email" name="email" type="email" label="Email address" hint="Used to send your edit link — never shown publicly." required />
                <Input id="title" name="title" label="Current or most recent title" placeholder="e.g. Senior Product Designer" />
                <Input id="company" name="company" label="Current or most recent company" placeholder="e.g. Figma" />
                <Textarea
                  id="bio"
                  name="bio"
                  label="Short bio"
                  placeholder="Tell employers a bit about you, your work, and what you're looking for..."
                  rows={5}
                  hint="2-4 sentences is plenty."
                />

                <hr className="border-brand-gray-100" />

                <Select
                  id="openToWork"
                  name="openToWork"
                  label="Availability"
                  placeholder="Select your status"
                  options={workStatusOptions}
                  required
                />
                <Select
                  id="primaryRole"
                  name="primaryRole"
                  label="Primary role"
                  placeholder="Select your main role"
                  options={PRIMARY_ROLES.map((r) => ({ value: r, label: r }))}
                  required
                />
                <Select
                  id="experienceLevel"
                  name="experienceLevel"
                  label="Experience level"
                  placeholder="Select your level"
                  options={EXPERIENCE_LEVELS.map((l) => ({ value: l, label: l }))}
                  required
                />

                <div>
                  <label className="text-sm font-medium text-brand-gray-700 mb-2 block">
                    Types of work you&apos;re open to
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ROLE_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleRoleType(type)}
                        className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                          selectedRoleTypes.includes(type)
                            ? "bg-brand-black text-white border-brand-black"
                            : "bg-white text-brand-gray-600 border-brand-gray-200 hover:border-brand-black"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-brand-gray-700 mb-2 block">Location <span className="text-brand-red">*</span></label>
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
                <Input id="compensation" name="compensation" label="Desired compensation (USD)" placeholder="e.g. $130,000–$170,000" hint="Optional — but helps employers know if you&apos;re in range." />
                <div>
                  <label className="text-sm font-medium text-brand-gray-700 mb-2 block">
                    Preferred company size
                  </label>
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
                  options={START_AVAILABILITY.map((s) => ({ value: s, label: s }))} />

                <Select id="remotePreference" name="remotePreference" label="Remote preference"
                  placeholder="Select preference"
                  options={REMOTE_PREFERENCES.map((r) => ({ value: r, label: r }))} />

                <hr className="border-brand-gray-100" />

                <Input id="linkedinUrl" name="linkedinUrl" type="url" label="LinkedIn URL" placeholder="https://linkedin.com/in/..." />
                <Input id="websiteUrl" name="websiteUrl" type="url" label="Portfolio or website" placeholder="https://..." />

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
                    <Textarea id="funFacts" name="funFacts" label="Fun facts about me" placeholder="e.g. I've visited 30 countries, I make my own hot sauce..." rows={3} />
                    <Input id="mostProudOf" name="mostProudOf" label="Work I'm most proud of" placeholder="e.g. Redesigned checkout flow that increased conversion 40%" />
                    <Input id="pets" name="pets" label="Pets" placeholder="e.g. Two cats named Figma and Framer" />
                    <Input id="recentlyRead" name="recentlyRead" label="Recently read" placeholder="e.g. The Design of Everyday Things" />
                    <Input id="instruments" name="instruments" label="Instruments I play" placeholder="e.g. Guitar, piano" />
                    <Input id="hobbies" name="hobbies" label="Hobbies" placeholder="e.g. Rock climbing, ceramics, sourdough" />
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
                    <input type="checkbox" name="requiresVisa" className="w-4 h-4 rounded border-brand-gray-300 mt-0.5" />
                    <span className="text-sm font-medium text-brand-gray-700">I require US visa sponsorship</span>
                  </label>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded px-4 py-3 text-sm text-red-700 space-y-1">
                    {error.split("\n").map((line, i) => <p key={i}>{line}</p>)}
                  </div>
                )}

                <Button type="submit" size="lg" disabled={loading} className="gap-2">
                  {loading ? "Saving your profile..." : "Add me to the directory"}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </Button>
              </form>
            </div>

            {/* Sidebar */}
            <div>
              <div className="bg-brand-gray-50 border border-brand-gray-100 rounded-xl p-6 sticky top-24">
                <p className="font-semibold text-brand-black mb-4">Free and easy</p>
                <ul className="flex flex-col gap-3 text-sm text-brand-gray-600">
                  {[
                    "Always free for talent",
                    "Edit anytime via magic link",
                    "Visible to employers on Design Better Careers",
                    "Reach companies through our curated matching",
                    "Mark yourself as open, open soon, or not looking",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-brand-red flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
