import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "completed": return "text-emerald-400";
    case "running": return "text-blue-400";
    case "pending": return "text-amber-400";
    case "failed": return "text-red-400";
    case "awaiting_approval": return "text-purple-400";
    default: return "text-slate-400";
  }
}

export function getStatusBg(status: string): string {
  switch (status) {
    case "completed": return "bg-emerald-500/10 border-emerald-500/20";
    case "running": return "bg-blue-500/10 border-blue-500/20";
    case "pending": return "bg-amber-500/10 border-amber-500/20";
    case "failed": return "bg-red-500/10 border-red-500/20";
    case "awaiting_approval": return "bg-purple-500/10 border-purple-500/20";
    default: return "bg-slate-500/10 border-slate-500/20";
  }
}
