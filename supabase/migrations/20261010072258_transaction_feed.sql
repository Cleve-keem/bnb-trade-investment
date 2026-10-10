-- =============================================================================
-- 020_transaction_feed.sql
-- =============================================================================

-- Internal feed. Deliberately NOT callable from the browser: it has no
-- per-user filtering, so only the RPCs below (security definer) may use it.
create or replace function public.transaction_feed()
returns table (
    entry_id uuid,
    source text,
    user_id uuid,
    reference text,
    entry_type text,
    description text,
    amount numeric,
    status text,
    occurred_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
    -- Settled ledger rows
    select
        t.id,
        'ledger'::text,
        w.user_id,
        t.reference,
        case t.transaction_type
            when 'deposit_credit'       then 'deposit'
            when 'withdrawal_debit'     then 'withdrawal'
            when 'withdrawal_reversal'  then 'withdrawal'
            when 'investment_debit'     then 'investment'
            when 'investment_return'    then 'return'
            when 'profit_payout'        then 'return'
            when 'bonus'                then 'bonus'
            when 'referral_reward'      then 'bonus'
            else 'adjustment'
        end,
        coalesce(t.description, initcap(replace(t.transaction_type::text, '_', ' '))),
        t.amount,
        'completed'::text,
        t.created_at
    from public.wallet_transactions t
    join public.wallets w on w.id = t.wallet_id

    union all

    -- Withdrawals not yet settled (completed ones already exist as ledger rows)
    select
        r.id, 'withdrawal', r.user_id, r.reference, 'withdrawal',
        coalesce(r.asset, 'Crypto') || ' Withdrawal',
        -r.amount,
        case r.status when 'rejected' then 'failed' else 'pending' end,
        r.created_at
    from public.withdrawal_requests r
    where r.status in ('pending', 'approved', 'rejected')

    union all

    -- Deposits not yet confirmed (completed ones already exist as ledger rows)
    select
        d.id, 'deposit', d.user_id, d.reference, 'deposit',
        'Deposit',
        d.amount,
        case d.status when 'failed' then 'failed' else 'pending' end,
        d.created_at
    from public.deposit_requests d
    where d.status in ('pending', 'failed');
$$;

revoke all on function public.transaction_feed() from public, anon, authenticated;


-- User: their own feed
create or replace function public.get_my_transactions()
returns table (
    entry_id uuid,
    source text,
    reference text,
    entry_type text,
    description text,
    amount numeric,
    status text,
    occurred_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
    select f.entry_id, f.source, f.reference, f.entry_type,
           f.description, f.amount, f.status, f.occurred_at
    from public.transaction_feed() f
    where f.user_id = auth.uid()
    order by f.occurred_at desc, f.entry_id;
$$;

revoke all on function public.get_my_transactions() from public, anon;
grant execute on function public.get_my_transactions() to authenticated;


-- Admin: everyone's feed, filtered + paginated on the server.
-- (The ledger is the one table that only ever grows, so it shouldn't be
-- shipped to the browser in full.)
create or replace function public.admin_list_transactions(
    p_type text default null,
    p_search text default null,
    p_limit integer default 10,
    p_offset integer default 0
)
returns table (
    entry_id uuid,
    source text,
    user_id uuid,
    full_name text,
    email citext,
    reference text,
    entry_type text,
    description text,
    amount numeric,
    status text,
    occurred_at timestamptz,
    total_count bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_search text := nullif(trim(p_search), '');
    v_limit  integer := least(greatest(coalesce(p_limit, 10), 1), 100);
    v_offset integer := greatest(coalesce(p_offset, 0), 0);
begin
    if not public.is_admin() then
        raise exception 'admin_list_transactions: caller is not an admin';
    end if;

    return query
    select
        f.entry_id, f.source, f.user_id, u.full_name, u.email,
        f.reference, f.entry_type, f.description, f.amount, f.status, f.occurred_at,
        count(*) over () as total_count
    from public.transaction_feed() f
    join public.users u on u.id = f.user_id
    where (p_type is null or f.entry_type = p_type)
      and (
            v_search is null
         or f.reference   ilike '%' || v_search || '%'
         or f.description ilike '%' || v_search || '%'
         or u.email::text ilike '%' || v_search || '%'
         or coalesce(u.full_name, '') ilike '%' || v_search || '%'
      )
    order by f.occurred_at desc, f.entry_id
    limit v_limit offset v_offset;
end;
$$;

revoke all on function public.admin_list_transactions(text, text, integer, integer) from public, anon;
grant execute on function public.admin_list_transactions(text, text, integer, integer) to authenticated;


-- Admin: summary cards. Volume is gross (money in + money out), completed only.
create or replace function public.admin_transaction_stats()
returns table (
    completed_volume numeric,
    total_count bigint,
    pending_count bigint,
    failed_count bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
    if not public.is_admin() then
        raise exception 'admin_transaction_stats: caller is not an admin';
    end if;

    return query
    select
        coalesce(sum(abs(f.amount)) filter (where f.status = 'completed'), 0),
        count(*),
        count(*) filter (where f.status = 'pending'),
        count(*) filter (where f.status = 'failed')
    from public.transaction_feed() f;
end;
$$;

revoke all on function public.admin_transaction_stats() from public, anon;
grant execute on function public.admin_transaction_stats() to authenticated;