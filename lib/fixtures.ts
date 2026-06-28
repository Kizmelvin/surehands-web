import type { JobCard, ServiceCategory, WorkerCard } from "@/types/db";

export const CATEGORIES: ServiceCategory[] = [
  { id: "cat-1", name: "Plumbing", created_at: new Date().toISOString() },
  { id: "cat-2", name: "Electrical", created_at: new Date().toISOString() },
  { id: "cat-3", name: "Cleaning", created_at: new Date().toISOString() },
  { id: "cat-4", name: "Carpentry", created_at: new Date().toISOString() },
  { id: "cat-5", name: "Painting", created_at: new Date().toISOString() },
  { id: "cat-6", name: "AC / Refrigeration", created_at: new Date().toISOString() },
  { id: "cat-7", name: "Mechanic", created_at: new Date().toISOString() },
  { id: "cat-8", name: "Generator Repair", created_at: new Date().toISOString() },
];

export const ENUGU_NEIGHBOURHOODS = [
  "Independence Layout",
  "GRA",
  "New Haven",
  "Trans-Ekulu",
  "Achara Layout",
  "Abakpa",
  "Ogui",
  "Uwani",
];

export const WORKERS: WorkerCard[] = [
  {
    user_id: "w-1",
    full_name: "Chibuzo Okafor",
    category: "Plumbing",
    rating: 4.9,
    jobs_completed: 87,
    distance_km: 1.2,
    is_available: true,
    nin_verified: true,
    has_skill_video: true,
    hourly_rate: 3500,
    photo_url: null,
    bio: "Licensed plumber with 12 years experience. Specializes in fixing leaks, installing tanks, and pressure-pump diagnostics.",
    skills: ["Leak repair", "Tank installation", "Pump diagnostics"],
  },
  {
    user_id: "w-2",
    full_name: "Ngozi Eze",
    category: "Cleaning",
    rating: 4.8,
    jobs_completed: 142,
    distance_km: 0.6,
    is_available: true,
    nin_verified: true,
    has_skill_video: true,
    hourly_rate: 2500,
    photo_url: null,
    bio: "Deep cleaning specialist. Brings her own kit. Available same-day for one-bedroom to four-bedroom homes.",
    skills: ["Deep clean", "Move-in / move-out", "Carpet shampoo"],
  },
  {
    user_id: "w-3",
    full_name: "Emeka Nnaji",
    category: "Electrical",
    rating: 4.7,
    jobs_completed: 64,
    distance_km: 2.4,
    is_available: false,
    nin_verified: true,
    has_skill_video: true,
    hourly_rate: 4000,
    photo_url: null,
    bio: "Certified electrician for residential and small commercial. Inverter installs, breaker upgrades, surge protection.",
    skills: ["Inverter install", "Wiring", "Surge protection"],
  },
  {
    user_id: "w-4",
    full_name: "Ifeanyi Ugwu",
    category: "Generator Repair",
    rating: 4.6,
    jobs_completed: 51,
    distance_km: 3.1,
    is_available: true,
    nin_verified: true,
    has_skill_video: false,
    hourly_rate: 3000,
    photo_url: null,
    bio: "Generator and small-engine specialist. Carburetor cleaning, AVR replacement, full servicing.",
    skills: ["Carb cleaning", "AVR replace", "Servicing"],
  },
  {
    user_id: "w-5",
    full_name: "Adaeze Okonkwo",
    category: "Carpentry",
    rating: 5.0,
    jobs_completed: 23,
    distance_km: 4.7,
    is_available: true,
    nin_verified: true,
    has_skill_video: true,
    hourly_rate: 4500,
    photo_url: null,
    bio: "Finish carpentry, built-in wardrobes, kitchen cabinets. Brings own measurements and CAD.",
    skills: ["Cabinetry", "Built-ins", "Doors"],
  },
  {
    user_id: "w-6",
    full_name: "Tobechukwu Nwosu",
    category: "Painting",
    rating: 4.5,
    jobs_completed: 38,
    distance_km: 1.9,
    is_available: true,
    nin_verified: false,
    has_skill_video: true,
    hourly_rate: 2200,
    photo_url: null,
    bio: "Interior and exterior painter. Texture work, accent walls, scuff and patch jobs.",
    skills: ["Interior", "Exterior", "Texture"],
  },
];

export const JOBS: JobCard[] = [
  {
    id: "j-1",
    title: "Kitchen sink leaking under cabinet",
    description:
      "Water pooling under the kitchen sink since last night. Need someone to identify the source and fix it today. Likely a P-trap or supply-line issue.",
    category: "Plumbing",
    location_label: "Independence Layout, Enugu",
    distance_km: 1.4,
    budget: 12000,
    status: "open",
    posted_at: "2026-05-28T09:14:00Z",
    client_name: "Adaeze O.",
    proposals_count: 4,
  },
  {
    id: "j-2",
    title: "Inverter installation for 3-bedroom flat",
    description:
      "Bought a 3.5kVA inverter and 4 batteries. Need certified electrician to wire it up to selected circuits (fridge, fans, lights). Same-day if possible.",
    category: "Electrical",
    location_label: "GRA, Enugu",
    distance_km: 2.8,
    budget: 45000,
    status: "open",
    posted_at: "2026-05-28T07:42:00Z",
    client_name: "Henry C.",
    proposals_count: 7,
  },
  {
    id: "j-3",
    title: "Deep clean before tenants move in",
    description:
      "Two-bedroom unit being handed over Friday. Walls, kitchen, bathrooms, fans, windows. Materials provided.",
    category: "Cleaning",
    location_label: "Trans-Ekulu, Enugu",
    distance_km: 0.9,
    budget: 18000,
    status: "open",
    posted_at: "2026-05-27T18:01:00Z",
    client_name: "Onyeka E.",
    proposals_count: 11,
  },
  {
    id: "j-4",
    title: "Generator won't start after rain",
    description:
      "5kVA Sumec was running fine last week. After heavy rain it cranks but doesn't fire. Need someone with diagnostic experience.",
    category: "Generator Repair",
    location_label: "New Haven, Enugu",
    distance_km: 3.6,
    budget: 8000,
    status: "open",
    posted_at: "2026-05-28T11:23:00Z",
    client_name: "Ifeoma N.",
    proposals_count: 2,
  },
  {
    id: "j-5",
    title: "Build a 6ft wardrobe — bedroom",
    description:
      "Need a custom 6ft x 7ft wardrobe with three sections (hanging, shelves, drawers). Wood + finish. Quote with materials.",
    category: "Carpentry",
    location_label: "Achara Layout, Enugu",
    distance_km: 4.2,
    budget: 95000,
    status: "open",
    posted_at: "2026-05-26T15:30:00Z",
    client_name: "Chidi U.",
    proposals_count: 5,
  },
];

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
