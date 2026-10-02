-- =============================================================================
-- request_deposit() — user submits a deposit for review
-- =============================================================================

create or replace function public.request_deposit(
    p_amount numeric,
    p_method public.deposit_method,
    p_proof_url text default null
)
returns public.deposit_requests
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid := auth.uid();
    v_wallet public.wallets;
    v_ref text := public.generate_reference('DEP');
    v_deposit public.deposit_requests;
begin
    if v_user_id is null then
        raise exception 'request_deposit: no authenticated user';
    end if;

    if p_amount <= 0 then
        raise exception 'request_deposit: amount must be greater than zero';
    end if;

    select * into v_wallet from public.wallets where user_id = v_user_id;
    if not found then
        raise exception 'request_deposit: wallet not found';
    end if;

    if v_wallet.status <> 'active' then
        raise exception 'request_deposit: wallet is not active';
    end if;

    insert into public.deposit_requests (
        user_id, wallet_id, reference, amount, method, status
    )
    values (
        v_user_id, v_wallet.id, v_ref, p_amount, p_method, 'pending'
    )
    returning * into v_deposit;

    perform public.log_audit(
        v_user_id, 'request_deposit', 'deposit_request', v_deposit.id,
        jsonb_build_object('amount', p_amount, 'method', p_method, 'reference', v_ref)
    );

    return v_deposit;
end;
$$;

grant execute on function public.request_deposit(numeric, public.deposit_method, text) to authenticated;


-- =============================================================================
-- admin_confirm_deposit() — credits the wallet, closes the request
-- =============================================================================

create or replace function public.admin_confirm_deposit(
    p_deposit_id uuid
)
returns public.deposit_requests
language plpgsql
security definer
set search_path = public
as $$
declare
    v_admin_id uuid := auth.uid();
    v_deposit public.deposit_requests;
begin
    if not public.is_admin() then
        raise exception 'admin_confirm_deposit: caller is not an admin';
    end if;

    select * into v_deposit from public.deposit_requests where id = p_deposit_id for update;
    if not found then
        raise exception 'admin_confirm_deposit: deposit % not found', p_deposit_id;
    end if;

    if v_deposit.status <> 'pending' then
        raise exception 'admin_confirm_deposit: deposit % is not pending (status=%)', p_deposit_id, v_deposit.status;
    end if;

    perform public.credit_wallet(
        v_deposit.wallet_id, v_deposit.amount, 'deposit_credit',
        v_deposit.reference, 'Deposit confirmed', v_admin_id
    );

    update public.deposit_requests
    set status = 'completed',
        decision_by = v_admin_id,
        decided_at = timezone('utc', now())
    where id = p_deposit_id
    returning * into v_deposit;

    perform public.create_notification(
        v_deposit.user_id, 'Deposit Confirmed',
        format('Your deposit of %s has been credited to your wallet.', v_deposit.amount),
        'wallet_credit'
    );

    perform public.log_audit(
        v_admin_id, 'admin_confirm_deposit', 'deposit_request', v_deposit.id,
        jsonb_build_object('amount', v_deposit.amount, 'reference', v_deposit.reference)
    );

    return v_deposit;
end;
$$;

grant execute on function public.admin_confirm_deposit(uuid) to authenticated;


-- =============================================================================
-- admin_reject_deposit() — closes the request, no wallet movement
-- =============================================================================

create or replace function public.admin_reject_deposit(
    p_deposit_id uuid,
    p_reason text
)
returns public.deposit_requests
language plpgsql
security definer
set search_path = public
as $$
declare
    v_admin_id uuid := auth.uid();
    v_deposit public.deposit_requests;
begin
    if not public.is_admin() then
        raise exception 'admin_reject_deposit: caller is not an admin';
    end if;

    if p_reason is null or trim(p_reason) = '' then
        raise exception 'admin_reject_deposit: a rejection reason is required';
    end if;

    select * into v_deposit from public.deposit_requests where id = p_deposit_id for update;
    if not found then
        raise exception 'admin_reject_deposit: deposit % not found', p_deposit_id;
    end if;

    if v_deposit.status <> 'pending' then
        raise exception 'admin_reject_deposit: deposit % is not pending (status=%)', p_deposit_id, v_deposit.status;
    end if;

    update public.deposit_requests
    set status = 'failed',
        rejection_reason = p_reason,
        decision_by = v_admin_id,
        decided_at = timezone('utc', now())
    where id = p_deposit_id
    returning * into v_deposit;

    perform public.create_notification(
        v_deposit.user_id, 'Deposit Rejected', p_reason, 'system'
    );

    perform public.log_audit(
        v_admin_id, 'admin_reject_deposit', 'deposit_request', v_deposit.id,
        jsonb_build_object('reason', p_reason)
    );

    return v_deposit;
end;
$$;

grant execute on function public.admin_reject_deposit(uuid, text) to authenticated;


-- =============================================================================
-- admin_list_deposits() — joined view for the admin table
-- =============================================================================

create or replace function public.admin_list_deposits()
returns table (
    deposit_id uuid,
    user_id uuid,
    full_name text,
    email citext,
    amount numeric,
    method public.deposit_method,
    status public.deposit_status,
    rejection_reason text,
    created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
    if not public.is_admin() then
        raise exception 'admin_list_deposits: caller is not an admin';
    end if;

    return query
    select d.id, d.user_id, u.full_name, u.email, d.amount, d.method,
           d.status, d.rejection_reason, d.created_at
    from public.deposit_requests d
    join public.users u on u.id = d.user_id
    order by d.created_at desc;
end;
$$;

grant execute on function public.admin_list_deposits() to authenticated;