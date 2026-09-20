create or replace function public.update_own_profile(
    p_full_name text,
    p_username text,
    p_phone text
)
returns public.users
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user public.users;
    v_full_name text := nullif(trim(p_full_name), '');
    v_username text := nullif(trim(p_username), '');
    v_phone text := nullif(trim(p_phone), '');
begin
    if auth.uid() is null then
        raise exception 'update_own_profile: unauthorized';
    end if;

    if v_full_name is null then
        raise exception 'Full name is required';
    end if;

    if v_username is not null and v_username !~ '^[a-zA-Z0-9_]{3,20}$' then
        raise exception 'Username must be 3-20 characters (letters, numbers, underscore only)';
    end if;

    begin
        update public.users
        set
            full_name = v_full_name,
            username = coalesce(v_username, username),
            phone = v_phone,
            updated_at = timezone('utc', now())
        where id = auth.uid()
        returning * into v_user;
    exception
        when unique_violation then
            raise exception 'That username is already taken';
    end;

    if not found then
        raise exception 'Profile not found';
    end if;

    perform public.log_audit(
        auth.uid(), 'update_profile', 'user', auth.uid(),
        jsonb_build_object('username', v_username, 'phone', v_phone)
    );

    return v_user;
end;
$$;

grant execute on function public.update_own_profile(text, text, text) to authenticated;