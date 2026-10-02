create or replace function public.admin_list_wallets()
returns table (
    wallet_id uuid,
    user_id uuid,
    full_name text,
    email citext,
    balance numeric,
    locked_balance numeric,
    available_balance numeric,
    invested_balance numeric,
    status public.wallet_status,
    updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
    if not public.is_admin() then
        raise exception 'admin_list_wallets: caller is not an admin';
    end if;

    return query
    select
        w.id as wallet_id,
        w.user_id,
        u.full_name,
        u.email,
        w.balance,
        w.locked_balance,
        (w.balance - w.locked_balance) as available_balance,
        coalesce(inv.invested_sum, 0) as invested_balance,
        w.status,
        w.updated_at
    from public.wallets w
    join public.users u on u.id = w.user_id
    left join lateral (
        select sum(i.amount) as invested_sum
        from public.investments i
        where i.wallet_id = w.id
          and i.status = 'active'
    ) inv on true
    order by w.updated_at desc nulls last;
end;
$$;

grant execute on function public.admin_list_wallets() to authenticated;