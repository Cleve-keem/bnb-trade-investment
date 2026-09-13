drop function if exists public.generate_otp(uuid, public.otp_purpose);

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
    v_expiry_minutes := coalesce(public.get_setting_numeric('otp_expiry_minutes'), 10);

    --------------------------------------------------------------------------
    -- One row per (user_id, purpose): insert on first request, overwrite in
    -- place on every request after. Atomic, so two concurrent requests for
    -- the same user+purpose can't both "win" and leave two active rows.
    --------------------------------------------------------------------------
    insert into public.otp_verifications
        (user_id, otp_code, reference, purpose, expires_at,
         attempts, is_used, verified_at, created_at, updated_at)
    values
        (p_user_id, o_otp_code, o_reference, p_purpose,
         timezone('utc', now()) + make_interval(mins => v_expiry_minutes::int),
         0, false, null, timezone('utc', now()), timezone('utc', now()))
    on conflict (user_id, purpose) do update
    set otp_code    = excluded.otp_code,
        reference   = excluded.reference,
        expires_at  = excluded.expires_at,
        attempts    = 0,
        is_used     = false,
        verified_at = null,
        created_at  = excluded.created_at,
        updated_at  = excluded.updated_at;

    perform public.log_audit(
        p_user_id, 'generate_otp', 'otp_verification', p_user_id,
        jsonb_build_object('purpose', p_purpose, 'reference', o_reference)
    );

    return;
end;
$$;

revoke all on function public.generate_otp(uuid, public.otp_purpose) from public;
grant execute on function public.generate_otp(uuid, public.otp_purpose) to service_role;

-- verify otp
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

    -- At most one row can exist per (user_id, purpose) now — direct lookup,
    -- no ordering needed.
    select * into v_otp
    from public.otp_verifications
    where user_id = p_user_id and purpose = p_purpose
    for update;

    if not found then
        return false;
    end if;

    if v_otp.is_used or v_otp.verified_at is not null then
        return false; -- already consumed
    end if;

    if v_otp.expires_at < timezone('utc', now()) then
        update public.otp_verifications
        set verified_at = timezone('utc', now())
        where id = v_otp.id;
        return false;
    end if;

    if v_otp.attempts >= v_otp.max_attempts then
        return false;
    end if;

    if trim(p_code) <> v_otp.otp_code then
        update public.otp_verifications
        set attempts = attempts + 1,
            verified_at = case when attempts + 1 >= max_attempts
                               then timezone('utc', now())
                               else verified_at end
        where id = v_otp.id;

        perform public.log_audit(
            p_user_id, 'verify_otp_failed', 'otp_verification', v_otp.id,
            jsonb_build_object('purpose', p_purpose, 'attempts', v_otp.attempts + 1)
        );
        return false;
    end if;

    update public.otp_verifications
    set verified_at = timezone('utc', now()), is_used = true
    where id = v_otp.id;

    perform public.log_audit(
        p_user_id, 'verify_otp_success', 'otp_verification', v_otp.id,
        jsonb_build_object('purpose', p_purpose)
    );
    return true;
end;
$$;

revoke all on function public.verify_otp(uuid, public.otp_purpose, text) from public;
grant execute on function public.verify_otp(uuid, public.otp_purpose, text) to authenticated, service_role;