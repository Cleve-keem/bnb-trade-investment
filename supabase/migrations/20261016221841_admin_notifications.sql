create table if not exists public.admin_notifications (
  id                uuid primary key default gen_random_uuid(),
  reference         text not null unique,
  title             text not null check (length(trim(title)) between 1 and 120),
  message           text not null check (length(trim(message)) between 1 and 1000),
  notification_type text not null check (notification_type in ('System', 'Security', 'Transaction', 'Promotion')),
  audience          text not null check (audience in ('All Users', 'Active Users', 'Admins')),
  status            text not null default 'draft' check (status in ('draft', 'sent')),
  recipients        integer not null default 0,
  created_by        uuid references public.users(id) on delete set null,
  created_at        timestamptz not null default timezone('utc', now()),
  sent_at           timestamptz,
  constraint admin_notifications_sent_has_time check (status <> 'sent' or sent_at is not null)
);

alter table public.admin_notifications enable row level security;
revoke all on public.admin_notifications from anon, authenticated;


-- Who is in each audience (internal)
create or replace function public.audience_user_ids(p_audience text)
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select u.id
  from public.users u
  where case p_audience
    when 'All Users'    then u.role = 'user' and u.status <> 'deleted'
    when 'Active Users' then u.role = 'user' and u.status = 'active'
                             and u.last_login_at > now() - interval '30 days'
    when 'Admins'       then u.role in ('admin', 'super_admin') and u.status = 'active'
    else false
  end;
$$;

revoke all on function public.audience_user_ids(text) from public, anon, authenticated;


create or replace function public.admin_list_notifications()
returns table (
  notification_id uuid,
  reference text,
  title text,
  message text,
  notification_type text,
  audience text,
  status text,
  recipients integer,
  created_at timestamptz,
  sent_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'admin_list_notifications: caller is not an admin';
  end if;

  return query
  select n.id, n.reference, n.title, n.message, n.notification_type, n.audience,
         n.status, n.recipients, n.created_at, n.sent_at
  from public.admin_notifications n
  order by n.created_at desc;
end;
$$;


create or replace function public.admin_send_notification(p_id uuid)
returns public.admin_notifications
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin uuid := auth.uid();
  v_row   public.admin_notifications;
  v_uid   uuid;
  v_count integer := 0;
begin
  if not public.is_admin() then
    raise exception 'admin_send_notification: caller is not an admin';
  end if;

  select * into v_row from public.admin_notifications where id = p_id for update;
  if not found then
    raise exception 'That notification no longer exists';
  end if;
  if v_row.status <> 'draft' then
    raise exception 'This notification has already been sent';
  end if;

  for v_uid in select public.audience_user_ids(v_row.audience) loop
    perform public.create_notification(v_uid, v_row.title, v_row.message, 'system');
    v_count := v_count + 1;
  end loop;

  update public.admin_notifications
  set status = 'sent', recipients = v_count, sent_at = timezone('utc', now())
  where id = p_id
  returning * into v_row;

  perform public.log_audit(
    v_admin, 'send_notification', 'admin_notification', v_row.id,
    jsonb_build_object('title', v_row.title, 'audience', v_row.audience, 'recipients', v_count)
  );

  return v_row;
end;
$$;


create or replace function public.admin_create_notification(
  p_title text,
  p_message text,
  p_type text,
  p_audience text,
  p_send boolean default false
)
returns public.admin_notifications
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin   uuid := auth.uid();
  v_title   text := trim(coalesce(p_title, ''));
  v_message text := trim(coalesce(p_message, ''));
  v_row     public.admin_notifications;
begin
  if not public.is_admin() then
    raise exception 'admin_create_notification: caller is not an admin';
  end if;
  if v_title = '' or length(v_title) > 120 then
    raise exception 'Title must be 1 to 120 characters';
  end if;
  if v_message = '' or length(v_message) > 1000 then
    raise exception 'Message must be 1 to 1000 characters';
  end if;
  if p_type not in ('System', 'Security', 'Transaction', 'Promotion') then
    raise exception 'Invalid notification type';
  end if;
  if p_audience not in ('All Users', 'Active Users', 'Admins') then
    raise exception 'Invalid audience';
  end if;

  insert into public.admin_notifications (
    reference, title, message, notification_type, audience, recipients, created_by
  )
  values (
    public.generate_reference('NOT'), v_title, v_message, p_type, p_audience,
    (select count(*) from public.audience_user_ids(p_audience)), v_admin
  )
  returning * into v_row;

  if p_send then
    return public.admin_send_notification(v_row.id);
  end if;

  return v_row;
end;
$$;


create or replace function public.admin_delete_notification(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin uuid := auth.uid();
  v_title text;
begin
  if not public.is_admin() then
    raise exception 'admin_delete_notification: caller is not an admin';
  end if;

  delete from public.admin_notifications
  where id = p_id and status = 'draft'
  returning title into v_title;

  if not found then
    raise exception 'Only drafts can be deleted';
  end if;

  perform public.log_audit(
    v_admin, 'delete_notification', 'admin_notification', p_id,
    jsonb_build_object('title', v_title)
  );
end;
$$;

revoke all on function public.admin_list_notifications() from public, anon;
revoke all on function public.admin_send_notification(uuid) from public, anon;
revoke all on function public.admin_create_notification(text, text, text, text, boolean) from public, anon;
revoke all on function public.admin_delete_notification(uuid) from public, anon;
grant execute on function public.admin_list_notifications() to authenticated;
grant execute on function public.admin_send_notification(uuid) to authenticated;
grant execute on function public.admin_create_notification(text, text, text, text, boolean) to authenticated;
grant execute on function public.admin_delete_notification(uuid) to authenticated;

notify pgrst, 'reload schema';