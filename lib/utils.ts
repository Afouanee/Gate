import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, differenceInYears } from "date-fns";
import { fr, enUS } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null, locale = "fr"): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "d MMMM yyyy", { locale: locale === "fr" ? fr : enUS });
}

export function getAge(birthDate: Date | string | null, deathDate?: Date | string | null): number | null {
  if (!birthDate) return null;
  const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
  const end = deathDate ? (typeof deathDate === "string" ? new Date(deathDate) : deathDate) : new Date();
  return differenceInYears(end, birth);
}

export function getAgeCategory(age: number | null): "baby" | "child" | "adult" | "senior" {
  if (age === null) return "adult";
  if (age < 2) return "baby";
  if (age < 18) return "child";
  if (age < 65) return "adult";
  return "senior";
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
}
