-- =============================================================================
-- New enum values
-- Note: ADD VALUE must run and commit before the new value is used elsewhere
-- in the same migration on older Postgres; Supabase runs PG15+, where this
-- works fine within one migration file. Flagging in case you ever run this
-- against an older instance.
-- =============================================================================

alter type public.wallet_transaction_type add value if not exists 'deposit_credit';

create type public.deposit_method as enum (
    'bank_transfer',
    'card',
    'crypto'
);

create type public.deposit_status as enum (
    'pending',
    'completed',
    'failed'
);

-- =============================================================================
-- deposit_requests
-- Mirrors withdrawal_requests: users submit, admins confirm or reject.
-- Wallet is only credited on confirmation (admin_confirm_deposit), never on
-- insert -- a "Pending" deposit has NOT touched the wallet balance yet.
-- =============================================================================

create table if not exists public.deposit_requests (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references public.users(id)
        on delete cascade,

    wallet_id uuid not null
        references public.wallets(id)
        on delete restrict,

    reference text not null unique,

    amount numeric(18,2) not null check (amount > 0),

    currency char(3) not null default 'USD',

    method public.deposit_method not null,

    status public.deposit_status not null default 'pending',

    proof_url text, -- optional receipt/screenshot for bank transfers

    decision_by uuid
        references public.users(id)
        on delete set null,

    decided_at timestamptz,

    rejection_reason text,

    metadata jsonb not null default '{}'::jsonb,

    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),

    constraint deposit_requests_rejection_reason_required
        check (status <> 'failed' or rejection_reason is not null),

    constraint deposit_requests_decision_required
        check (status = 'pending' or (decision_by is not null and decided_at is not null))
);

comment on table public.deposit_requests is
'User deposit requests awaiting admin confirmation of receipt.';

create index if not exists deposit_requests_user_idx on public.deposit_requests(user_id);
create index if not exists deposit_requests_wallet_idx on public.deposit_requests(wallet_id);
create index if not exists deposit_requests_status_idx on public.deposit_requests(status);
create index if not exists deposit_requests_created_at_idx on public.deposit_requests(created_at desc);

drop trigger if exists deposit_requests_set_updated_at on public.deposit_requests;
create trigger deposit_requests_set_updated_at
before update on public.deposit_requests
for each row
execute function public.set_updated_at();

-- =============================================================================
-- RLS — same shape as withdrawal_requests
-- =============================================================================

alter table public.deposit_requests enable row level security;
alter table public.deposit_requests force row level security;

create policy "deposit_requests_select_own_or_admin"
on public.deposit_requests
for select
using (
    user_id = auth.uid()
    or public.is_admin()
);

-- No INSERT policy: users must call request_deposit().
-- No UPDATE policy: admins must call admin_confirm_deposit()/admin_reject_deposit().