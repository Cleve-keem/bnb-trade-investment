create or replace function public.get_my_transaction_detail(p_entry_id uuid)
returns table (
    entry_id uuid,
    source text,
    reference text,
    entry_type text,
    description text,
    amount numeric,
    status text,
    occurred_at timestamptz,
    currency text,
    balance_before numeric,
    balance_after numeric,
    asset text,
    network text,
    destination_address text,
    rejection_reason text,
    reviewed_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
    select
        f.entry_id, f.source, f.reference, f.entry_type, f.description,
        f.amount, f.status, f.occurred_at,
        coalesce(t.currency, wr.currency, dr.currency)::text,
        t.balance_before, t.balance_after,
        wr.asset, wr.network, wr.destination_address,
        coalesce(wr.rejection_reason, dr.rejection_reason),
        coalesce(wr.decided_at, dr.decided_at)
    from public.transaction_feed() f
    left join public.wallet_transactions t
           on f.source = 'ledger' and t.id = f.entry_id
    -- Pending/rejected withdrawals match directly; a completed withdrawal's
    -- ledger row links back to its request through withdrawal_request_id.
    left join public.withdrawal_requests wr
           on (f.source = 'withdrawal' and wr.id = f.entry_id)
           or (f.source = 'ledger' and wr.id = t.withdrawal_request_id)
    left join public.deposit_requests dr
           on f.source = 'deposit' and dr.id = f.entry_id
    where f.entry_id = p_entry_id
      and f.user_id = auth.uid()
    limit 1;
$$;

revoke all on function public.get_my_transaction_detail(uuid) from public, anon;
grant execute on function public.get_my_transaction_detail(uuid) to authenticated;

-- Make PostgREST pick up the new function right away
notify pgrst, 'reload schema';