-- =============================================================================
-- 011_otp_verifications.sql
-- Stores hashed One-Time Passwords (OTPs).
-- Plaintext OTPs must NEVER be stored.
-- OTPs are used for email verification, login, password reset, and
-- withdrawal confirmation.
-- =============================================================================

-- =============================================================================
-- Rename old column
-- =============================================================================

create table if not exists public.otp_verifications (

    id uuid primary key
        default gen_random_uuid(),

    user_id uuid not null
        references public.users(id)
        on delete cascade,

    reference citext
        not null
        unique,

    otp_code text
        not null,

    purpose public.otp_purpose
        not null,

    delivery_method public.otp_delivery_method
        not null
        default 'email',

    expires_at timestamptz
        not null,

    verified_at timestamptz,

    is_used boolean
        not null
        default false,

    attempts integer
        not null
        default 0
        check (attempts >= 0),

    max_attempts integer
        not null
        default 5
        check (max_attempts > 0),

    metadata jsonb
        not null
        default '{}'::jsonb,

    created_at timestamptz
        not null
        default timezone('utc', now()),

    updated_at timestamptz
        not null
        default timezone('utc', now()),

    constraint otp_used_requires_verified_at
        check (
            is_used = false
            or verified_at is not null
        ),

    constraint otp_attempts_limit
        check (
            attempts <= max_attempts
        )

);

-- =============================================================================
-- COMMENTS
-- =============================================================================

comment on table public.otp_verifications is
'Stores hashed OTPs used for authentication and account verification.';

-- comment on column public.otp_verifications.otp_code is
-- 'Hashed OTP value. Plaintext OTPs must never be stored.';

comment on column public.otp_verifications.otp_code is
'Stores the six-digit OTP code.';

comment on column public.otp_verifications.reference is
'Unique business reference for tracing OTP requests.';

comment on column public.otp_verifications.metadata is
'Additional OTP request information such as IP address or device.';

-- =============================================================================
-- INDEXES
-- =============================================================================

create index if not exists otp_user_purpose_active_idx
on public.otp_verifications(user_id, purpose, created_at desc)
where is_used = false;

create index if not exists otp_expires_at_idx
on public.otp_verifications(expires_at);