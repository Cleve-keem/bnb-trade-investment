alter type public.wallet_transaction_type
  add value if not exists 'investment_refund';

create or replace function public.admin_list_investments()
returns table (
    investment_id uuid,
    reference text,
    user_id uuid,
    full_name text,
    email citext,
    plan_name text,
    amount numeric,
    roi_percentage numeric,
    expected_profit numeric,
    total_return numeric,
    duration_days integer,
    status public.investment_status,
    started_at timestamptz,
    matures_at timestamptz,
    completed_at timestamptz,
    cancelled_at timestamptz,
    created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
    if not public.is_admin() then
        raise exception 'admin_list_investments: caller is not an admin';
    end if;

    return query
    select
        i.id, i.reference, i.user_id, u.full_name, u.email,
        i.plan_name, i.amount, i.roi_percentage, i.expected_profit, i.total_return,
        i.duration_days, i.status, i.started_at, i.matures_at,
        i.completed_at, i.cancelled_at, i.created_at
    from public.investments i
    join public.users u on u.id = i.user_id
    order by i.created_at desc;
end;
$$;


create or replace function public.admin_cancel_investment(
    p_investment_id uuid,
    p_reason text default null
)
returns public.investments
language plpgsql
security definer
set search_path = public
as $$
declare
    v_admin_id uuid := auth.uid();
    v_inv public.investments;
    v_ref text;
begin
    if not public.is_admin() then
        raise exception 'admin_cancel_investment: caller is not an admin';
    end if;

    select * into v_inv
    from public.investments
    where id = p_investment_id
    for update;

    if not found then
        raise exception 'admin_cancel_investment: investment % not found', p_investment_id;
    end if;

    if v_inv.status <> 'active' then
        raise exception 'admin_cancel_investment: only active investments can be cancelled (status=%)', v_inv.status;
    end if;

    v_ref := public.generate_reference('INVREF');

    perform public.credit_wallet(
        v_inv.wallet_id,
        v_inv.amount,
        'investment_refund',
        v_ref,
        'Refund for cancelled investment ' || v_inv.reference,
        v_admin_id
    );

    update public.investments
    set status = 'cancelled',
        cancelled_at = timezone('utc', now()),
        updated_at = timezone('utc', now())
    where id = p_investment_id
    returning * into v_inv;

    perform public.create_notification(
        v_inv.user_id,
        'Investment Cancelled',
        format('Your investment %s was cancelled and %s was returned to your wallet.',
               v_inv.reference, v_inv.amount),
        'wallet_credit'
    );

    perform public.log_audit(
        v_admin_id, 'cancel_investment', 'investment', v_inv.id,
        jsonb_build_object(
            'amount_refunded', v_inv.amount,
            'reason', p_reason,
            'refund_reference', v_ref
        )
    );

    return v_inv;
end;
$$;

revoke all on function public.admin_list_investments() from public, anon;
revoke all on function public.admin_cancel_investment(uuid, text) from public, anon;
grant execute on function public.admin_list_investments() to authenticated;
grant execute on function public.admin_cancel_investment(uuid, text) to authenticated;

notify pgrst, 'reload schema';