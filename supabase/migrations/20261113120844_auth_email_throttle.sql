-- auth_email_throttle.sql
create table if not exists public.auth_email_log (
  id bigint generated always as identity primary key,
  kind text not null,
  subject text not null,
  created_at timestamptz not null default now()
);

create index if not exists auth_email_log_lookup_idx
  on public.auth_email_log (kind, subject, created_at desc);
create index if not exists auth_email_log_created_idx
  on public.auth_email_log (created_at);

alter table public.auth_email_log enable row level security;
revoke all on public.auth_email_log from anon, authenticated;


-- Returns true (and records the attempt) if sending is allowed
create or replace function public.allow_auth_email(
  p_kind text,
  p_subject text,
  p_cooldown_seconds integer,
  p_max_per_hour integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_last timestamptz;
  v_count integer;
begin
  perform pg_advisory_xact_lock(hashtext(p_kind || ':' || p_subject));

  select max(created_at), count(*)
  into v_last, v_count
  from public.auth_email_log
  where kind = p_kind
    and subject = p_subject
    and created_at > now() - interval '1 hour';

  if v_last is not null
     and v_last > now() - make_interval(secs => p_cooldown_seconds) then
    return false;
  end if;

  if v_count >= p_max_per_hour then
    return false;
  end if;

  insert into public.auth_email_log (kind, subject) values (p_kind, p_subject);
  delete from public.auth_email_log where created_at < now() - interval '2 days';

  return true;
end;
$$;

revoke all on function public.allow_auth_email(text, text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.allow_auth_email(text, text, integer, integer)
  to service_role;

notify pgrst, 'reload schema';