create or replace function public.admin_adjust_wallet(
    p_wallet_id uuid,
    p_amount numeric,
    p_adjustment_type public.adjustment_type,
    p_reason text,
    p_notes text default null
)
returns public.admin_wallet_adjustments
language plpgsql
security definer
set search_path = public
as $$
declare
    v_admin_id uuid := auth.uid();
    v_txn uuid;
    v_adj public.admin_wallet_adjustments;
    v_reference text;
    v_user_id uuid;
begin

    /*
     * --------------------------------------------------------
     * Verify administrator
     * --------------------------------------------------------
     */
    if not public.is_admin() then
        raise exception
            'admin_adjust_wallet: caller is not an admin';
    end if;


    /*
     * --------------------------------------------------------
     * Validate amount
     * --------------------------------------------------------
     */
    if p_amount = 0 then
        raise exception
            'admin_adjust_wallet: amount must be non-zero';
    end if;


    /*
     * --------------------------------------------------------
     * Get wallet + user
     * --------------------------------------------------------
     */
    select user_id
    into v_user_id
    from public.wallets
    where id = p_wallet_id;

    if v_user_id is null then
        raise exception
            'admin_adjust_wallet: wallet % not found',
            p_wallet_id;
    end if;


    /*
     * --------------------------------------------------------
     * Generate adjustment reference
     * --------------------------------------------------------
     */
    v_reference := public.generate_reference('ADM');


    /*
     * --------------------------------------------------------
     * Credit / debit wallet
     * --------------------------------------------------------
     */
    if p_amount > 0 then

        v_txn := public.credit_wallet(
            p_wallet_id,
            p_amount,
            'admin_credit',
            v_reference,
            p_reason,
            v_admin_id
        );

    else

        v_txn := public.debit_wallet(
            p_wallet_id,
            abs(p_amount),
            'admin_debit',
            v_reference,
            p_reason,
            v_admin_id
        );

    end if;
    /*
     * --------------------------------------------------------
     * Create admin adjustment record
     * --------------------------------------------------------
     */
    insert into public.admin_wallet_adjustments (
        reference,
        wallet_transaction_id,
        wallet_id,
        user_id,
        admin_id,
        adjustment_type,
        reason,
        notes
    )
    values (
        v_reference,
        v_txn,
        p_wallet_id,
        v_user_id,
        v_admin_id,
        p_adjustment_type,
        p_reason,
        p_notes
    )
    returning *
    into v_adj;
    /*
     * --------------------------------------------------------
     * Notify user
     * --------------------------------------------------------
     */
    perform public.create_notification(
        v_user_id,
        case
            when p_amount > 0
                then 'Wallet Credited'
            else 'Wallet Debited'
        end,
        p_reason,
        case
            when p_amount > 0
                then 'wallet_credit'
            else 'wallet_debit'
        end::public.notification_type
    );
    /*
     * --------------------------------------------------------
     * Audit
     * --------------------------------------------------------
     */
    perform public.log_audit(
        v_admin_id,
        'admin_adjust_wallet',
        'wallet',
        p_wallet_id,
        jsonb_build_object(
            'amount', p_amount,
            'adjustment_type', p_adjustment_type,
            'reason', p_reason,
            'reference', v_reference
        )
    );


    return v_adj;

end;
$$;