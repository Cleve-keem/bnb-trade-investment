create or replace function public.send_my_support_message(p_body text)
returns public.support_messages
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_body text := trim(coalesce(p_body, ''));
  v_conv public.support_conversations;
  v_msg  public.support_messages;
begin
  if v_user is null then
    raise exception 'send_my_support_message: no authenticated user';
  end if;

  if v_body = '' or length(v_body) > 2000 then
    raise exception 'send_my_support_message: message must be 1 to 2000 characters';
  end if;

  if not exists (select 1 from public.users where id = v_user and status = 'active') then
    raise exception 'send_my_support_message: account is not active';
  end if;

  insert into public.support_conversations (user_id, last_message_at, last_message_preview)
  values (v_user, timezone('utc', now()), left(v_body, 120))
  on conflict (user_id) do update
    set status = 'open',
        last_message_at = excluded.last_message_at,
        last_message_preview = excluded.last_message_preview
  returning * into v_conv;

  insert into public.support_messages (conversation_id, user_id, sender_id, sender_role, body)
  values (v_conv.id, v_user, v_user, 'user', v_body)
  returning * into v_msg;

  return v_msg;
end;
$$;


-- USER: mark admin replies as read
create or replace function public.mark_my_support_read()
returns void
language sql
security definer
set search_path = public
as $$
  update public.support_messages
  set read_at = timezone('utc', now())
  where user_id = auth.uid()
    and sender_role = 'admin'
    and read_at is null;
$$;


-- ADMIN: inbox
create or replace function public.admin_list_support_conversations()
returns table (
  conversation_id uuid,
  user_id uuid,
  full_name text,
  email citext,
  status text,
  last_message_at timestamptz,
  last_message_preview text,
  unread_count bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'admin_list_support_conversations: caller is not an admin';
  end if;

  return query
  select
    c.id, c.user_id, u.full_name, u.email, c.status,
    c.last_message_at, c.last_message_preview,
    (select count(*) from public.support_messages m
      where m.conversation_id = c.id
        and m.sender_role = 'user'
        and m.read_at is null)
  from public.support_conversations c
  join public.users u on u.id = c.user_id
  order by c.last_message_at desc;
end;
$$;


-- ADMIN: reply
create or replace function public.admin_reply_support(
  p_conversation_id uuid,
  p_body text
)
returns public.support_messages
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin uuid := auth.uid();
  v_body  text := trim(coalesce(p_body, ''));
  v_conv  public.support_conversations;
  v_msg   public.support_messages;
begin
  if not public.is_admin() then
    raise exception 'admin_reply_support: caller is not an admin';
  end if;

  if v_body = '' or length(v_body) > 2000 then
    raise exception 'admin_reply_support: message must be 1 to 2000 characters';
  end if;

  select * into v_conv from public.support_conversations
  where id = p_conversation_id for update;
  if not found then
    raise exception 'admin_reply_support: conversation not found';
  end if;

  insert into public.support_messages (conversation_id, user_id, sender_id, sender_role, body)
  values (v_conv.id, v_conv.user_id, v_admin, 'admin', v_body)
  returning * into v_msg;

  update public.support_conversations
  set status = 'open',
      last_message_at = v_msg.created_at,
      last_message_preview = left(v_body, 120)
  where id = v_conv.id;

  perform public.create_notification(
    v_conv.user_id, 'New support reply', left(v_body, 120), 'system'
  );

  return v_msg;
end;
$$;


-- ADMIN: mark the customer's messages as read
create or replace function public.admin_mark_support_read(p_conversation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'admin_mark_support_read: caller is not an admin';
  end if;

  update public.support_messages
  set read_at = timezone('utc', now())
  where conversation_id = p_conversation_id
    and sender_role = 'user'
    and read_at is null;
end;
$$;


-- ADMIN: resolve / reopen
create or replace function public.admin_set_support_status(
  p_conversation_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'admin_set_support_status: caller is not an admin';
  end if;

  if p_status not in ('open', 'closed') then
    raise exception 'admin_set_support_status: invalid status';
  end if;

  update public.support_conversations set status = p_status where id = p_conversation_id;
end;
$$;


revoke all on function public.send_my_support_message(text) from public, anon;
revoke all on function public.mark_my_support_read() from public, anon;
revoke all on function public.admin_list_support_conversations() from public, anon;
revoke all on function public.admin_reply_support(uuid, text) from public, anon;
revoke all on function public.admin_mark_support_read(uuid) from public, anon;
revoke all on function public.admin_set_support_status(uuid, text) from public, anon;

grant execute on function public.send_my_support_message(text) to authenticated;
grant execute on function public.mark_my_support_read() to authenticated;
grant execute on function public.admin_list_support_conversations() to authenticated;
grant execute on function public.admin_reply_support(uuid, text) to authenticated;
grant execute on function public.admin_mark_support_read(uuid) to authenticated;
grant execute on function public.admin_set_support_status(uuid, text) to authenticated;

notify pgrst, 'reload schema';