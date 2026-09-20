create or replace function public.investment_current_value(
    inv public.investments,
    p_asof timestamptz default timezone('utc', now())
)
returns numeric
language sql
stable
as $$
    select case
        when inv.started_at is null or inv.started_at > p_asof then 0
        when inv.status = 'cancelled'
             and inv.cancelled_at is not null
             and inv.cancelled_at <= p_asof then 0
        when inv.matures_at is null then inv.amount
        else inv.amount + inv.expected_profit * least(1.0, greatest(0.0,
            extract(epoch from (least(p_asof, inv.matures_at) - inv.started_at))
            / extract(epoch from (inv.matures_at - inv.started_at))
        ))
    end
$$;