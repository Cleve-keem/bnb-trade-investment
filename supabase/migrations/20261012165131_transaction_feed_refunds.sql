create or replace function public.transaction_feed()
returns table (
    entry_id uuid,
    source text,
    user_id uuid,
    reference text,
    entry_type text,
    description text,
    amount numeric,
    status text,
    occurred_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
    select
        t.id,
        'ledger'::text,
        w.user_id,
        t.reference,
        case t.transaction_type
            when 'deposit_credit'       then 'deposit'
            when 'withdrawal_debit'     then 'withdrawal'
            when 'withdrawal_reversal'  then 'withdrawal'
            when 'investment_debit'     then 'investment'
            when 'investment_return'    then 'return'
            when 'investment_refund'    then 'return'
            when 'profit_payout'        then 'return'
            when 'bonus'                then 'bonus'
            when 'referral_reward'      then 'bonus'
            else 'adjustment'
        end,
        coalesce(t.description, initcap(replace(t.transaction_type::text, '_', ' '))),
        t.amount,
        'completed'::text,
        t.created_at
    from public.wallet_transactions t
    join public.wallets w on w.id = t.wallet_id

    union all

    select
        r.id, 'withdrawal', r.user_id, r.reference, 'withdrawal',
        coalesce(r.asset, 'Crypto') || ' Withdrawal',
        -r.amount,
        case r.status when 'rejected' then 'failed' else 'pending' end,
        r.created_at
    from public.withdrawal_requests r
    where r.status in ('pending', 'approved', 'rejected')

    union all

    select
        d.id, 'deposit', d.user_id, d.reference, 'deposit',
        'Deposit',
        d.amount,
        case d.status when 'failed' then 'failed' else 'pending' end,
        d.created_at
    from public.deposit_requests d
    where d.status in ('pending', 'failed');
$$;

revoke all on function public.transaction_feed() from public, anon, authenticated;