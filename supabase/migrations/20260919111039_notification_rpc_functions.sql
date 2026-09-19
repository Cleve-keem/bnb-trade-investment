-- =============================================================================
-- NOTIFICATION MUTATION RPCs
-- Direct UPDATE/DELETE on notifications is blocked by RLS (see policy file).
-- All mutations go through these, scoped to auth.uid() internally so a user
-- can never touch another user's row regardless of what id is passed in.
-- =============================================================================

create or replace function public.mark_notification_read(p_notification_id uuid)
returns public.notifications
language plpgsql
security definer
set search_path = public
as $$
declare
    v_notification public.notifications;
begin
    update public.notifications
    set is_read = true,
        read_at = timezone('utc', now())
    where id = p_notification_id
      and user_id = auth.uid()
    returning * into v_notification;

    if not found then
        raise exception 'Notification not found or access denied';
    end if;

    return v_notification;
end;
$$;

grant execute on function public.mark_notification_read(uuid) to authenticated;


create or replace function public.mark_all_notifications_read()
returns setof public.notifications
language plpgsql
security definer
set search_path = public
as $$
begin
    return query
    update public.notifications
    set is_read = true,
        read_at = timezone('utc', now())
    where user_id = auth.uid()
      and is_read = false
    returning *;
end;
$$;

grant execute on function public.mark_all_notifications_read() to authenticated;


create or replace function public.delete_notification(p_notification_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
    delete from public.notifications
    where id = p_notification_id
      and user_id = auth.uid();

    return found;
end;
$$;

grant execute on function public.delete_notification(uuid) to authenticated;


create or replace function public.clear_user_notifications()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
    v_count integer;
begin
    delete from public.notifications
    where user_id = auth.uid();

    get diagnostics v_count = row_count;
    return v_count;
end;
$$;

grant execute on function public.clear_user_notifications() to authenticated;