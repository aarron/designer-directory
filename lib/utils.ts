import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** "Sep 2" — the year only when it isn't this one. For dense table rows. */
export function formatShortDate(date: Date | string) {
  const d = new Date(date);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

// Returns null if valid, or an error string if not.
// Empty / whitespace-only values are considered valid (fields are optional).
export function validateUrl(value: string | null | undefined): string | null {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return `"${trimmed}" must start with https:// or http://`;
    }
    return null;
  } catch {
    return `"${trimmed}" doesn't look like a valid URL — try adding https://`;
  }
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const EXPERIENCE_LEVELS = [
  "Early Career (0-2 years)",
  "Mid Career (3-8 years)",
  "Late Career (9+ years)",
] as const;

export const PRIMARY_ROLES = [
  "UX/UI Design",
  "Product Design",
  "Branding",
  "Design Systems",
  "DesignOps",
  "User Research",
  "Service Design",
  "Motion Design",
  "Illustration",
  "Product Management",
  "Engineering",
  "Marketing",
  "Project/Program Management",
  "Other",
] as const;

export const ROLE_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Advising",
  "Internship",
] as const;

export const COMPANY_SIZES = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
] as const;

export const DESIGN_SKILLS = [
  // Tools
  "Figma",
  "Framer",
  "Sketch",
  "After Effects",
  "Photoshop",
  "Illustrator",
  "InDesign",
  "Premiere Pro",
  "Webflow",
  // Competencies
  "Prototyping",
  "User Research",
  "Usability Testing",
  "Design Systems",
  "Information Architecture",
  "Accessibility / WCAG",
  "Visual Design",
  "Interaction Design",
  "Motion Design",
  "Data Visualization",
  "Content Design",
  "Design Strategy",
  "Illustration",
  "Typography",
  "Brand Design",
  "DesignOps",
  "Industrial Design",
  "Sound Design",
  "Workshop Facilitation",
  "AI Tools",
  // Leadership & adjacent
  "Management",
  "Mentoring",
  "Public Speaking",
  "Product Management",
  "Marketing",
  "Writing / Copywriting",
] as const;

export const INDUSTRIES = [
  "B2B SaaS",
  "Consumer / E-commerce",
  "Fintech",
  "Health & Wellness",
  "Media & Entertainment",
  "Education / EdTech",
  "Gaming",
  "Government / Civic",
  "Non-profit / Social Impact",
  "Agency / Consulting",
  "Travel & Hospitality",
  "Climate / Sustainability",
  "Retail",
  "Transportation / Mobility",
  "Real Estate / PropTech",
  "Sports & Fitness",
] as const;

export const LOCATIONS = [
  "Remote",
  // North America
  "Atlanta, GA",
  "Austin, TX",
  "Boston, MA",
  "Chicago, IL",
  "Denver, CO",
  "Los Angeles, CA",
  "Miami, FL",
  "Minneapolis, MN",
  "New York, NY",
  "Philadelphia, PA",
  "Portland, OR",
  "Raleigh-Durham, NC",
  "San Francisco / Bay Area",
  "Seattle, WA",
  "Washington, DC",
  "Montreal, Canada",
  "Toronto, Canada",
  "Vancouver, Canada",
  // Europe
  "Amsterdam",
  "Barcelona",
  "Berlin",
  "Copenhagen",
  "Dublin",
  "Helsinki",
  "Lisbon",
  "London",
  "Paris",
  "Stockholm",
  "Zurich",
  // Asia-Pacific
  "Bangalore",
  "Hong Kong",
  "Melbourne",
  "Seoul",
  "Singapore",
  "Sydney",
  "Taipei",
  "Tokyo",
  // Latin America
  "Buenos Aires",
  "Mexico City",
  "São Paulo",
  // Middle East & Africa
  "Cape Town",
  "Dubai",
  "Tel Aviv",
  // Other
  "Other",
] as const;

export const LOCATION_ALIASES: Record<string, string[]> = {
  "San Francisco / Bay Area": ["San Francisco", "Bay Area", "Silicon Valley", "Palo Alto", "Mountain View", "Sunnyvale", "San Jose"],
  "New York, NY":             ["New York", "NYC", "New York City", "Manhattan", "Brooklyn"],
  "Los Angeles, CA":          ["Los Angeles", "LA", "West Hollywood", "Santa Monica"],
  "Seattle, WA":              ["Seattle"],
  "Austin, TX":               ["Austin"],
  "Boston, MA":               ["Boston", "Cambridge"],
  "Chicago, IL":              ["Chicago"],
  "Denver, CO":               ["Denver", "Boulder"],
  "Miami, FL":                ["Miami", "Fort Lauderdale"],
  "Washington, DC":           ["Washington", "D.C.", "DC", "Northern Virginia"],
  "Portland, OR":             ["Portland"],
  "Atlanta, GA":              ["Atlanta"],
  "Minneapolis, MN":          ["Minneapolis", "St. Paul", "Twin Cities"],
  "Philadelphia, PA":         ["Philadelphia", "Philly"],
  "Raleigh-Durham, NC":       ["Raleigh", "Durham", "Research Triangle"],
  "Toronto, Canada":          ["Toronto"],
  "Vancouver, Canada":        ["Vancouver"],
  "Montreal, Canada":         ["Montreal"],
  "Bangalore":                ["Bengaluru"],
  "São Paulo":                ["Sao Paulo"],
  "Mexico City":              ["CDMX"],
  "Tel Aviv":                 ["Tel-Aviv"],
  "Remote":                   ["Remote"],
};

export const START_AVAILABILITY = [
  "Available now",
  "2 weeks",
  "1 month",
  "3+ months",
] as const;

export const REMOTE_PREFERENCES = [
  "Remote only",
  "Open to hybrid",
  "Open to in-office",
  "Flexible",
] as const;

export const LANGUAGES = [
  "English", "Spanish", "French", "German", "Portuguese", "Mandarin",
  "Japanese", "Korean", "Arabic", "Hindi", "Italian", "Dutch", "Russian",
  "Swedish", "Polish", "Turkish", "Vietnamese", "Thai", "Indonesian",
  "Greek", "Hebrew", "Danish", "Norwegian", "Finnish", "Czech", "Romanian",
  "Ukrainian", "Catalan", "Tagalog", "Swahili", "Urdu", "Bengali", "Farsi",
] as const;

export const WORK_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  OPEN: { label: "Open to work", color: "green" },
  OPEN_SOON: { label: "Open in 3 months", color: "yellow" },
  NOT_LOOKING: { label: "Not looking", color: "gray" },
};
