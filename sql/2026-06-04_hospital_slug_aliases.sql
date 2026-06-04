begin;

create table if not exists public.hospital_slug_aliases (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  old_slug text not null,
  new_slug text not null,
  redirect_status integer not null default 301,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint hospital_slug_aliases_old_slug_unique unique (old_slug),
  constraint hospital_slug_aliases_no_self_alias check (old_slug <> new_slug),
  constraint hospital_slug_aliases_redirect_status_check check (redirect_status in (301, 302))
);

create index if not exists hospital_slug_aliases_hospital_id_idx
  on public.hospital_slug_aliases (hospital_id);

create index if not exists hospital_slug_aliases_new_slug_idx
  on public.hospital_slug_aliases (new_slug);

create or replace function public.set_hospital_slug_aliases_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists hospital_slug_aliases_set_updated_at on public.hospital_slug_aliases;
create trigger hospital_slug_aliases_set_updated_at
before update on public.hospital_slug_aliases
for each row
execute function public.set_hospital_slug_aliases_updated_at();

comment on column public.hospital_slug_aliases.new_slug is
  'Audit snapshot only. Runtime redirect resolution must use hospital_id -> hospitals.slug as the current canonical slug.';

commit;
