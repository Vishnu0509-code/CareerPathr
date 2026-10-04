import { cva } from "class-variance-authority";

export const categoryColors = {
  "Software Development": "bg-blue-500/10 text-blue-700 border-blue-200",
  "Cybersecurity": "bg-red-500/10 text-red-700 border-red-200",
  "Data Science": "bg-purple-500/10 text-purple-700 border-purple-200",
  "Artificial Intelligence": "bg-teal-500/10 text-teal-700 border-teal-200",
  "Cloud Computing": "bg-sky-500/10 text-sky-700 border-sky-200",
  "UI/UX Design": "bg-pink-500/10 text-pink-700 border-pink-200",
  "Entrepreneurship": "bg-amber-500/10 text-amber-700 border-amber-200",
} as Record<string, string>;

export const categoryBgColors = {
  "Software Development": "bg-blue-500",
  "Cybersecurity": "bg-red-500",
  "Data Science": "bg-purple-500",
  "Artificial Intelligence": "bg-teal-500",
  "Cloud Computing": "bg-sky-500",
  "UI/UX Design": "bg-pink-500",
  "Entrepreneurship": "bg-amber-500",
} as Record<string, string>;

export function getCategoryColor(category: string) {
  return categoryColors[category] || "bg-slate-500/10 text-slate-700 border-slate-200";
}

export function getCategoryBgColor(category: string) {
  return categoryBgColors[category] || "bg-slate-500";
}
