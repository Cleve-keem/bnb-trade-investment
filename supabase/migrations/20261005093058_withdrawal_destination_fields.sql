-- =============================================================================
-- 029_withdrawal_destination_fields.sql
-- withdrawal_requests had nowhere to store the asset/network/address a
-- crypto withdrawal actually needs -- adding them as first-class columns
-- (not buried in metadata) since an admin has to read these reliably to
-- actually send funds.
-- =============================================================================

alter table public.withdrawal_requests
    add column if not exists asset text,
    add column if not exists network text,
    add column if not exists destination_address text;

comment on column public.withdrawal_requests.destination_address is
'Wallet address funds should be sent to. Required for crypto withdrawals.';

create or replace function public.request_withdrawal(
    p_amount numeric,
    p_asset text,
    p_network text,
    p_destination_address text
)
returns public.withdrawal_requests
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid := auth.uid();
    v_wallet public.wallets;
    v_spendable numeric;
    v_fee numeric;
    v_ref text := public.generate_reference('WD');
    v_req public.withdrawal_requests;
begin
    if v_user_id is null then
        raise exception 'request_withdrawal: no authenticated user';
    end if;

    if p_amount <= 0 then
        raise exception 'request_withdrawal: amount must be greater than zero';
    end if;

    if p_destination_address is null or trim(p_destination_address) = '' then
        raise exception 'request_withdrawal: destination address is required';
    end if;

    select * into v_wallet from public.wallets where user_id = v_user_id for update;
    if not found then
        raise exception 'request_withdrawal: wallet not found';
    end if;

    if v_wallet.status <> 'active' then
        raise exception 'request_withdrawal: wallet is not active';
    end if;

    v_spendable := v_wallet.balance - v_wallet.locked_balance;
    if p_amount > v_spendable then
        raise exception 'request_withdrawal: insufficient spendable balance. available: %, requested: %',
            v_spendable, p_amount;
    end if;

    v_fee := coalesce(public.get_setting_numeric('withdrawal_fee_flat'), 0);

    -- Reserve the funds. balance is untouched -- it only drops once an
    -- admin actually approves/completes this request.
    update public.wallets
    set locked_balance = locked_balance + p_amount,
        version = version + 1,
        updated_at = timezone('utc', now())
    where id = v_wallet.id;

    insert into public.withdrawal_requests (
        user_id, wallet_id, reference, amount, currency, status,
        asset, network, destination_address, metadata
    )
    values (
        v_user_id, v_wallet.id, v_ref, p_amount, v_wallet.currency, 'pending',
        p_asset, p_network, p_destination_address,
        jsonb_build_object('fee', v_fee)
    )
    returning * into v_req;

    perform public.create_notification(
        v_user_id, 'Withdrawal Requested',
        format('Your withdrawal request of %s is pending review.', p_amount),
        'wallet_debit'
    );

    perform public.log_audit(
        v_user_id, 'request_withdrawal', 'withdrawal_request', v_req.id,
        jsonb_build_object('amount', p_amount, 'asset', p_asset, 'network', p_network, 'reference', v_ref)
    );

    return v_req;
end;
$$;

grant execute on function public.request_withdrawal(numeric, text, text, text) to authenticated;