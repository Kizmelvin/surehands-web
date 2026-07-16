-- 002_search_workers_rpc.sql
-- Geospatial worker search using PostGIS ST_DWithin.
-- Safe to re-run.

begin;

create or replace function public.search_workers_within_radius(
  client_lat double precision,
  client_lng double precision,
  radius_km numeric default 5,
  category uuid default null,
  only_available boolean default true,
  only_verified boolean default true,
  result_limit int default 50
)
returns table (
  user_id uuid,
  full_name text,
  avatar_url text,
  category_id uuid,
  category_name text,
  is_available boolean,
  is_visible boolean,
  nin_verified boolean,
  has_skill_video boolean,
  distance_km numeric,
  weighted_avg_stars numeric,
  reviews_count int
)
language sql
stable
as $$
  with origin as (
    select st_setsrid(st_makepoint(client_lng, client_lat), 4326)::geography as g
  )
  select
    w.user_id,
    p.full_name,
    p.avatar_url,
    w.category_id,
    c.name as category_name,
    w.is_available,
    w.is_visible,
    p.nin_verified,
    w.has_skill_video,
    round(
      (st_distance(w.base_location, (select g from origin)) / 1000)::numeric,
      2
    ) as distance_km,
    coalesce(r.weighted_avg_stars, 0)::numeric as weighted_avg_stars,
    coalesce(r.reviews_count, 0)::int as reviews_count
  from public.workers w
    join public.profiles p on p.id = w.user_id
    left join public.service_categories c on c.id = w.category_id
    left join public.worker_review_aggregate r on r.worker_user_id = w.user_id
  where w.base_location is not null
    and w.is_visible = true
    and (not only_available or w.is_available = true)
    and (not only_verified or p.nin_verified = true)
    and (category is null or w.category_id = category)
    and st_dwithin(
      w.base_location,
      (select g from origin),
      radius_km * 1000
    )
  order by distance_km asc
  limit result_limit;
$$;

-- Lock it down: anyone signed in can search.
grant execute on function public.search_workers_within_radius(
  double precision, double precision, numeric, uuid, boolean, boolean, int
) to authenticated, anon;

commit;
