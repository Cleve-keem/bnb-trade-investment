-- =============================================================================
-- 022_otp_functions.sql (revised — plaintext OTP, no hashing)
-- =============================================================================

-- =============================================================================
-- GENERATE OTP
-- =============================================================================

create or replace function public.generate_otp(
    p_user_id uuid,
    p_purpose public.otp_purpose,
    out o_otp_code text,
    out o_reference text
)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_expiry_minutes numeric;
begin
    if p_user_id is null then
        raise exception 'generate_otp: user id is required';
    end if;

    if not exists (
        select 1 from public.users where id = p_user_id
    ) then
        raise exception 'generate_otp: user not found';
    end if;

    --------------------------------------------------------------------------
    -- Invalidate previous unused OTPs for this purpose
    --------------------------------------------------------------------------
    update public.otp_verifications
    set verified_at = timezone('utc', now())
    where user_id = p_user_id
      and purpose = p_purpose
      and verified_at is null;

    --------------------------------------------------------------------------
    -- Generate random 6-digit code (kept as text so leading zeros survive)
    --------------------------------------------------------------------------
    o_otp_code :=
        lpad(
            (
                ('x' || encode(extensions.gen_random_bytes(4), 'hex'))::bit(32)::bigint
                % 1000000
            )::text,
            6,
            '0'
        );

    o_reference := public.generate_reference('OTP');

    v_expiry_minutes :=
        coalesce(public.get_setting_numeric('otp_expiry_minutes'), 10);

    --------------------------------------------------------------------------
    -- Store the plaintext code directly (intentional — no hashing)
    --------------------------------------------------------------------------
    insert into public.otp_verifications
    (
        user_id,
        otp_code,
        reference,
        purpose,
        expires_at
    )
    values
    (
        p_user_id,
        o_otp_code,
        o_reference,
        p_purpose,
        timezone('utc', now()) + make_interval(mins => v_expiry_minutes::int)
    );

    --------------------------------------------------------------------------
    -- Audit
    --------------------------------------------------------------------------
    perform public.log_audit(
        p_user_id,
        'generate_otp',
        'otp_verification',
        p_user_id,
        jsonb_build_object(
            'purpose', p_purpose,
            'reference', o_reference
        )
    );

    return;
end;
$$;

revoke all on function public.generate_otp(uuid, public.otp_purpose) from public;
grant execute on function public.generate_otp(uuid, public.otp_purpose) to service_role;


-- =============================================================================
-- VERIFY OTP
-- =============================================================================

create or replace function public.verify_otp(
    p_user_id uuid,
    p_purpose public.otp_purpose,
    p_code text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
    v_otp public.otp_verifications;
begin
    if auth.role() <> 'service_role'
        and auth.uid() is distinct from p_user_id then
        raise exception 'verify_otp: unauthorized';
    end if;

    if p_code is null or length(trim(p_code)) = 0 then
        return false;
    end if;

    --------------------------------------------------------------------------
    -- Lock latest active OTP
    --------------------------------------------------------------------------
    select *
    into v_otp
    from public.otp_verifications
    where user_id = p_user_id
      and purpose = p_purpose
      and verified_at is null
    order by created_at desc
    limit 1
    for update;

    if not found then
        return false;
    end if;

    --------------------------------------------------------------------------
    -- Expired
    --------------------------------------------------------------------------
    if v_otp.expires_at < timezone('utc', now()) then
        update public.otp_verifications
        set verified_at = timezone('utc', now())
        where id = v_otp.id;

        return false;
    end if;

    --------------------------------------------------------------------------
    -- Too many attempts already
    --------------------------------------------------------------------------
    if v_otp.attempts >= v_otp.max_attempts then
        return false;
    end if;

    --------------------------------------------------------------------------
    -- Invalid code — direct plaintext comparison
    --------------------------------------------------------------------------
    if trim(p_code) <> v_otp.otp_code then
        update public.otp_verifications
        set attempts = attempts + 1,
            verified_at = case
                when attempts + 1 >= max_attempts
                    then timezone('utc', now())
                else verified_at
            end
        where id = v_otp.id;

        perform public.log_audit(
            p_user_id,
            'verify_otp_failed',
            'otp_verification',
            v_otp.id,
            jsonb_build_object(
                'purpose', p_purpose,
                'attempts', v_otp.attempts + 1
            )
        );

        return false;
    end if;

    --------------------------------------------------------------------------
    -- Success
    --------------------------------------------------------------------------
    update public.otp_verifications
    set verified_at = timezone('utc', now()),
        is_used = true
    where id = v_otp.id;

    perform public.log_audit(
        p_user_id,
        'verify_otp_success',
        'otp_verification',
        v_otp.id,
        jsonb_build_object('purpose', p_purpose)
    );

    return true;
end;
$$;

revoke all on function public.verify_otp(uuid, public.otp_purpose, text) from public;
grant execute on function public.verify_otp(uuid, public.otp_purpose, text) to authenticated, service_role;

-- =============================================================================
-- PREPARE FIRST LOGIN OTP
-- =============================================================================

create or replace function public.prepare_first_login_otp(
    p_user_id uuid,
    out o_otp_code text,
    out o_reference text
)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_first_login boolean;
    v_email_verified_at timestamptz;
begin
    select first_login, email_verified_at
    into v_first_login, v_email_verified_at
    from public.users
    where id = p_user_id;

    if not found then
        raise exception 'User profile not found';
    end if;

    if v_email_verified_at is null then
        raise exception 'Email has not been verified';
    end if;

    if not v_first_login then
        raise exception 'First login has already been completed';
    end if;

    select o.o_otp_code, o.o_reference
    into o_otp_code, o_reference
    from public.generate_otp(p_user_id, 'login') as o;

    return;
end;
$$;

revoke all on function public.prepare_first_login_otp(uuid) from public;
grant execute on function public.prepare_first_login_otp(uuid) to service_role;