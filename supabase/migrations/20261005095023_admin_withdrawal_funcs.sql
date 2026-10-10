-- =============================================================================
-- 030_admin_withdrawal_functions.sql
-- =============================================================================

create or replace function public.admin_list_withdrawals()
returns table (
    withdrawal_id uuid,
    reference text,
    user_id uuid,
    full_name text,
    email citext,
    amount numeric,
    fee numeric,
    net_amount numeric,
    asset text,
    network text,
    destination_address text,
    status public.withdrawal_status,
    rejection_reason text,
    requested_at timestamptz,
    decided_at timestamptz,
    processed_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
    if not public.is_admin() then
        raise exception 'admin_list_withdrawals: caller is not an admin';
    end if;

    return query
    select
        w.id, w.reference, w.user_id, u.full_name, u.email,
        w.amount,
        coalesce((w.metadata->>'fee')::numeric, 0) as fee,
        w.amount - coalesce((w.metadata->>'fee')::numeric, 0) as net_amount,
        w.asset, w.network, w.destination_address,
        w.status, w.rejection_reason,
        w.created_at, w.decided_at, w.processed_at
    from public.withdrawal_requests w
    join public.users u on u.id = w.user_id
    order by w.created_at desc;
end;
$$;

grant execute on function public.admin_list_withdrawals() to authenticated;


-- =============================================================================
-- approve_withdrawal() — decision only, no money movement yet
-- =============================================================================

create or replace function public.approve_withdrawal(
    p_withdrawal_id uuid
)
returns public.withdrawal_requests
language plpgsql
security definer
set search_path = public
as $$
declare
    v_admin_id uuid := auth.uid();
    v_req public.withdrawal_requests;
begin
    if not public.is_admin() then
        raise exception 'approve_withdrawal: caller is not an admin';
    end if;

    select * into v_req from public.withdrawal_requests where id = p_withdrawal_id for update;
    if not found then
        raise exception 'approve_withdrawal: withdrawal % not found', p_withdrawal_id;
    end if;

    if v_req.status <> 'pending' then
        raise exception 'approve_withdrawal: withdrawal % is not pending (status=%)', p_withdrawal_id, v_req.status;
    end if;

    update public.withdrawal_requests
    set status = 'approved',
        decision_by = v_admin_id,
        decided_at = timezone('utc', now())
    where id = p_withdrawal_id
    returning * into v_req;

    perform public.create_notification(
        v_req.user_id, 'Withdrawal Approved',
        format('Your withdrawal of %s has been approved and is being processed.', v_req.amount),
        'withdrawal_approved'
    );

    perform public.log_audit(
        v_admin_id, 'approve_withdrawal', 'withdrawal_request', v_req.id,
        jsonb_build_object('amount', v_req.amount)
    );

    return v_req;
end;
$$;

grant execute on function public.approve_withdrawal(uuid) to authenticated;


-- =============================================================================
-- reject_withdrawal() — releases the lock, no debit, requires a reason
-- =============================================================================

create or replace function public.reject_withdrawal(
    p_withdrawal_id uuid,
    p_reason text
)
returns public.withdrawal_requests
language plpgsql
security definer
set search_path = public
as $$
declare
    v_admin_id uuid := auth.uid();
    v_req public.withdrawal_requests;
begin
    if not public.is_admin() then
        raise exception 'reject_withdrawal: caller is not an admin';
    end if;

    if p_reason is null or trim(p_reason) = '' then
        raise exception 'reject_withdrawal: a rejection reason is required';
    end if;

    select * into v_req from public.withdrawal_requests where id = p_withdrawal_id for update;
    if not found then
        raise exception 'reject_withdrawal: withdrawal % not found', p_withdrawal_id;
    end if;

    if v_req.status not in ('pending', 'approved') then
        raise exception 'reject_withdrawal: withdrawal % cannot be rejected (status=%)', p_withdrawal_id, v_req.status;
    end if;

    -- Release the reserved funds -- nothing was ever sent.
    update public.wallets
    set locked_balance = locked_balance - v_req.amount,
        version = version + 1,
        updated_at = timezone('utc', now())
    where id = v_req.wallet_id;

    update public.withdrawal_requests
    set status = 'rejected',
        rejection_reason = p_reason,
        decision_by = v_admin_id,
        decided_at = timezone('utc', now())
    where id = p_withdrawal_id
    returning * into v_req;

    perform public.create_notification(
        v_req.user_id, 'Withdrawal Rejected', p_reason, 'withdrawal_rejected'
    );

    perform public.log_audit(
        v_admin_id, 'reject_withdrawal', 'withdrawal_request', v_req.id,
        jsonb_build_object('reason', p_reason)
    );

    return v_req;
end;
$$;

grant execute on function public.reject_withdrawal(uuid, text) to authenticated;


-- =============================================================================
-- complete_withdrawal() — funds actually sent. Debits balance AND releases
-- the lock in one step, since the locked amount and the debited amount are
-- the same reserved funds settling, not two separate movements.
-- =============================================================================

create or replace function public.complete_withdrawal(
    p_withdrawal_id uuid
)
returns public.withdrawal_requests
language plpgsql
security definer
set search_path = public
as $$
declare
    v_admin_id uuid := auth.uid();
    v_req public.withdrawal_requests;
    v_wallet public.wallets;
    v_balance_before numeric(18,2);
    v_balance_after numeric(18,2);
begin
    if not public.is_admin() then
        raise exception 'complete_withdrawal: caller is not an admin';
    end if;

    select * into v_req from public.withdrawal_requests where id = p_withdrawal_id for update;
    if not found then
        raise exception 'complete_withdrawal: withdrawal % not found', p_withdrawal_id;
    end if;

    if v_req.status <> 'approved' then
        raise exception 'complete_withdrawal: withdrawal % must be approved first (status=%)', p_withdrawal_id, v_req.status;
    end if;

    select * into v_wallet from public.wallets where id = v_req.wallet_id for update;

    if v_wallet.locked_balance < v_req.amount then
        raise exception 'complete_withdrawal: locked balance inconsistent for wallet %', v_wallet.id;
    end if;

    v_balance_before := v_wallet.balance;
    v_balance_after := v_balance_before - v_req.amount;

    update public.wallets
    set balance = v_balance_after,
        locked_balance = locked_balance - v_req.amount,
        version = version + 1,
        updated_at = timezone('utc', now())
    where id = v_wallet.id;

    insert into public.wallet_transactions (
        wallet_id, amount, balance_before, balance_after, transaction_type,
        reference, description, currency, created_by, withdrawal_request_id
    )
    values (
        v_wallet.id, -v_req.amount, v_balance_before, v_balance_after, 'withdrawal_debit',
        v_req.reference, format('Withdrawal to %s', v_req.destination_address),
        v_wallet.currency, v_admin_id, v_req.id
    );

    update public.withdrawal_requests
    set status = 'completed',
        processed_at = timezone('utc', now())
    where id = p_withdrawal_id
    returning * into v_req;

    perform public.create_notification(
        v_req.user_id, 'Withdrawal Completed',
        format('%s has been sent to your %s address.', v_req.amount, v_req.asset),
        'withdrawal_approved'
    );

    perform public.log_audit(
        v_admin_id, 'complete_withdrawal', 'withdrawal_request', v_req.id,
        jsonb_build_object('amount', v_req.amount)
    );

    return v_req;
end;
$$;

grant execute on function public.complete_withdrawal(uuid) to authenticated;