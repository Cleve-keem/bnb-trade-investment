create table if not exists public.user_settings (
  user_id          uuid primary key references public.users(id) on delete cascade,
  currency         text not null default 'USD' check (currency in ('USD', 'EUR')),
  theme            text not null default 'dark' check (theme in ('dark', 'system')),
  notify_account   boolean not null default true,
  notify_trading   boolean not null default true,
  notify_market    boolean not null default false,
  updated_at       timestamptz not null default timezone('utc', now())
);

drop trigger if exists user_settings_set_updated_at on public.user_settings;
create trigger user_settings_set_updated_at
before update on public.user_settings
for each row execute function public.set_updated_at();

alter table public.user_settings enable row level security;
revoke insert, update, delete on public.user_settings from anon, authenticated;
revoke select on public.user_settings from anon;

drop policy if exists "user_settings_read_own" on public.user_settings;
create policy "user_settings_read_own"
on public.user_settings for select to authenticated
using (user_id = auth.uid());


create or replace function public.get_my_settings()
returns public.user_settings
language plpgsql
security definer
set search_path = public
as $$
declare
  v public.user_settings;
begin
  if auth.uid() is null then
    raise exception 'get_my_settings: no authenticated user';
  end if;

  insert into public.user_settings (user_id) values (auth.uid())
  on conflict (user_id) do nothing;

  select * into v from public.user_settings where user_id = auth.uid();
  return v;
end;
$$;


create or replace function public.update_my_settings(
  p_currency text,
  p_theme text,
  p_notify_account boolean,
  p_notify_trading boolean,
  p_notify_market boolean
)
returns public.user_settings
language plpgsql
security definer
set search_path = public
as $$
declare
  v public.user_settings;
begin
  if auth.uid() is null then
    raise exception 'update_my_settings: no authenticated user';
  end if;

  insert into public.user_settings (
    user_id, currency, theme, notify_account, notify_trading, notify_market
  )
  values (
    auth.uid(), p_currency, p_theme, p_notify_account, p_notify_trading, p_notify_market
  )
  on conflict (user_id) do update
    set currency = excluded.currency,
        theme = excluded.theme,
        notify_account = excluded.notify_account,
        notify_trading = excluded.notify_trading,
        notify_market = excluded.notify_market
  returning * into v;

  return v;
end;
$$;

revoke all on function public.get_my_settings() from public, anon;
revoke all on function public.update_my_settings(text, text, boolean, boolean, boolean) from public, anon;
grant execute on function public.get_my_settings() to authenticated;
grant execute on function public.update_my_settings(text, text, boolean, boolean, boolean) to authenticated;

notify pgrst, 'reload schema';