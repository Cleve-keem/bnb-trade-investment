-- 1. request_deposit: new version with limits and an optional transaction ID.
--    The parameter name changed, so the old one must be dropped first.
drop function if exists public.request_deposit(numeric, public.deposit_method, text);

create or replace function public.request_deposit(
    p_amount numeric,
    p_method public.deposit_method default 'crypto',
    p_txid text default null
)
returns public.deposit_requests
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid := auth.uid();
    v_wallet public.wallets;
    v_ref text;
    v_txid text := nullif(lower(trim(coalesce(p_txid, ''))), '');
    v_deposit public.deposit_requests;
begin
    if v_user_id is null then
        raise exception 'request_deposit: no authenticated user';
    end if;

    if not exists (select 1 from public.users where id = v_user_id and status = 'active') then
        raise exception 'request_deposit: account is not active';
    end if;

    if p_amount is null or p_amount < 10 then
        raise exception 'Minimum deposit is $10';
    end if;
    if p_amount > 1000000 then
        raise exception 'Maximum deposit is $1,000,000';
    end if;
    if round(p_amount, 2) <> p_amount then
        raise exception 'Amount can have at most 2 decimal places';
    end if;

    if v_txid is not null and v_txid !~ '^[0-9a-f]{64}$' then
        raise exception 'Transaction ID must be 64 characters (0-9 and a-f)';
    end if;

    -- Lock the wallet row so two quick clicks can't slip past the limit below
    select * into v_wallet from public.wallets where user_id = v_user_id for update;
    if not found then
        raise exception 'request_deposit: wallet not found';
    end if;
    if v_wallet.status <> 'active' then
        raise exception 'request_deposit: wallet is not active';
    end if;

    if (
        select count(*) from public.deposit_requests
        where user_id = v_user_id and status = 'pending'
    ) >= 3 then
        raise exception 'You already have 3 deposits waiting for confirmation. Please wait for them to be reviewed.';
    end if;

    v_ref := public.generate_reference('DEP');

    begin
        insert into public.deposit_requests (
            user_id, wallet_id, reference, amount, currency, method, status, metadata
        )
        values (
            v_user_id, v_wallet.id, v_ref, p_amount, v_wallet.currency, p_method, 'pending',
            case when v_txid is null then '{}'::jsonb
                 else jsonb_build_object('txid', v_txid) end
        )
        returning * into v_deposit;
    exception
        when unique_violation then
            raise exception 'This transaction ID was already submitted';
    end;

    perform public.log_audit(
        v_user_id, 'request_deposit', 'deposit_request', v_deposit.id,
        jsonb_build_object('amount', p_amount, 'method', p_method,
                           'reference', v_ref, 'txid', v_txid)
    );

    return v_deposit;
end;
$$;

-- The same transaction can't be used twice (a rejected request frees it up)
create unique index if not exists deposit_requests_txid_unique
on public.deposit_requests ((metadata->>'txid'))
where (metadata->>'txid') is not null and status <> 'failed';

revoke all on function public.request_deposit(numeric, public.deposit_method, text) from public, anon;
grant execute on function public.request_deposit(numeric, public.deposit_method, text) to authenticated;


-- 2. admin_list_deposits: adds reference, transaction ID, currency and who decided.
--    Old columns are kept, so an existing page keeps working.
drop function if exists public.admin_list_deposits();

create or replace function public.admin_list_deposits()
returns table (
    deposit_id uuid,
    reference text,
    user_id uuid,
    full_name text,
    email citext,
    amount numeric,
    currency text,
    method public.deposit_method,
    status public.deposit_status,
    txid text,
    rejection_reason text,
    created_at timestamptz,
    decided_at timestamptz,
    decided_by_name text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
    if not public.is_admin() then
        raise exception 'admin_list_deposits: caller is not an admin';
    end if;

    return query
    select
        d.id, d.reference, d.user_id, u.full_name, u.email,
        d.amount, d.currency::text, d.method, d.status,
        (d.metadata->>'txid'), d.rejection_reason,
        d.created_at, d.decided_at, a.full_name
    from public.deposit_requests d
    join public.users u on u.id = d.user_id
    left join public.users a on a.id = d.decision_by
    order by d.created_at desc;
end;
$$;

revoke all on function public.admin_list_deposits() from public, anon;
grant execute on function public.admin_list_deposits() to authenticated;

-- Your confirm and reject functions are fine. This only removes anonymous access.
revoke all on function public.admin_confirm_deposit(uuid) from public, anon;
revoke all on function public.admin_reject_deposit(uuid, text) from public, anon;
grant execute on function public.admin_confirm_deposit(uuid) to authenticated;
grant execute on function public.admin_reject_deposit(uuid, text) to authenticated;


-- 3. Audit page: confirming or rejecting a deposit counts as a Warning
create or replace function public.audit_severity(p_action text, p_status public.audit_action_status)
returns text
language sql
immutable
set search_path = public
as $$
  select case
    when p_status = 'failed' then 'Critical'
    when p_action in ('suspend_user', 'delete_user', 'delete_plan') then 'Critical'
    when p_action in (
      'admin_adjust_wallet', 'reject_withdrawal', 'cancel_investment', 'update_plan',
      'set_plan_status', 'update_settings', 'send_notification', 'delete_notification',
      'admin_confirm_deposit', 'admin_reject_deposit'
    ) then 'Warning'
    else 'Info'
  end;
$$;


-- 4. Live wallet updates (safe to run if it's already switched on)
do $$
begin
    alter publication supabase_realtime add table public.wallets;
exception
    when duplicate_object then null;
end $$;

notify pgrst, 'reload schema';