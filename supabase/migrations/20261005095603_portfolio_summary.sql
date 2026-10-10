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
    v_invested_value numeric;
    v_total_invested numeric;
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
        coalesce(sum(public.investment_current_value(i)), 0),
        coalesce(sum(i.amount) filter (where i.status <> 'cancelled'), 0)
    into v_invested_value, v_total_invested
    from public.investments i
    where i.wallet_id = v_wallet.id;

    return query
    select
        public.convert_from_usd(v_wallet.balance + v_invested_value, v_currency),
        public.convert_from_usd(v_wallet.balance, v_currency),
        public.convert_from_usd(v_wallet.balance - v_wallet.locked_balance, v_currency),
        public.convert_from_usd(v_invested_value, v_currency),
        public.convert_from_usd(v_total_invested, v_currency),
        public.convert_from_usd(v_invested_value - v_total_invested, v_currency),
        v_currency;
end;
$$;