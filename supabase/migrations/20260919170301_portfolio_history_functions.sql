create or replace function public.get_portfolio_history(
    p_user_id uuid,
    p_range text default '1M' -- '1D','1W','1M','3M','6M','1Y'
)
returns table (day date, total_value numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_wallet_id uuid;
    v_start_date date;
begin
    if auth.role() <> 'service_role'
        and auth.uid() is distinct from p_user_id then
        raise exception 'get_portfolio_history: unauthorized';
    end if;

    select id into v_wallet_id from public.wallets where user_id = p_user_id;
    if v_wallet_id is null then
        raise exception 'Wallet not found for user';
    end if;

    v_start_date := case p_range
        when '1D' then current_date - interval '1 day'
        when '1W' then current_date - interval '7 days'
        when '1M' then current_date - interval '1 month'
        when '3M' then current_date - interval '3 months'
        when '6M' then current_date - interval '6 months'
        when '1Y' then current_date - interval '1 year'
        else current_date - interval '1 month'
    end;

    return query
    with days as (
        select generate_series(v_start_date, current_date, interval '1 day')::date as day
    ),
    cash as (
        select d.day, coalesce(wt.balance_after, 0) as cash_balance
        from days d
        left join lateral (
            select balance_after
            from public.wallet_transactions
            where wallet_id = v_wallet_id
              and created_at::date <= d.day
            order by created_at desc
            limit 1
        ) wt on true
    ),
    invested as (
        select
            d.day,
            coalesce(sum(
                case
                    -- not yet started as of this day: contributes nothing
                    when i.started_at is null or i.started_at::date > d.day then 0
                    -- cancelled before this day: contributes nothing
                    when i.status = 'cancelled'
                         and i.cancelled_at is not null
                         and i.cancelled_at::date <= d.day then 0
                    -- started but no maturity date set yet: principal only, no accrual
                    when i.matures_at is null then i.amount
                    else
                        i.amount + i.expected_profit * least(
                            1.0,
                            greatest(
                                0.0,
                                extract(epoch from (
                                    least(d.day::timestamptz + interval '1 day', i.matures_at)
                                    - i.started_at
                                )) / extract(epoch from (i.matures_at - i.started_at))
                            )
                        )
                end
            ), 0) as invested_value
        from days d
        left join public.investments i on i.wallet_id = v_wallet_id
        group by d.day
    )
    select c.day, (c.cash_balance + inv.invested_value) as total_value
    from cash c
    join invested inv on inv.day = c.day
    order by c.day;
end;
$$;

grant execute on function public.get_portfolio_history(uuid, text) to authenticated;