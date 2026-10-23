-- 1. Helpers

-- Reads an on/off setting safely (text "true" or boolean true both work)
create or replace function public.setting_bool(p_key text, p_default boolean default false)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select case lower(trim(s.value #>> '{}'))
              when 'true' then true
              when 'false' then false
              else null
            end
     from public.system_settings s
     where s.setting_key = p_key),
    p_default
  );
$$;

revoke all on function public.setting_bool(text, boolean) from public, anon, authenticated;

-- Your create_investment() already calls this. It now reads the "maintenance_mode" setting.
create or replace function public.is_maintenance_mode()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.setting_bool('maintenance_mode', false);
$$;

grant execute on function public.is_maintenance_mode() to anon, authenticated;

-- The sign-up page asks this before showing the form
create or replace function public.registrations_open()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.setting_bool('allow_registrations', true);
$$;

revoke all on function public.registrations_open() from public;
grant execute on function public.registrations_open() to anon, authenticated;

-- The settings the admin page may change, and how each one is stored
create or replace function public.managed_setting_defs()
returns jsonb
language sql
immutable
set search_path = public
as $$
  select '{
    "platform_name":                     {"type":"string",  "category":"general",  "public":true,  "description":"Platform display name"},
    "support_email":                     {"type":"string",  "category":"general",  "public":true,  "description":"Support email shown on the Help page"},
    "support_phone":                     {"type":"string",  "category":"general",  "public":true,  "description":"Support phone shown on the Help page"},
    "deposit_crypto_btc_address":        {"type":"string",  "category":"deposits", "public":false, "description":"BTC deposit address (empty = BTC deposits off)"},
    "deposit_crypto_eth_address":        {"type":"string",  "category":"deposits", "public":false, "description":"ETH deposit address (empty = ETH deposits off)"},
    "deposit_crypto_usdt_trc20_address": {"type":"string",  "category":"deposits", "public":false, "description":"USDT (TRC-20) deposit address (empty = USDT deposits off)"},
    "allow_withdrawals":                 {"type":"boolean", "category":"platform", "public":true,  "description":"Allow new withdrawal requests"},
    "allow_investments":                 {"type":"boolean", "category":"platform", "public":true,  "description":"Allow new investments"},
    "allow_registrations":               {"type":"boolean", "category":"platform", "public":true,  "description":"Allow new sign-ups"},
    "maintenance_mode":                  {"type":"boolean", "category":"platform", "public":true,  "description":"Pause new investments while on"}
  }'::jsonb;
$$;

revoke all on function public.managed_setting_defs() from public, anon, authenticated;


-- 2. Starting values. Anything you already have is kept.
insert into public.system_settings (setting_key, value, value_type, category, description, is_public)
values
  ('platform_name',                     '"BNB"',               'string',  'general',  'Platform display name', true),
  ('support_email',                     '""',                  'string',  'general',  'Support email shown on the Help page', true),
  ('support_phone',                     '"+1 (903) 917-4548"', 'string',  'general',  'Support phone shown on the Help page', true),
  ('deposit_crypto_btc_address',        '""',                  'string',  'deposits', 'BTC deposit address (empty = BTC deposits off)', false),
  ('deposit_crypto_eth_address',        '""',                  'string',  'deposits', 'ETH deposit address (empty = ETH deposits off)', false),
  ('deposit_crypto_usdt_trc20_address', '""',                  'string',  'deposits', 'USDT (TRC-20) deposit address (empty = USDT deposits off)', false),
  ('allow_withdrawals',                 'true',                'boolean', 'platform', 'Allow new withdrawal requests', true),
  ('allow_investments',                 'true',                'boolean', 'platform', 'Allow new investments', true),
  ('allow_registrations',               'true',                'boolean', 'platform', 'Allow new sign-ups', true),
  ('maintenance_mode',                  'false',               'boolean', 'platform', 'Pause new investments while on', true)
on conflict (setting_key) do nothing;


-- 3. Admin: read and save
create or replace function public.admin_get_settings()
returns table (
    setting_key text,
    value jsonb,
    updated_at timestamptz,
    updated_by_name text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
    if not public.is_admin() then
        raise exception 'admin_get_settings: caller is not an admin';
    end if;

    return query
    select s.setting_key::text, s.value, s.updated_at, coalesce(u.full_name, u.email::text)
    from public.system_settings s
    left join public.users u on u.id = s.updated_by
    where public.managed_setting_defs() ? s.setting_key::text;
end;
$$;


-- Takes {"setting_key": newValue, ...}, checks every value, saves everything or nothing
create or replace function public.admin_update_settings(p_changes jsonb)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
    v_admin uuid := auth.uid();
    v_defs jsonb := public.managed_setting_defs();
    v_key text;
    v_new jsonb;
    v_old jsonb;
    v_def jsonb;
    v_text text;
    v_count integer := 0;
    v_before jsonb := '{}'::jsonb;
    v_after jsonb := '{}'::jsonb;
    v_addr_before jsonb := '{}'::jsonb;
    v_addr_after jsonb := '{}'::jsonb;
begin
    if not public.is_admin() then
        raise exception 'admin_update_settings: caller is not an admin';
    end if;

    if p_changes is null or jsonb_typeof(p_changes) <> 'object' or p_changes = '{}'::jsonb then
        raise exception 'Nothing to save';
    end if;

    for v_key, v_new in
        select e.key, e.value from jsonb_each(p_changes) e
    loop
        v_def := v_defs -> v_key;
        if v_def is null then
            raise exception 'Unknown setting: %', v_key;
        end if;

        if v_def->>'type' = 'boolean' then
            if jsonb_typeof(v_new) <> 'boolean' then
                raise exception '% must be on or off', v_key;
            end if;
        else
            if jsonb_typeof(v_new) <> 'string' then
                raise exception '% must be text', v_key;
            end if;

            v_text := trim(v_new #>> '{}');
            v_new := to_jsonb(v_text);

            case v_key
                when 'platform_name' then
                    if length(v_text) < 1 or length(v_text) > 60 then
                        raise exception 'Platform name must be 1 to 60 characters';
                    end if;
                when 'support_email' then
                    if v_text <> '' and v_text !~ '^[^@ ]+@[^@ ]+\.[^@ ]+$' then
                        raise exception 'Support email is not a valid email address';
                    end if;
                when 'support_phone' then
                    if v_text <> '' and v_text !~ '^\+?[0-9 ()-]{6,30}$' then
                        raise exception 'Support phone can only contain numbers, spaces, + ( ) and -';
                    end if;
                when 'deposit_crypto_btc_address' then
                    if v_text <> '' and v_text !~ '^(bc1[a-z0-9]{20,87}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$' then
                        raise exception 'That does not look like a valid Bitcoin address';
                    end if;
                when 'deposit_crypto_eth_address' then
                    if v_text <> '' and v_text !~ '^0x[0-9a-fA-F]{40}$' then
                        raise exception 'That does not look like a valid Ethereum address (it should start with 0x)';
                    end if;
                when 'deposit_crypto_usdt_trc20_address' then
                    if v_text <> '' and v_text !~ '^T[1-9A-HJ-NP-Za-km-z]{33}$' then
                        raise exception 'That does not look like a valid TRON (TRC-20) address (it should start with T)';
                    end if;
                else
                    null;
            end case;
        end if;

        select s.value into v_old
        from public.system_settings s
        where s.setting_key = v_key
        for update;

        if v_old is not distinct from v_new then
            continue;
        end if;

        insert into public.system_settings
            (setting_key, value, value_type, category, description, is_public, updated_by)
        values
            (v_key, v_new, v_def->>'type', v_def->>'category', v_def->>'description',
             (v_def->>'public')::boolean, v_admin)
        on conflict (setting_key) do update
            set value = excluded.value,
                updated_by = excluded.updated_by;

        v_count := v_count + 1;

        if starts_with(v_key, 'deposit_crypto_') then
            v_addr_before := v_addr_before || jsonb_build_object(v_key, v_old);
            v_addr_after  := v_addr_after  || jsonb_build_object(v_key, v_new);
        else
            v_before := v_before || jsonb_build_object(v_key, v_old);
            v_after  := v_after  || jsonb_build_object(v_key, v_new);
        end if;
    end loop;

    if v_after <> '{}'::jsonb then
        perform public.log_audit(
            v_admin, 'update_settings', 'system_settings', null,
            jsonb_build_object('before', v_before, 'after', v_after)
        );
    end if;

    if v_addr_after <> '{}'::jsonb then
        perform public.log_audit(
            v_admin, 'update_deposit_address', 'system_settings', null,
            jsonb_build_object('before', v_addr_before, 'after', v_addr_after)
        );
    end if;

    return v_count;
end;
$$;


-- 4. Settings that are safe to show anyone (rows marked is_public)
create or replace function public.get_public_settings()
returns table (setting_key text, value jsonb)
language sql
stable
security definer
set search_path = public
as $$
  select s.setting_key::text, s.value
  from public.system_settings s
  where s.is_public;
$$;


-- 5. Guards: the database itself refuses when a switch is off
create or replace function public.guard_new_investment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if not public.setting_bool('allow_investments', true) then
        raise exception 'Investing is temporarily paused. Please try again later.';
    end if;
    return new;
end;
$$;

drop trigger if exists investments_guard_enabled on public.investments;
create trigger investments_guard_enabled
before insert on public.investments
for each row execute function public.guard_new_investment();


create or replace function public.guard_new_withdrawal()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if not public.setting_bool('allow_withdrawals', true) then
        raise exception 'Withdrawals are temporarily unavailable. Please try again later.';
    end if;
    return new;
end;
$$;

drop trigger if exists withdrawal_requests_guard_enabled on public.withdrawal_requests;
create trigger withdrawal_requests_guard_enabled
before insert on public.withdrawal_requests
for each row execute function public.guard_new_withdrawal();


create or replace function public.guard_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if not public.setting_bool('allow_registrations', true) then
        raise exception 'New registrations are currently closed.';
    end if;
    return new;
end;
$$;

drop trigger if exists users_guard_registration on public.users;
create trigger users_guard_registration
before insert on public.users
for each row execute function public.guard_new_user();

revoke all on function public.guard_new_investment() from public, anon, authenticated;
revoke all on function public.guard_new_withdrawal() from public, anon, authenticated;
revoke all on function public.guard_new_user() from public, anon, authenticated;


-- 6. Audit page: changing a deposit address is Critical
create or replace function public.audit_severity(p_action text, p_status public.audit_action_status)
returns text
language sql
immutable
set search_path = public
as $$
  select case
    when p_status = 'failed' then 'Critical'
    when p_action in ('suspend_user', 'delete_user', 'delete_plan', 'update_deposit_address') then 'Critical'
    when p_action in (
      'admin_adjust_wallet', 'reject_withdrawal', 'cancel_investment', 'update_plan',
      'set_plan_status', 'update_settings', 'send_notification', 'delete_notification',
      'admin_confirm_deposit', 'admin_reject_deposit'
    ) then 'Warning'
    else 'Info'
  end;
$$;


-- 7. Permissions
revoke all on function public.admin_get_settings() from public, anon;
revoke all on function public.admin_update_settings(jsonb) from public, anon;
revoke all on function public.get_public_settings() from public;

grant execute on function public.admin_get_settings() to authenticated;
grant execute on function public.admin_update_settings(jsonb) to authenticated;
grant execute on function public.get_public_settings() to anon, authenticated;

notify pgrst, 'reload schema';