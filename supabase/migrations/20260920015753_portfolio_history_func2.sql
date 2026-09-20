create or replace function public.get_portfolio_summary(p_user_id uuid)
returns table (
    total_value numeric,
    cash_balance numeric,
    invested_value numeric,
    total_invested numeric,
    total_return numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_wallet_id uuid;
    v_cash numeric;
begin
    if auth.role() <> 'service_role'
        and auth.uid() is distinct from p_user_id then
        raise exception 'get_portfolio_summary: unauthorized';
    end if;

    select id, balance into v_wallet_id, v_cash
    from public.wallets
    where user_id = p_user_id;

    if v_wallet_id is null then
        raise exception 'Wallet not found for user';
    end if;

    return query
    select
        v_cash + coalesce(sum(public.investment_current_value(i)), 0) as total_value,
        v_cash as cash_balance,
        coalesce(sum(public.investment_current_value(i)), 0) as invested_value,
        coalesce(sum(i.amount) filter (where i.status <> 'cancelled'), 0) as total_invested,
        coalesce(sum(public.investment_current_value(i)), 0)
            - coalesce(sum(i.amount) filter (where i.status <> 'cancelled'), 0) as total_return
    from public.investments i
    where i.wallet_id = v_wallet_id;
end;
$$;

grant execute on function public.get_portfolio_summary(uuid) to authenticated;



create or replace function public.get_portfolio_holdings(p_user_id uuid)
returns table (
    investment_id uuid,
    plan_name text,
    amount numeric,
    current_value numeric,
    change_percentage numeric,
    allocation_percentage numeric,
    status public.investment_status
)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_wallet_id uuid;
    v_total_value numeric;
begin
    if auth.role() <> 'service_role'
        and auth.uid() is distinct from p_user_id then
        raise exception 'get_portfolio_holdings: unauthorized';
    end if;

    select id into v_wallet_id from public.wallets where user_id = p_user_id;
    if v_wallet_id is null then
        raise exception 'Wallet not found for user';
    end if;

    select coalesce(sum(public.investment_current_value(i)), 0)
    into v_total_value
    from public.investments i
    where i.wallet_id = v_wallet_id
      and i.status <> 'cancelled';

    return query
    select
        i.id,
        i.plan_name,
        i.amount,
        public.investment_current_value(i) as current_value,
        case when i.amount = 0 then 0
             else round(((public.investment_current_value(i) - i.amount) / i.amount) * 100, 2)
        end as change_percentage,
        case when v_total_value = 0 then 0
             else round((public.investment_current_value(i) / v_total_value) * 100, 2)
        end as allocation_percentage,
        i.status
    from public.investments i
    where i.wallet_id = v_wallet_id
      and i.status <> 'cancelled'
    order by public.investment_current_value(i) desc;
end;
$$;

grant execute on function public.get_portfolio_holdings(uuid) to authenticated;