import { createClient } from "@/lib/supabase/client";
import { WORKERS as FIXTURE_WORKERS } from "@/lib/fixtures";
import type { WorkerCard } from "@/types/db";

export type SearchInput = {
  lat: number;
  lng: number;
  radiusKm: number;
  category?: string | null;
  onlyAvailable?: boolean;
  onlyVerified?: boolean;
};

export type SearchResult = {
  workers: WorkerCard[];
  source: "live" | "fixture";
  message?: string;
};

const GRA_LAT = 6.4541;
const GRA_LNG = 7.5104;

/**
 * Tries the search_workers_within_radius RPC. Falls back to in-memory fixtures
 * when the function is missing (migrations not applied yet) or returns nothing.
 *
 * The UI surfaces `source` so the demo can show a small "live data" badge.
 */
export async function searchWorkers(input: SearchInput): Promise<SearchResult> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.rpc("search_workers_within_radius", {
      client_lat: input.lat,
      client_lng: input.lng,
      radius_km: input.radiusKm,
      category: null, // category id resolution happens inside the RPC; for now pass null
      only_available: input.onlyAvailable ?? true,
      only_verified: input.onlyVerified ?? true,
      result_limit: 50,
    });

    if (error) {
      return {
        workers: filterFixtures(input),
        source: "fixture",
        message: `Live search unavailable (${error.message}). Showing seed data.`,
      };
    }

    if (!data || data.length === 0) {
      return {
        workers: filterFixtures(input),
        source: "fixture",
        message: "No live workers yet — showing seed data so the flow still demos.",
      };
    }

    type RpcRow = {
      user_id: string;
      full_name: string;
      avatar_url: string | null;
      category_name: string | null;
      is_available: boolean;
      nin_verified: boolean;
      has_skill_video: boolean;
      distance_km: number;
      weighted_avg_stars: number;
      reviews_count: number;
    };

    const workers: WorkerCard[] = (data as RpcRow[]).map((row) => ({
      user_id: row.user_id,
      full_name: row.full_name,
      category: row.category_name ?? "—",
      rating: Number(row.weighted_avg_stars) || 0,
      jobs_completed: row.reviews_count,
      distance_km: Number(row.distance_km) || 0,
      is_available: row.is_available,
      nin_verified: row.nin_verified,
      has_skill_video: row.has_skill_video,
      hourly_rate: 0,
      photo_url: row.avatar_url,
      bio: "",
      skills: [],
    }));

    return { workers, source: "live" };
  } catch (err) {
    return {
      workers: filterFixtures(input),
      source: "fixture",
      message: `Live search unavailable. Showing seed data.`,
    };
  }
}

function filterFixtures(input: SearchInput): WorkerCard[] {
  return FIXTURE_WORKERS.filter((w) => {
    if (w.distance_km > input.radiusKm) return false;
    if (input.onlyAvailable && !w.is_available) return false;
    if (input.onlyVerified && !w.nin_verified) return false;
    if (input.category && input.category !== "All" && w.category !== input.category) return false;
    return true;
  }).sort((a, b) => a.distance_km - b.distance_km);
}

export const DEFAULT_CLIENT_POSITION = { lat: GRA_LAT, lng: GRA_LNG };
