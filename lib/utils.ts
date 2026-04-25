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

export const WORK_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  OPEN: { label: "Open to work", color: "green" },
  OPEN_SOON: { label: "Open in 3 months", color: "yellow" },
  NOT_LOOKING: { label: "Not looking", color: "gray" },
};
