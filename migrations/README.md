# Migrations

These SQL files are intended to be run **manually in the Supabase SQL editor** against the shared `sure-hands` Postgres database (same DB the mobile app uses).

Run them in numeric order — each is `begin; ... commit;` wrapped and idempotent (`create ... if not exists`, `if exists ... then ... end if`).

| File | What it adds | Safe to re-run? |
| --- | --- | --- |
| `001_bookings_and_reviews.sql` | `booking_status` enum, `bookings` table, `reviews` table, RLS policies, indexes. | Yes |
| `002_search_workers_rpc.sql` | `search_workers_within_radius(lat, lng, km, category_id)` Postgres function using `ST_DWithin`. | Yes |
| `003_profiles_trigger.sql` | Trigger on `auth.users` INSERT that auto-creates the matching `public.profiles` row from sign-up metadata. **Without this the web sign-up flow silently drops full_name + phone + role.** | Yes |
| `004_job_media.sql` | Adds `jobs.media_urls text[]` so clients can attach photos/videos to a posted job. | Yes |
| `005_worker_signup_fields.sql` | Adds `workers.operating_neighbourhoods text[]` and upgrades `handle_new_user()` to also create the workers row (with category + operating areas) at signup. | Yes |

After running, in your app code you can call:

```ts
const { data } = await supabase.rpc("search_workers_within_radius", {
  client_lat: 6.4541,
  client_lng: 7.5104,
  radius_km: 5,
  category: null,  // or a category id
});
```

## How this maps to the PRD

These migrations close two of the four 🔴 launch-blockers from `NEXT-STEPS.md`:

- **#2 Bookings + lifecycle** — `bookings` table with `booking_status` enum: `requested → accepted → en_route → in_progress → completed → canceled`. Matches the PRD lifecycle exactly.
- **#4 Real geospatial search** — `search_workers_within_radius` RPC. Replaces the fixture distance math with a real `ST_DWithin` query against `workers.base_location`.

The web app already has a `BookingStatusTracker` component (see `components/booking-status-tracker.tsx`) that talks to the new `bookings` table once these migrations are applied. Until then it operates against local state so the demo flow still works.
