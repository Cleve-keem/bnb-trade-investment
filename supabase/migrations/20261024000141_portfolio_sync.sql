-- 0. Remove every old version, so each name exists only once
drop function if exists public.get_portfolio_summary(uuid);
drop function if exists public.get_portfolio_summary(uuid, text);
drop function if exists public.get_portfolio_holdings(uuid);
drop function if exists public.get_portfolio_holdings(uuid, text);
drop function if exists public.get_portfolio_history(uuid, text);
drop function if exists public.get_portfolio_history(uuid, text, text);


-- 1. One shared rule: how much of an investment's profit has been earned by a given moment
--    (0 = just started, 1 = matured). Every portfolio number below uses this.
create or replace function public.investment_progress(
  p_started timestamptz,
  p_matures timestamptz,
  p_at timestamptz default now()
)
returns numeric
language sql
stable
set search_path = public
as $$
  select case
    when p_started is null or p_matures is null or p_matures <= p_started
      then 0::numeric
    else least(1::numeric, greatest(0::numeric,
      (extract(epoch from (p_at - p_started))
        / extract(epoch from (p_matures - p_started)))::numeric))
  end;
$$;

revoke all on function public.investment_progress(timestamptz, timestamptz, timestamptz)
  from public, anon, authenticated;


-- 2. Summary
create or replace function public.get_portfolio_summary(
    p_user_id uuid,
    p_currency text default null
)
returns table (
    total_value numeric,
    cash_balance numeric,
    available_balance numeric,
    invested_value numeric,
    total_invested numeric,
    total_return numeric,
    currency text
)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_wallet public.wallets;
    v_currency text;
    v_active_value numeric;
    v_lifetime_invested numeric;
    v_profit_earned numeric;
begin
    if auth.role() <> 'service_role'
        and auth.uid() is distinct from p_user_id then
        raise exception 'get_portfolio_summary: unauthorized';
    end if;

    v_currency := public.resolve_display_currency(p_user_id, p_currency);

    select * into v_wallet from public.wallets where user_id = p_user_id;
    if v_wallet.id is null then
        raise exception 'get_portfolio_summary: wallet not found';
    end if;

    select
        coalesce(sum(i.amount + i.expected_profit * p.pct)
                 filter (where i.status = 'active'), 0),
        coalesce(sum(i.amount) filter (where i.status <> 'cancelled'), 0),
        coalesce(sum(case
                       when i.status = 'active'    then i.expected_profit * p.pct
                       when i.status = 'completed' then i.expected_profit
                       else 0
                     end), 0)
    into v_active_value, v_lifetime_invested, v_profit_earned
    from public.investments i
    cross join lateral (
        select public.investment_progress(i.started_at, i.matures_at) as pct
    ) p
    where i.wallet_id = v_wallet.id;

    return query
    select
        public.convert_from_usd(v_wallet.balance + v_active_value, v_currency),
        public.convert_from_usd(v_wallet.balance, v_currency),
        public.convert_from_usd(v_wallet.balance - v_wallet.locked_balance, v_currency),
        public.convert_from_usd(v_active_value, v_currency),
        public.convert_from_usd(v_lifetime_invested, v_currency),
        public.convert_from_usd(v_profit_earned, v_currency),
        v_currency;
end;
$$;


-- 3. Holdings (running investments only, same currency as the summary)
create or replace function public.get_portfolio_holdings(
    p_user_id uuid,
    p_currency text default null
)
returns table (
    investment_id uuid,
    plan_name text,
    amount numeric,
    current_value numeric,
    change_percentage numeric,
    allocation_percentage numeric,
    status text,
    currency text
)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_wallet_id uuid;
    v_currency text;
begin
    if auth.role() <> 'service_role'
        and auth.uid() is distinct from p_user_id then
        raise exception 'get_portfolio_holdings: unauthorized';
    end if;

    v_currency := public.resolve_display_currency(p_user_id, p_currency);

    select w.id into v_wallet_id from public.wallets w where w.user_id = p_user_id;
    if v_wallet_id is null then
        raise exception 'get_portfolio_holdings: wallet not found';
    end if;

    return query
    with a as (
        select
            i.id,
            i.plan_name,
            i.amount,
            i.status::text as status,
            i.amount + i.expected_profit
              * public.investment_progress(i.started_at, i.matures_at) as worth
        from public.investments i
        where i.wallet_id = v_wallet_id
          and i.status = 'active'
    ),
    t as (select coalesce(sum(a2.worth), 0) as total from a a2)
    select
        a.id,
        a.plan_name,
        public.convert_from_usd(a.amount, v_currency),
        public.convert_from_usd(a.worth, v_currency),
        case when a.amount = 0 then 0::numeric
             else round((a.worth - a.amount) / a.amount * 100, 2) end,
        case when t.total = 0 then 0::numeric
             else round(a.worth / t.total * 100, 1) end,
        a.status,
        v_currency
    from a cross join t
    order by a.worth desc;
end;
$$;


-- 4. Chart history: same math, same currency, no double counting after payout
create or replace function public.get_portfolio_history(
    p_user_id uuid,
    p_range text default '1M',
    p_currency text default null
)
returns table (day date, total_value numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_wallet_id uuid;
    v_start date;
    v_currency text;
begin
    if auth.role() <> 'service_role'
        and auth.uid() is distinct from p_user_id then
        raise exception 'get_portfolio_history: unauthorized';
    end if;

    v_currency := public.resolve_display_currency(p_user_id, p_currency);

    select w.id into v_wallet_id from public.wallets w where w.user_id = p_user_id;
    if v_wallet_id is null then
        raise exception 'get_portfolio_history: wallet not found';
    end if;

    v_start := case p_range
        when '1D' then current_date - 1
        when '1W' then current_date - 7
        when '1M' then (current_date - interval '1 month')::date
        when '3M' then (current_date - interval '3 months')::date
        when '6M' then (current_date - interval '6 months')::date
        when '1Y' then (current_date - interval '1 year')::date
        else (current_date - interval '1 month')::date
    end;

    return query
    with days as (
        select
            g::date as dt,
            -- end of that day, but never later than "now" (so today matches the summary)
            least((g::date + 1)::timestamptz, now()) as at_ts
        from generate_series(v_start::timestamp, current_date::timestamp, interval '1 day') g
    ),
    series as (
        select
            dd.dt,
            coalesce((
                select t.balance_after
                from public.wallet_transactions t
                where t.wallet_id = v_wallet_id
                  and t.created_at <= dd.at_ts
                order by t.created_at desc, t.id desc
                limit 1
            ), 0) as cash,
            coalesce((
                select sum(i.amount + i.expected_profit
                           * public.investment_progress(i.started_at, i.matures_at, dd.at_ts))
                from public.investments i
                where i.wallet_id = v_wallet_id
                  and i.started_at is not null
                  and i.started_at <= dd.at_ts
                  and (i.completed_at is null or i.completed_at > dd.at_ts)
                  and (i.cancelled_at is null or i.cancelled_at > dd.at_ts)
            ), 0) as invested
        from days dd
    )
    select s.dt, public.convert_from_usd(s.cash + s.invested, v_currency)
    from series s
    order by s.dt;
end;
$$;


revoke all on function public.get_portfolio_summary(uuid, text) from public, anon;
revoke all on function public.get_portfolio_holdings(uuid, text) from public, anon;
revoke all on function public.get_portfolio_history(uuid, text, text) from public, anon;
grant execute on function public.get_portfolio_summary(uuid, text) to authenticated;
grant execute on function public.get_portfolio_holdings(uuid, text) to authenticated;
grant execute on function public.get_portfolio_history(uuid, text, text) to authenticated;

notify pgrst, 'reload schema';